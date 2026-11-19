"""Shared feasibility checks for initial planning and dynamic replanning."""
import json
import time
import math
from datetime import date
from fastapi import HTTPException
from sqlalchemy import or_
from app.models.ruta import Ruta
from app.models.tramo import Tramo
from app.models.pedido import Pedido
from app.models.vehiculo import Vehiculo
from app.models.conductor import Conductor
from app.models.deposito import Deposito
from app.models.route_update import RouteUpdate
from app.schemas.ruta import RutaOptimizarResponse, ReoptimizarRutaResponse, RutaOptimizarRequest
from app.services.road_service import RoadService, RoadUnavailable
from app.services.measurement import measured


def minutes(value):
    return value.hour * 60 + value.minute + value.second / 60


def emission(vehicle):
    # Zero is a valid factor for electric vehicles.
    return float(vehicle.factor_emision_co2) if vehicle.factor_emision_co2 is not None else .27


def access_reason(order, vehicle):
    restriction = order.restriccion_acceso or "LIBRE_ACCESO"
    if restriction == "ZONA_PEATONAL":
        return "Entrega peatonal: coordine un punto de descarga accesible"
    if restriction == "ALTURA_MAXIMA_2_5M" and (vehicle.altura_m is None or float(vehicle.altura_m) > 2.5):
        return "Acceso de 2.5 m: registre una altura vehicular compatible"
    if restriction in ("SOLO_VEHICULOS_LIGEROS", "NO_CAMIONES_PESADOS") and vehicle.es_ligero is not True:
        return "El cliente requiere un vehículo ligero verificado"
    return None


def schedule(orders, vehicle, driver, start, departure, road, blocked=(), traffic=(), return_to=None, used_hours=None, continuous=0):
    """Build one complete feasible tour, including waiting, unloading, breaks and return."""
    from app.services.routing_service import RoutingService, ZBE_CENTRO_HISTORICO
    if sum(float(p.peso_kg) for p in orders) > float(vehicle.capacidad_peso_kg) * .9:
        raise ValueError("Exceso de capacidad")
    if sum(float(p.volumen_m3) for p in orders) > float(vehicle.capacidad_volumen_m3) * .9:
        raise ValueError("Exceso de capacidad")
    zones = list(blocked)
    if "DIESEL" in str(vehicle.tipo_combustible).upper():
        zones.append(ZBE_CENTRO_HISTORICO)
    position, elapsed = start, 0.
    rows = [dict(tipo_parada="DEPOSITO_SALIDA", pedido_id=None, descripcion="Inicio del recorrido",
        latitud=start[1], longitud=start[0], distancia_tramo_km=0, tiempo_estimado_min=0, co2_tramo_kg=0)]
    for order in [*orders, None]:
        if order:
            reason = access_reason(order, vehicle)
            if reason:
                raise ValueError(reason)
            lat, lng = RoutingService._extract_coords(order)
            destination = [lng, lat]
        else:
            destination = return_to or start
        leg = road.leg(position, destination, zones, traffic)
        # A single leg longer than 4.5h needs intermediate safe stops, not a fictitious depot break.
        if leg.minutes > 270:
            raise ValueError("Tramo superior a 4.5 h: requiere un punto intermedio de descanso")
        if continuous + leg.minutes >= 270:
            rows.append(dict(tipo_parada="DESCANSO_TECNICO_30MIN", pedido_id=None,
                descripcion="Descanso Técnico (Ley N° 30224): 30 min", latitud=position[1], longitud=position[0],
                distancia_tramo_km=0, tiempo_estimado_min=30, co2_tramo_kg=0))
            elapsed += 30
            continuous = 0
        wait = 0
        if order:
            arrival = departure + elapsed + leg.minutes
            wait = max(0, minutes(order.ventana_inicio) - arrival)
            if arrival + wait + 12 > minutes(order.ventana_fin):
                raise ValueError("No se puede completar la entrega dentro de su ventana horaria")
        duration = leg.minutes + wait + (12 if order else 0)
        from shapely.geometry import LineString, Polygon
        from app.services.routing_service import CATALOGO_ZONAS_RIESGO
        crossed = next((z for z in CATALOGO_ZONAS_RIESGO if z['nivel_peligro'] != 'ZBE_AMBIENTAL'
            and LineString(leg.coordinates).intersects(Polygon(z['poligono']))), None)
        risk, risk_name = crossed is not None, crossed['nombre'] if crossed else None
        rows.append(dict(tipo_parada="ENTREGA" if order else "DEPOSITO_RETORNO",
            pedido_id=order.pedido_id if order else None,
            descripcion=f"Entrega: {order.codigo_seguimiento} - {order.cliente_nombre}" if order else "Retorno al depósito",
            latitud=destination[1], longitud=destination[0], distancia_tramo_km=leg.distance,
            tiempo_estimado_min=duration, co2_tramo_kg=leg.distance * emission(vehicle),
            alerta_zona_riesgo=risk, nombre_zona_riesgo=risk_name,
            geometria_linea_geojson=json.dumps({"type": "LineString", "coordinates": leg.coordinates})))
        elapsed += duration
        continuous += leg.minutes
        position = destination
    used = float(driver.horas_conduccion_hoy or 0) if used_hours is None else used_hours
    if used * 60 + elapsed > 480 + .001:
        raise ValueError("La ruta supera las 8 horas disponibles del conductor, incluyendo retorno y esperas")
    return rows


