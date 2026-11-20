"""Business dates in Lima, independent of the hosting server's timezone.

Peru uses UTC-05:00 without daylight saving time. Audit timestamps remain UTC.
"""
from datetime import datetime, timedelta, timezone

LIMA = timezone(timedelta(hours=-5), name='America/Lima')


def operational_today():
    return datetime.now(LIMA).date()
