"""Period validation and reproducible comparison rules for US-008."""
from datetime import date, timedelta
from decimal import Decimal
import math
from fastapi import HTTPException
from sqlalchemy import func
from app.models.ruta import Ruta
from app.models.sustainability import SustainabilitySettings, RouteSnapshot


def comparison_period(desde: date, hasta: date):
    if hasta < desde:
        raise ValueError('La fecha final debe ser igual o posterior a la inicial')
    days = (hasta - desde).days + 1
    if days > 366:
        raise ValueError('Selecciona un periodo de hasta 366 días')
    return desde - timedelta(days=days), desde - timedelta(days=1)


def percentage_change(current, previous):
    """No comparable historical baseline means 0%, per acceptance criteria."""
    current, previous = Decimal(str(current)), Decimal(str(previous))
    if not current.is_finite() or not previous.is_finite():
        raise ValueError('Las métricas deben ser finitas')
    if previous == 0:
        return Decimal('0.00')
    return ((current - previous) / previous * 100).quantize(Decimal('0.01'))


def configuration(db):
    row = db.get(SustainabilitySettings, 'current')
    return row.data if row else None


def capture_snapshot(db, route):
    """Freeze factors on first execution; preserve them when settings change."""
    key = str(route.ruta_id)
    snapshot = db.get(RouteSnapshot, key)
    if snapshot:
        return snapshot.data
    vehicle = route.vehiculo
    data = {'config': configuration(db), 'combustible': vehicle.tipo_combustible,
            'consumo_km_gal': float(vehicle.consumo_km_gal),
            'confirmado_km': 0, 'confirmado_co2_kg': 0,
            'tramos_contados': [], 'origen': 'Estimaciones de itinerario OSRM; no medición de combustible ni odómetro'}
    db.add(RouteSnapshot(id=key, data=data))
    db.flush()
    return data


def preserve_completed_legs(db, route, tramos):
    """Before replacement, retain completed prefix exactly once per leg ID."""
    from app.models.pedido import Pedido
    capture_snapshot(db, route)
    row = db.get(RouteSnapshot, str(route.ruta_id))
    data = dict(row.data)
    ids = set(data['tramos_contados'])
    last = -1
    for index, leg in enumerate(tramos):
        order = db.get(Pedido, leg.pedido_id) if leg.pedido_id else None
        if order and order.estado in ('ENTREGADO', 'NO_ENTREGADO'):
            last = index
    for leg in tramos[:last + 1]:
        if str(leg.tramo_id) not in ids:
            data['confirmado_km'] += float(leg.distancia_tramo_km)
            data['confirmado_co2_kg'] += float(leg.co2_tramo_kg)
            ids.add(str(leg.tramo_id))
    data['tramos_contados'] = sorted(ids)
    row.data = data
    db.flush()


def totals(db, desde, hasta, *, routes=None, snapshots=None):
    # Only completed operations enter report totals. Current route is counted once.
    if routes is None:
        routes = db.query(Ruta).filter(Ruta.fecha_operacion >= desde, Ruta.fecha_operacion <= hasta,
                                       Ruta.estado == 'COMPLETADA').all()
    result = {'rutas': len(routes), 'distancia_km': 0., 'co2_kg': 0., 'consumo_gal': 0.,
              'energia_kwh': 0., 'costo_pen': 0., 'parametros_incompletos': 0}
    details = []
    if snapshots is None:
        snapshots = {r.id: r.data for r in db.query(RouteSnapshot).filter(
            RouteSnapshot.id.in_([str(r.ruta_id) for r in routes])).all()} if routes else {}
    for route in routes:
        snap = snapshots.get(str(route.ruta_id))
        km = float(route.distancia_total_km) + (snap or {}).get('confirmado_km', 0)
        co2 = float(route.co2_total_kg) + (snap or {}).get('confirmado_co2_kg', 0)
        cost = gallons = energy = None
        cfg = (snap or {}).get('config')
        if snap and cfg and cfg['vigencia'] <= route.fecha_operacion.isoformat():
            if snap['combustible'] == 'ELECTRICO':
                gallons = 0.
                if cfg.get('consumo_electrico_kwh_km') and cfg.get('precio_kwh'):
                    energy = km * cfg['consumo_electrico_kwh_km']
                    cost = energy * cfg['precio_kwh']
            elif snap['consumo_km_gal'] > 0:
                gallons = km / snap['consumo_km_gal']
                energy = 0.
                price = cfg['precios_por_galon'].get(snap['combustible'])
                if price is not None:
                    cost = gallons * price
        result['distancia_km'] += km
        result['co2_kg'] += co2
        result['consumo_gal'] += gallons or 0
        result['energia_kwh'] += energy or 0
        result['costo_pen'] += cost or 0
        if cost is None:
            result['parametros_incompletos'] += 1
        details.append({'ruta_id': str(route.ruta_id), 'fecha': str(route.fecha_operacion),
                        'distancia_km': round(km, 2), 'co2_kg': round(co2, 2),
                        'costo_pen': round(cost, 2) if cost is not None else None,
                        'parametros': snap})
    if result['parametros_incompletos']:
        result['costo_pen'] = result['consumo_gal'] = result['energia_kwh'] = None
    return {k: round(v, 2) if isinstance(v, float) else v for k, v in result.items()}, details