def objective(rows, request):
    return sum(r["distancia_tramo_km"] * request.peso_distancia + r["tiempo_estimado_min"] / 60 * request.peso_tiempo
        + r["co2_tramo_kg"] * request.peso_co2 for r in rows)


def select_assignments(orders, vehicles, drivers, origin, request, road, operation):
    """Search feasible tours before reserving resources; maximize delivered order count.

    Every extension tries every insertion position and every free resource pairing.
    A timeout aborts the transaction rather than publishing an unverified maximum.
    """
    reasons, cache, seen = {}, {}, set()
    deadline = time.monotonic() + 35
    best, best_count, best_cost = [], 0, float('inf')
    ordered = sorted(orders, key=lambda p:(float(p.peso_kg),float(p.volumen_m3),p.ventana_fin))

    def feasible(vi, di, sequence):
        key = vi, di, tuple(p.pedido_id for p in sequence)
        if key in cache:
            return cache[key]
        vehicle, driver = vehicles[vi], drivers[di]
        if (sum(float(p.peso_kg) for p in sequence) > float(vehicle.capacidad_peso_kg)*request.factor_capacidad_max
            or sum(float(p.volumen_m3) for p in sequence) > float(vehicle.capacidad_volumen_m3)*request.factor_capacidad_max):
            for p in sequence: reasons[p.pedido_id] = 'No Asignados por Exceso de Capacidad'
            cache[key] = None
            return None
        road.distance_weight = request.peso_distancia + request.peso_co2*emission(vehicle)
        road.time_weight = request.peso_tiempo/60
        try:
            rows = schedule(sequence,vehicle,driver,origin,minutes(request.hora_salida),road,
                used_hours=None if operation == date.today() else 0)
        except RoadUnavailable:
            raise
        except ValueError as exc:
            for p in sequence: reasons[p.pedido_id] = str(exc)
            rows = None
        cache[key] = rows
        return rows

    def visit(plans, remaining):
        nonlocal best, best_count, best_cost
        if time.monotonic() > deadline:
            raise RoadUnavailable('No se pudo verificar el máximo de pedidos en 35 segundos. Reduzca el lote o use un servidor vial dedicado; no se guardaron asignaciones parciales.')
        key = tuple(sorted((vi,di,tuple(str(p.pedido_id) for p in seq)) for vi,di,seq,rows in plans))
        if key in seen: return False
        seen.add(key)
        count = len(orders)-len(remaining)
        cost = sum(objective(rows,request) for vi,di,seq,rows in plans)
        if count > best_count or count == best_count and cost < best_cost:
            best, best_count, best_cost = list(plans), count, cost
        if not remaining: return True  # All orders assigned: maximum count is proven.
        used_vehicles = {p[0] for p in plans}
        used_drivers = {p[1] for p in plans}
        for order in remaining:
            rest = [p for p in remaining if p is not order]
            for slot,(vi,di,sequence,old_rows) in enumerate(plans):
                trials=[]
                for index in range(len(sequence)+1):
                    seq=sequence[:index]+[order]+sequence[index:]
                    rows=feasible(vi,di,seq)
                    if rows is not None: trials.append((objective(rows,request),seq,rows))
                for _,seq,rows in sorted(trials,key=lambda x:x[0]):
                    if visit(plans[:slot]+[(vi,di,seq,rows)]+plans[slot+1:],rest): return True
            pairs=[]
            for vi in range(len(vehicles)):
                if vi in used_vehicles: continue
                for di in range(len(drivers)):
                    if di in used_drivers: continue
                    rows=feasible(vi,di,[order])
                    if rows is not None: pairs.append((objective(rows,request),vi,di,rows))
            for _,vi,di,rows in sorted(pairs,key=lambda x:x[0]):
                if visit(plans+[(vi,di,[order],rows)],rest): return True
        return False

    visit([],ordered)
    return [(vehicles[vi],drivers[di],seq,rows) for vi,di,seq,rows in best], reasons


