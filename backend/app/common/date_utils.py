from datetime import datetime, date, timedelta
from typing import Optional, Tuple


def format_date(d: Optional[date]) -> Optional[str]:
    if d is None:
        return None
    return d.strftime("%Y-%m-%d")


def parse_date_range(
    date_str: Optional[str],
) -> Tuple[Optional[date], Optional[date]]:
    if not date_str:
        return None, None
    if "," in date_str:
        parts = date_str.split(",")
        start = (
            datetime.strptime(parts[0].strip(), "%Y-%m-%d").date()
            if parts[0].strip()
            else None
        )
        end = (
            datetime.strptime(parts[1].strip(), "%Y-%m-%d").date()
            if parts[1].strip()
            else None
        )
        return start, end
    return None, None


def calculate_duration(start: date, end: date) -> int:
    return (end - start).days


def years_ago(years: int) -> date:
    return date.today() - timedelta(days=years * 365)
