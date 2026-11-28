import sys
from pathlib import Path
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from summarize_availability import summarize

def sample(stamp='2026-11-28T10:17:00+00:00',status=200,elapsed=200):
    return {'time_utc':stamp,'target':'api','status':status,'available':status==200,'elapsed_ms':elapsed}

class SamplingSummaryTests(unittest.TestCase):
    def test_one_good_sample_is_not_a_monthly_sla(self):
        result=summarize([{'samples':[sample()]}],'2026-11')
        self.assertEqual(result['expected_hourly_target_slots'],1020)
        self.assertEqual(result['observed_hourly_target_slots'],1)
        self.assertEqual(result['missing_hourly_target_slots'],1019)
        self.assertFalse(result['monthly_sla_accredited'])
    def test_duplicates_do_not_increase_coverage(self):
        result=summarize([{'samples':[sample(),sample(),sample('2026-11-28T10:18:00Z')]}],'2026-11')
        self.assertEqual(result['duplicate_samples_ignored'],1)
        self.assertEqual(result['observed_hourly_target_slots'],1)
        self.assertEqual(result['targets']['api']['samples'],2)
    def test_timeout_is_kept_in_all_attempt_percentiles(self):
        result=summarize([{'samples':[sample(),sample('2026-11-28T11:17:00Z',None,20000)]}],'2026-11')
        self.assertEqual(result['targets']['api']['failed'],1)
        self.assertEqual(result['targets']['api']['all_attempts']['p95_ms'],20000)
        self.assertEqual(result['targets']['api']['successful_attempts']['p95_ms'],200)
    def test_operating_hours_are_converted_from_utc(self):
        result=summarize([{'samples':[sample('2026-11-28T09:59:00Z'),sample('2026-11-28T10:00:00Z'),sample('2026-11-29T03:00:00Z')]}],'2026-11')
        self.assertEqual(result['samples_outside_month_or_hours'],2)
        self.assertEqual(result['targets']['api']['samples'],1)
    def test_conflicting_or_false_success_is_rejected(self):
        with self.assertRaises(ValueError):summarize([{'samples':[sample(),sample(status=503)]}],'2026-11')
        row=sample(status=503);row['available']=True
        with self.assertRaises(ValueError):summarize([{'samples':[row]}],'2026-11')

if __name__=='__main__':unittest.main()
