from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.auth import current_user
from app.schemas.sustainability import SustainabilityConfig, Period, Proposal
from app.models.sustainability import SustainabilitySettings, SustainabilityExport
from app.services.analytics_service import configuration, summary, compensation

router = APIRouter()


def analyst(user=Depends(current_user)):
    if user.rol != 'ADMIN' and (user.rol != 'OFICINA' or 'ANALITICA' not in (user.permisos or [])):
        raise HTTPException(403, 'Se requiere permiso de analítica de oficina')
    return user


@router.get('/analitica/configuracion')
def read_config(db: Session = Depends(get_db), user=Depends(analyst)):
    return configuration(db)


@router.put('/analitica/configuracion')
def save_config(data: SustainabilityConfig, db: Session = Depends(get_db), user=Depends(analyst)):
    if user.rol != 'ADMIN':
        raise HTTPException(403, 'Solo administración puede configurar factores')
    row = db.get(SustainabilitySettings, 'current')
    if not row:
        row = SustainabilitySettings(id='current')
        db.add(row)
    row.data = data.model_dump(mode='json')
    db.commit()
    return row.data


@router.get('/analitica/resumen')
def get_summary(desde: date, hasta: date, db: Session = Depends(get_db), user=Depends(analyst)):
    try:
        return summary(db, desde, hasta)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


def enqueue(db, user, data, kind):
    job = SustainabilityExport(owner=str(user.usuario_id), kind=kind, data=data)
    db.add(job)
    db.commit()
    return {'id': job.id, 'estado': job.status}


@router.post('/reportes', status_code=202)
def request_report(data: Period, db: Session = Depends(get_db), user=Depends(analyst)):
    report = summary(db, data.desde, data.hasta)
    if not report['totales']['rutas']:
        raise HTTPException(422, 'No se encontraron datos para generar el reporte en el periodo especificado.')
    return enqueue(db, user, report, 'REPORTE')


@router.get('/compensacion/proyectos')
def projects(db: Session = Depends(get_db), user=Depends(analyst)):
    return (configuration(db) or {}).get('proyectos', [])


@router.post('/compensacion/propuestas')
def proposal(data: Proposal, db: Session = Depends(get_db), user=Depends(analyst)):
    report = summary(db, data.desde, data.hasta)
    result = compensation(db, report, data.distribucion)
    return {**result, **enqueue(db, user, result, 'COMPENSACION')}


@router.get('/reportes')
def reports(db: Session = Depends(get_db), user=Depends(analyst)):
    rows = db.query(SustainabilityExport).filter(SustainabilityExport.owner == str(user.usuario_id)).order_by(SustainabilityExport.created_at.desc()).limit(50).all()
    return [{'id': r.id, 'estado': r.status, 'tipo': r.kind, 'error': r.error,
             'desde': r.data['desde'], 'hasta': r.data['hasta']} for r in rows]


def owned_job(db, job_id, user):
    job = db.get(SustainabilityExport, str(job_id))
    if not job or (job.owner != str(user.usuario_id) and user.rol != 'ADMIN'):
        raise HTTPException(404, 'Reporte no encontrado')
    return job


@router.get('/reportes/{job_id}')
def report_status(job_id: UUID, db: Session = Depends(get_db), user=Depends(analyst)):
    job = owned_job(db, job_id, user)
    return {'id': job.id, 'estado': job.status, 'error': job.error}


@router.post('/reportes/{job_id}/reintentar', status_code=202)
def retry_report(job_id: UUID, db: Session = Depends(get_db), user=Depends(analyst)):
    job = owned_job(db, job_id, user)
    if job.status == 'ERROR':
        job.status, job.error = 'PENDIENTE', None
        db.commit()
    return {'id': job.id, 'estado': job.status}


@router.get('/reportes/{job_id}/archivo')
@router.get('/compensacion/propuestas/{job_id}/archivo')
def download(job_id: UUID, db: Session = Depends(get_db), user=Depends(analyst)):
    job = owned_job(db, job_id, user)
    if job.status != 'LISTO':
        raise HTTPException(409, 'El documento todavía no está disponible')
    return Response(job.document, media_type='application/pdf', headers={
        'Content-Disposition': f'attachment; filename="ecologistica-{job.id}.pdf"', 'Cache-Control': 'private, no-store'})
