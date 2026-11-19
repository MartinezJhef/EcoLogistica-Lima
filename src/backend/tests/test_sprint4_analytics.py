from datetime import date
from decimal import Decimal
import pytest
from app.services.analytics_service import comparison_period, percentage_change


def test_previous_period_crosses_year_with_same_inclusive_duration():
    assert comparison_period(date(2026, 1, 1), date(2026, 1, 7)) == (
        date(2025, 12, 25), date(2025, 12, 31))


def test_single_day_period():
    assert comparison_period(date(2026, 3, 1), date(2026, 3, 1)) == (
        date(2026, 2, 28), date(2026, 2, 28))


@pytest.mark.parametrize('start,end', [('2026-02-02', '2026-02-01'), ('2024-01-01', '2026-01-01')])
def test_invalid_period(start, end):
    with pytest.raises(ValueError):
        comparison_period(date.fromisoformat(start), date.fromisoformat(end))


def test_comparison_without_history_and_with_savings():
    assert percentage_change(100, 0) == 0
    assert percentage_change(75, 100) == Decimal('-25.00')
    assert percentage_change(100, 75) == Decimal('33.33')


def test_non_finite_metrics_rejected():
    with pytest.raises(ValueError):
        percentage_change('NaN', 1)
