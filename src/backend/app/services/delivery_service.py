from datetime import date
from fastapi import HTTPException
from app.models.ruta import Ruta
from app.models.pedido import Pedido
from app.models.conductor import Conductor


def update_delivery(db, order, state, photo=None):
    route_id = order.ruta_id
    route = db.query(Ruta).filter(Ruta.ruta_id == route_id).with_for_update(of=Ruta).populate_existing().first() if route_id else None
    driver = db.query(Conductor).filter(Conductor.conductor_id == route.conductor_id).with_for_update().populate_existing().one() if route else None
    order = db.query(Pedido).filter(Pedido.pedido_id == order.pedido_id).with_for_update().populate_existing().one()
    if order.ruta_id != route_id:
        raise HTTPException(409, 'El pedido cambió de ruta. Actualiza el itinerario y reintenta')
    allowed = {'ASIGNADO': {'ASIGNADO', 'EN_TRANSITO'}, 'EN_TRANSITO': {'EN_TRANSITO', 'ENTREGADO', 'NO_ENTREGADO'},
               'ENTREGADO': {'ENTREGADO'}, 'NO_ENTREGADO': {'NO_ENTREGADO'}}
    if state not in allowed.get(order.estado, set()):
        raise HTTPException(409, 'La transición no corresponde al estado actual del pedido')
    if state == 'EN_TRANSITO' and not route:
        raise HTTPException(409, 'Primero asigna el pedido a una ruta')
    if route and state == 'EN_TRANSITO' and order.estado != 'EN_TRANSITO' and route.fecha_operacion != date.today():
        raise HTTPException(409, 'La ruta no está programada para hoy')
    if route and state == 'EN_TRANSITO' and (driver.licencia_vencimiento is None or driver.licencia_vencimiento < date.today()):
        raise HTTPException(409, 'Debe verificar una licencia vigente antes de iniciar la ruta')
    if route and state == 'EN_TRANSITO' and not route.jornada_reservada:
        if route.fecha_operacion != date.today():
            raise HTTPException(409, 'La ruta no está programada para hoy')
        if driver.fecha_jornada < date.today():
            driver.fecha_jornada, driver.horas_conduccion_hoy = date.today(), 0
        total = float(driver.horas_conduccion_hoy) + route.tiempo_total_min / 60
        if total > 8:
            raise HTTPException(409, 'La ruta supera la jornada disponible de hoy')
        driver.horas_conduccion_hoy, route.jornada_reservada = total, True
    order.estado = state
    if photo: order.foto_entrega_url = photo
    if route:
        if state == 'EN_TRANSITO':
            from app.services.analytics_service import capture_snapshot
            capture_snapshot(db, route)
            route.estado = 'EN_EJECUCION'
        db.flush()
        if not db.query(Pedido).filter(Pedido.ruta_id == route_id,
                Pedido.estado.notin_(['ENTREGADO', 'NO_ENTREGADO', 'CANCELADO'])).first():
            if route.estado not in ('COMPLETADA', 'CANCELADA'):
                route.estado = 'EN_EJECUCION'
        from app.services.planning_service import enqueue
        enqueue(db, route, 'ESTADO_DE_ENTREGA_ACTUALIZADO')
    db.commit()
    return order
