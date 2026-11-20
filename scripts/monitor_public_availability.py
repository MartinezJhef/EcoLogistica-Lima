import argparse,json,time,math
from pathlib import Path
from datetime import datetime,timezone
import httpx
p=argparse.ArgumentParser();p.add_argument('--seconds',type=int,default=7200);p.add_argument('--interval',type=int,default=60);p.add_argument('--output',default='outputs/disponibilidad-observada.json');a=p.parse_args()
start=time.monotonic();rows=[]
with httpx.Client(timeout=20,follow_redirects=True) as c:
 while True:
  for name,url in [('web','https://ecologistica-web.onrender.com'),('api','https://ecologistica-api.onrender.com/api/v1/health')]:
   t=time.perf_counter();record={'time_utc':datetime.now(timezone.utc).isoformat(),'target':name}
   try:
    r=c.get(url);record.update(status=r.status_code,available=r.status_code==200)
   except httpx.HTTPError as e:record.update(status=None,available=False,error=type(e).__name__)
   record['elapsed_ms']=round((time.perf_counter()-t)*1000,2);rows.append(record)
  result={'method':'Periodic HTTP sampling; not continuous availability or monthly SLA','interval_seconds':a.interval,'observed_seconds':round(time.monotonic()-start,2),'samples':rows,'successful_samples':sum(x['available'] for x in rows),'total_samples':len(rows),'sample_success_percent':round(sum(x['available'] for x in rows)/len(rows)*100,2)}
  Path(a.output).write_text(json.dumps(result,indent=2),encoding='utf-8')
  if time.monotonic()-start>=a.seconds:break
  time.sleep(min(a.interval,max(0,a.seconds-(time.monotonic()-start))))
print(json.dumps({k:v for k,v in result.items() if k!='samples'}))