def summary(db, desde, hasta):
    start, end = comparison_period(desde, hasta)
    # Fetch both periods together to avoid repeated round trips to hosted Postgres.
    routes = db.query(Ruta).filter(Ruta.fecha_operacion >= start, Ruta.fecha_operacion <= hasta).all()
    completed = [r for r in routes if r.estado == 'COMPLETADA']
    snapshots = {r.id: r.data for r in db.query(RouteSnapshot).filter(
        RouteSnapshot.id.in_([str(r.ruta_id) for r in completed])).all()} if completed else {}
    current, details = totals(db, desde, hasta,
        routes=[r for r in completed if desde <= r.fecha_operacion <= hasta], snapshots=snapshots)
    previous, _ = totals(db, start, end,
        routes=[r for r in completed if start <= r.fecha_operacion <= end], snapshots=snapshots)
    changes = {key: float(percentage_change(current[key], previous[key]))
               if current[key] is not None and previous[key] is not None else None
               for key in ('distancia_km', 'co2_kg', 'costo_pen')}
    from collections import Counter
    states = dict(Counter(r.estado for r in routes if desde <= r.fecha_operacion <= hasta))
    # A negative saving is a cost increase; missing factors must not become zero.
    saving = (round(previous['costo_pen'] - current['costo_pen'], 2)
              if current['costo_pen'] is not None and previous['costo_pen'] is not None
              else None)
    if not previous['rutas']:
        saving = 0 if current['costo_pen'] is not None else None
    return {'desde': str(desde), 'hasta': str(hasta), 'totales': current,
            'anterior': previous, 'variacion_porcentaje': changes, 'estados': states,
            'ahorro_monetario_pen': saving,
            'ahorro_co2_kg': round(previous['co2_kg'] - current['co2_kg'], 2) if previous['rutas'] else 0,
            'detalle': details, 'metodologia': 'Estimaciones de rutas completadas; comparación con periodo anterior de igual duración. No son mediciones físicas ni ahorro causal atribuible al optimizador.'}


def compensation(db, report, distribution):
    cfg = configuration(db)
    if not cfg:
        raise HTTPException(409, 'Configura los factores y proyectos de compensación')
    if cfg['vigencia'] > report['hasta']:
        raise HTTPException(409, 'Los factores no están vigentes para este periodo')
    projects = {p['id']: p['nombre'] for p in cfg['proyectos']}
    if not distribution or set(distribution) - projects.keys() or abs(sum(distribution.values()) - 100) > .00001:
        raise HTTPException(422, 'Distribuye exactamente 100 % entre proyectos existentes')
    co2 = report['totales']['co2_kg']
    trees = math.ceil(co2 / cfg['kg_por_arbol'])
    allocations = {key: math.floor(trees * value / 100) for key, value in distribution.items()}
    remainder = trees - sum(allocations.values())
    ordered = sorted(distribution, key=lambda key: (-(trees * distribution[key] / 100 - allocations[key]), key))
    for key in ordered[:remainder]:
        allocations[key] += 1
    return {'desde': report['desde'], 'hasta': report['hasta'], 'co2_kg': co2,
            'creditos': round(co2 / cfg['kg_por_credito'], 6), 'arboles': trees,
            'parametros': cfg, 'proyectos': [{'id': key, 'nombre': projects[key],
                'porcentaje': value, 'arboles': allocations[key]} for key, value in distribution.items()],
            'aviso': 'Propuesta estimada; no acredita compra, retiro de créditos ni árboles plantados.'}