def persist(db, route, rows):
    for number, row in enumerate(rows, 1):
        db.add(Tramo(ruta_id=route.ruta_id, orden_secuencia=number, **row))
    route.distancia_total_km = round(sum(r["distancia_tramo_km"] for r in rows), 2)
    route.tiempo_total_min = math.ceil(sum(r["tiempo_estimado_min"] for r in rows))
    route.co2_total_kg = round(sum(r["co2_tramo_kg"] for r in rows), 2)
    for row in rows:
        if row.get("pedido_id"):
            order = db.get(Pedido, row["pedido_id"])
            order.ruta_id, order.estado = route.ruta_id, "ASIGNADO"
            order.distancia_km, order.tiempo_estimado_min, order.emision_co2_kg = (
                row["distancia_tramo_km"], row["tiempo_estimado_min"], row["co2_tramo_kg"])
    db.flush()


def enqueue(db, route, reason):
    from app.services.routing_service import RoutingService
    payload = RoutingService.get_ruta_by_id(db, route.ruta_id).model_dump_json()
    update = RouteUpdate(ruta_id=route.ruta_id, conductor_id=route.conductor_id, payload=payload, motivo=reason)
    db.add(update)
    return update


@measured
def optimize(db, request, _commit=True):
    from app.services.routing_service import RoutingService, DEPOSITO_DEFAULT_LAT, DEPOSITO_DEFAULT_LNG
    started, road = time.perf_counter(), RoadService()
    operation = request.fecha_operacion or date.today()
    try:
        # Lock resource rows to avoid simultaneous reservations in PostgreSQL.
        vehicles = db.query(Vehiculo).filter(Vehiculo.estado == "DISPONIBLE").order_by(Vehiculo.vehiculo_id).with_for_update(of=Vehiculo).all()
        drivers = db.query(Conductor).filter(Conductor.estado.in_(["DISPONIBLE", "DESCANSO"])).order_by(Conductor.conductor_id).with_for_update(of=Conductor).all()
        for driver in drivers:
            if driver.fecha_jornada and driver.fecha_jornada < date.today():
                driver.horas_conduccion_hoy, driver.fecha_jornada = 0, date.today()
                if driver.estado == "DESCANSO":
                    driver.estado = "DISPONIBLE"
        active = db.query(Ruta).filter(or_(Ruta.fecha_operacion == operation, Ruta.estado == "EN_EJECUCION"),
            Ruta.estado.in_(["PLANIFICADA", "EN_EJECUCION"])).all()
        vehicles = [v for v in vehicles if (not request.vehiculo_id or v.vehiculo_id == request.vehiculo_id)
            and not any(r.vehiculo_id == v.vehiculo_id for r in active)]
        drivers = [c for c in drivers if (not request.conductor_id or c.conductor_id == request.conductor_id)
            and c.estado == "DISPONIBLE" and c.licencia_vencimiento is not None and c.licencia_vencimiento >= operation
            and (operation != date.today() or float(c.horas_conduccion_hoy or 0) < 8) and not any(r.conductor_id == c.conductor_id for r in active)]
        drivers.sort(key=lambda c: float(c.horas_conduccion_hoy or 0))
        if not vehicles or not drivers:
            raise HTTPException(400, "No hay vehículo y conductor disponibles con licencia vigente verificada y sin otra ruta activa")
        orders = db.query(Pedido).filter(Pedido.ruta_id.is_(None), Pedido.estado.in_([
            "PENDIENTE", "No Asignados por Exceso de Capacidad"])).with_for_update().all()
        orders = [p for p in orders if not request.pedidos_ids or p.pedido_id in request.pedidos_ids]
        if not orders:
            raise HTTPException(400, "No hay pedidos pendientes para planificar rutas")
        priorities = {"URGENTE": 4, "ALTA": 3, "ESTANDAR": 2, "BAJA": 1}
        orders.sort(key=lambda p: (-priorities.get(p.prioridad, 2), p.ventana_fin, str(p.pedido_id)))
        depot = db.query(Deposito).filter(Deposito.estado == "OPERATIVO").first()
        origin = [float(depot.longitud) if depot else DEPOSITO_DEFAULT_LNG,
                  float(depot.latitud) if depot else DEPOSITO_DEFAULT_LAT]
        routes, reasons = [], {}
        plans, reasons = select_assignments(orders,vehicles,drivers,origin,request,road,operation)
        for vehicle, driver, selected, rows in plans:
            for order in selected:
                orders.remove(order)
            route = Ruta(conductor_id=driver.conductor_id, vehiculo_id=vehicle.vehiculo_id,
                deposito_origen_id=depot.deposito_id if depot else None, fecha_operacion=operation, estado="PLANIFICADA",
                hora_salida=request.hora_salida,
                jornada_reservada=operation == date.today())
            db.add(route)
            db.flush()
            persist(db, route, rows)
            if operation == date.today():
                driver.horas_conduccion_hoy = round(float(driver.horas_conduccion_hoy or 0) + route.tiempo_total_min / 60, 4)
            enqueue(db, route, "RUTA_ASIGNADA")
            routes.append(route)
        unassigned = []
        for order in orders:
            reason = reasons.get(order.pedido_id, "Sin vehículo o conductor libre para otra ruta")
            order.estado = "No Asignados por Exceso de Capacidad" if reason == "No Asignados por Exceso de Capacidad" else "PENDIENTE"
            unassigned.append(dict(pedido_id=order.pedido_id, codigo_seguimiento=order.codigo_seguimiento,
                cliente_nombre=order.cliente_nombre, peso_kg=float(order.peso_kg), volumen_m3=float(order.volumen_m3), motivo=reason))
        db.flush()
        if _commit:
            db.commit()
        details = [RoutingService.get_ruta_by_id(db, r.ruta_id) for r in routes]
        return RutaOptimizarResponse(rutas=details, pedidos_asignados_count=sum(r.pedidos_asignados_count for r in details),
            pedidos_no_asignados_count=len(unassigned), pedidos_no_asignados=unassigned,
            mensaje=f"{len(details)} rutas verificadas; {len(unassigned)} pedidos pendientes con motivo de no asignación.",
            co2_computacional_total_kg=0, energia_computacional_total_kwh=0, tiempo_computo_total_seg=time.perf_counter()-started)
    except Exception as exc:
        db.rollback()
        if isinstance(exc, RoadUnavailable):
            raise HTTPException(503, str(exc)) from exc
        raise


