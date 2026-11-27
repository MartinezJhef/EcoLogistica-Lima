"""Restart only an explicitly disposable local PostgreSQL instance; resume one PDF.

POSTGRES_TEST_URL is private and is never written to the result artifact.
Requires an isolated server whose non-default databases all end in *_test.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from uuid import uuid4


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pg-ctl',required=True)
    parser.add_argument('--pg-data',required=True)
    parser.add_argument('--output',default='outputs/recovery-local.json')
    parser.add_argument('--confirm-disposable-instance',action='store_true',required=True)
    args=parser.parse_args()
    url=os.environ['POSTGRES_TEST_URL']
    from sqlalchemy import create_engine,text
    from sqlalchemy.engine import make_url
    from sqlalchemy.orm import Session
    parsed=make_url(url)
    if parsed.host not in ['127.0.0.1','localhost'] or not parsed.database.endswith('_test'):
        parser.error('Only a local disposable *_test database is allowed')
    engine=create_engine(url,connect_args={'connect_timeout':5})
    with engine.connect() as connection:
        databases=connection.execute(text('SELECT datname FROM pg_database WHERE NOT datistemplate')).scalars().all()
        if any(name!='postgres' and not name.endswith('_test') for name in databases):
            parser.error('The server contains non-test databases; restart prohibited')
    os.environ['DATABASE_URL']=url
    os.environ['CODECARBON_ENABLED']='0'
    sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'src/backend'))
    from app.models.sustainability import SustainabilityExport
    from app.services.report_service import process_next
    SustainabilityExport.__table__.create(engine,checkfirst=True)
    marker=str(uuid4())
    data={'desde':'2026-11-27','hasta':'2026-11-27','aviso':'Synthetic local recovery fixture',
          'co2_kg':20,'creditos':.02,'arboles':1,'proyectos':[],
          'parametros':{'fuente':'Controlled test fixture','horizonte_anios':1}}
    with Session(engine) as db:
        if db.query(SustainabilityExport).filter_by(status='PENDIENTE').count():
            parser.error('Use a disposable instance without unrelated pending exports')
        db.add(SustainabilityExport(id=marker,owner=marker,kind='COMPENSACION',data=data));db.commit()
    engine.dispose()
    started=time.perf_counter()
    flags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0
    result=subprocess.run([str(Path(args.pg_ctl).resolve()),'-D',str(Path(args.pg_data).resolve()),
        '-m','fast','-w','restart','-l',str(Path(args.pg_data).resolve()/'quality-recovery.log')],
        stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=flags,timeout=90)
    if result.returncode:raise SystemExit('Disposable instance restart failed; no recovery success declared')
    with Session(engine) as db:
        job=db.get(SustainabilityExport,marker)
        assert job and job.status=='PENDIENTE' and job.data==data
        assert process_next(db)
        db.expire_all();job=db.get(SustainabilityExport,marker)
        assert job.status=='LISTO' and job.document.startswith(b'%PDF')
        report={'type':'REAL_CONTROLLED_LOCAL_RECOVERY','scope':'Disposable local PostgreSQL, synthetic export and planned fast restart; not production failover or monthly SLA',
            'pending_job_survived_restart':True,'snapshot_unchanged':True,'worker_resumed_and_pdf_valid':True,
            'restart_and_resume_seconds':round(time.perf_counter()-started,3),'result':'PASS'}
        db.delete(job);db.commit()
    engine.dispose()
    output=Path(args.output);output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report))


if __name__=='__main__':main()
