"""Summarize real HTTP samples without treating missing observations as uptime."""
import argparse
import calendar
from datetime import datetime, timezone, timedelta
import json
import math
from pathlib import Path
import statistics

LIMA=timezone(timedelta(hours=-5))
TARGETS=('web','api')

def summarize(documents, month):
    year,number=map(int,month.split('-'));days=calendar.monthrange(year,number)[1]
    unique={};duplicates=0;excluded=0
    for document in documents:
        for row in document['samples']:
            stamp=datetime.fromisoformat(row['time_utc'].replace('Z','+00:00'))
            if stamp.tzinfo is None:raise ValueError('Sample timestamps must include a timezone')
            if row['target'] not in TARGETS:raise ValueError('Unknown target')
            elapsed=float(row['elapsed_ms'])
            if not math.isfinite(elapsed) or elapsed<0:raise ValueError('Invalid elapsed time')
            if row['available'] is not (row['status']==200):raise ValueError('Status and availability disagree')
            normalized={'time_utc':stamp.astimezone(timezone.utc).isoformat(),'target':row['target'],
                'status':row['status'],'available':row['available'],'elapsed_ms':elapsed}
            key=(normalized['time_utc'],row['target'])
            if key in unique:
                if unique[key]!=normalized:raise ValueError('Conflicting duplicate sample')
                duplicates+=1;continue
            unique[key]=normalized
    selected=[];slots=set()
    for row in unique.values():
        local=datetime.fromisoformat(row['time_utc']).astimezone(LIMA)
        if local.strftime('%Y-%m')!=month or not 5<=local.hour<22:
            excluded+=1;continue
        selected.append(row);slots.add((local.date().isoformat(),local.hour,row['target']))
    def latency(values):
        values=sorted(values)
        return {'median_ms':round(statistics.median(values),2) if values else None,
            'p95_ms':round(values[math.ceil(.95*len(values))-1],2) if values else None,
            'max_ms':round(max(values),2) if values else None}
    targets={}
    for target in TARGETS:
        rows=[r for r in selected if r['target']==target];success=[r for r in rows if r['available']]
        targets[target]={'samples':len(rows),'successful':len(success),'failed':len(rows)-len(success),
            'sample_success_percent':round(len(success)/len(rows)*100,2) if rows else None,
            'all_attempts':latency([r['elapsed_ms'] for r in rows]),
            'successful_attempts':latency([r['elapsed_ms'] for r in success])}
    expected=days*17*len(TARGETS)
    return {'type':'REAL_HTTP_SAMPLING_SUMMARY','month':month,'timezone':'America/Lima (UTC-05:00)',
        'window':'05:00 inclusive to 22:00 exclusive','targets':targets,
        'expected_hourly_target_slots':expected,'observed_hourly_target_slots':len(slots),
        'missing_hourly_target_slots':expected-len(slots),'hourly_sampling_coverage_percent':round(len(slots)/expected*100,2),
        'duplicate_samples_ignored':duplicates,'samples_outside_month_or_hours':excluded,
        'monthly_sla_accredited':False,
        'limits':'Success is a fraction of observed samples. Coverage uses the full calendar month, including future slots if it is ongoing. Missing hours are not successful observations or proven outages; hourly samples do not measure continuous uptime or certify a monthly SLA. P95 uses nearest rank. Latencies cover only the sampled public web and health endpoint.'}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('inputs',nargs='+');parser.add_argument('--month')
    parser.add_argument('--output',required=True);args=parser.parse_args()
    documents=[json.loads(Path(p).read_text(encoding='utf-8-sig')) for p in args.inputs]
    month=args.month or datetime.now(LIMA).strftime('%Y-%m')
    result=summarize(documents,month);result['sources']=args.inputs
    output=Path(args.output);output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))

if __name__=='__main__':main()
