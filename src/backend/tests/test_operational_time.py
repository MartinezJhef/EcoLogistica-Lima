from datetime import datetime, date, timezone
import pytest
from app.core import operational_time


@pytest.mark.parametrize('instant, expected', [
    ('2026-11-20T02:00:00+00:00', date(2026, 11, 19)),
    ('2026-11-20T04:59:59+00:00', date(2026, 11, 19)),
    ('2026-11-20T05:00:00+00:00', date(2026, 11, 20)),
    ('2027-01-01T02:00:00+00:00', date(2026, 12, 31)),
])
def test_operational_date_uses_lima_midnight(monkeypatch, instant, expected):
    class Clock:
        @staticmethod
        def now(tz):
            return datetime.fromisoformat(instant).astimezone(tz)
    monkeypatch.setattr(operational_time, 'datetime', Clock)
    assert operational_time.operational_today() == expected