@measured
def reoptimize(db, route_id, request):
    from app.services.routing_service import RoutingService, CATALOGO_ZONAS_RIESGO
    try:
        route = db.query(Ruta).filter(Ruta.ruta_id == route_id).with_for_update(of=Ruta).first()
        if not route:
            raise HTTPException(404, "Ruta no encontrada")
        if route.estado not in ("PLANIFICADA", "EN_EJECUCION"):
            raise HTTPException(409, "Solo se puede reoptimizar una ruta activa")
        if route.estado == "EN_EJECUCION" and (request.latitud_actual is None or request.hora_salida is None or "minutos_transcurridos" not in request.model_fields_set or "conduccion_continua_min" not in request.model_fields_set):
            raise HTTPException(422, "Indique posición, hora, minutos transcurridos y conducción continua para reoptimizar una ruta en ejecución")
        driver = db.query(Conductor).filter(Conductor.conductor_id == route.conductor_id).with_for_update().populate_existing().one()
        route.conductor = driver
        orders = db.query(Pedido).filter(Pedido.ruta_id == route_id,
            Pedido.estado.notin_(["ENTREGADO", "CANCELADO", "NO_ENTREGADO"])).with_for_update().all()
        departure = request.hora_salida or route.hora_salida
        if request.vehiculo_averiado:
            if route.estado == "EN_EJECUCION" and not request.carga_en_deposito:
                raise HTTPException(409, "Confirme que la carga regresó al depósito antes de redistribuirla")
            if not orders:
                raise HTTPException(409, "La ruta no tiene entregas pendientes para redistribuir")
            route.vehiculo.estado = "MANTENIMIENTO"
            route.estado = "CANCELADA"
            if route.fecha_operacion == date.today():
                reserved = (route.tiempo_total_min + float(route.minutos_transcurridos or 0)) / 60 if route.jornada_reservada else 0
                route.conductor.horas_conduccion_hoy = max(0, float(route.conductor.horas_conduccion_hoy or 0) - reserved) + request.minutos_transcurridos / 60
            for order in orders:
                order.estado, order.ruta_id = "PENDIENTE", None
            db.flush()
            replacement = optimize.__wrapped__(db, RutaOptimizarRequest(fecha_operacion=route.fecha_operacion,
                pedidos_ids=[p.pedido_id for p in orders], hora_salida=departure), _commit=False)
            enqueue(db, route, "AVERIA_RUTA_CANCELADA")
            db.commit()
            detail = RoutingService.get_ruta_by_id(db, route_id)
            return ReoptimizarRutaResponse(ruta_id=route_id, estado=route.estado, mensaje="Vehículo enviado a mantenimiento. Entregas redistribuidas desde el depósito; revise los pedidos pendientes.",
                distancia_total_km=detail.distancia_total_km, tiempo_total_min=detail.tiempo_total_min,
                co2_total_kg=detail.co2_total_kg, co2_computacional_kg=0, tramos=detail.tramos,
                rutas_reasignadas=replacement.rutas, pedidos_pendientes=replacement.pedidos_no_asignados)
        if request.pedido_cancelado_id:
            cancelled = next((p for p in orders if p.pedido_id == request.pedido_cancelado_id), None)
            if not cancelled:
                raise HTTPException(409, "El pedido a cancelar no pertenece a las entregas pendientes de esta ruta")
            orders.remove(cancelled)
            cancelled.estado, cancelled.ruta_id = "CANCELADO", None
        if request.nuevo_pedido_urgente_id:
            urgent = db.query(Pedido).filter(Pedido.pedido_id == request.nuevo_pedido_urgente_id).with_for_update().populate_existing().first()
            if not urgent or urgent.ruta_id is not None or urgent.estado != "PENDIENTE":
                raise HTTPException(409, "El pedido urgente debe estar pendiente y sin otra ruta")
            orders.insert(0, urgent)
        previous = db.query(Tramo).filter(Tramo.ruta_id == route_id).order_by(Tramo.orden_secuencia).all()
        first, last = previous[0], previous[-1]
        origin = [float(first.longitud), float(first.latitud)] if request.latitud_actual is None else [request.longitud_actual, request.latitud_actual]
        blocked = [i.poligono for i in request.incidencias if i.cierre]
        if request.evitar_zona_riesgo:
            blocked.extend(z["poligono"] for z in CATALOGO_ZONAS_RIESGO if z["nivel_peligro"] != "ZBE_AMBIENTAL")
        # Preserve reported closures across subsequent recalculations.
        latest = db.query(RouteUpdate).filter(RouteUpdate.ruta_id == route_id).order_by(RouteUpdate.created_at.desc()).first()
        old_incidents = json.loads(latest.payload).get("incidencias", []) if latest and not request.resolver_incidencias_previas else []
        from app.schemas.ruta import IncidenciaVial
        incidents = [IncidenciaVial(**i) for i in old_incidents] + request.incidencias
        blocked.extend(i.poligono for i in incidents if i.cierre and i.poligono not in blocked)
        if request.minutos_transcurridos < float(route.minutos_transcurridos or 0):
            raise HTTPException(409, "El tiempo transcurrido no puede retroceder")
        reserved = (route.tiempo_total_min + float(route.minutos_transcurridos or 0)) / 60 if route.jornada_reservada else 0
        base_hours = (max(0, float(route.conductor.horas_conduccion_hoy or 0) - reserved)
            if route.fecha_operacion == date.today() else 0) + request.minutos_transcurridos / 60
        rows = schedule(orders, route.vehiculo, route.conductor, origin, minutes(departure), RoadService(),
            blocked, [i for i in incidents if not i.cierre], [float(last.longitud), float(last.latitud)], base_hours, request.conduccion_continua_min) if orders or route.estado == "EN_EJECUCION" else []
        from app.services.analytics_service import preserve_completed_legs
        preserve_completed_legs(db, route, previous)
        db.query(Tramo).filter(Tramo.ruta_id == route_id).delete(synchronize_session=False)
        persist(db, route, rows)
        if not orders and route.estado == "PLANIFICADA":
            route.estado = "CANCELADA"
        if route.fecha_operacion == date.today():
            route.conductor.horas_conduccion_hoy = round(base_hours + route.tiempo_total_min / 60, 4)
            route.jornada_reservada = True
        route.minutos_transcurridos = request.minutos_transcurridos
        route.hora_salida = departure
        update = enqueue(db, route, request.motivo_incidencia)
        payload = json.loads(update.payload)
        payload["incidencias"] = [i.model_dump() for i in incidents]
        update.payload = json.dumps(payload)
        db.commit()
        detail = RoutingService.get_ruta_by_id(db, route_id)
        return ReoptimizarRutaResponse(ruta_id=route_id, estado=route.estado, incidencias=[i.model_dump() for i in incidents], mensaje="Recorrido validado. Itinerario en cola hasta confirmación del conductor.",
            distancia_total_km=detail.distancia_total_km, tiempo_total_min=detail.tiempo_total_min,
            co2_total_kg=detail.co2_total_kg, co2_computacional_kg=0, tramos=detail.tramos)
    except Exception as exc:
        db.rollback()
        if isinstance(exc, ValueError):
            raise HTTPException(409, str(exc)) from exc
        raise
