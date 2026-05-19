from collections import defaultdict
from datetime import date
from math import sqrt

from .models import ShotZone, TrainingSession


def accuracy(made: int, attempted: int, digits: int = 1) -> float:
    if attempted <= 0:
        return 0
    return round((made / attempted) * 100, digits)


def display_date(value: date) -> str:
    return value.strftime("%b %d, %Y")


def day_label(value: date) -> str:
    return value.strftime("%A").upper()


def duration_label(session: TrainingSession) -> str:
    seconds = session.duration_seconds or session.duration_minutes * 60
    minutes, remaining = divmod(seconds, 60)
    return f"{minutes}m {remaining:02d}s"


def top_streak(sessions: list[TrainingSession]) -> str:
    if not sessions:
        return "0 Days"
    days = sorted({session.date for session in sessions})
    best = current = 1
    for previous, current_day in zip(days, days[1:]):
        if (current_day - previous).days == 1:
            current += 1
            best = max(best, current)
        else:
            current = 1
    return f"{best} Day" if best == 1 else f"{best} Days"


def consistency_index(values: list[float]) -> int:
    if len(values) < 2:
        return 100 if values else 0
    mean = sum(values) / len(values)
    variance = sum((value - mean) ** 2 for value in values) / len(values)
    return max(0, min(100, round(100 - sqrt(variance) * 2)))


def aggregate_zones(zones: list[ShotZone]) -> dict[str, dict[str, float | int | str]]:
    grouped: dict[str, dict[str, float | int | str]] = defaultdict(lambda: {"zone": "", "attempted": 0, "made": 0})
    for zone in zones:
        item = grouped[zone.zone]
        item["zone"] = zone.zone
        item["attempted"] = int(item["attempted"]) + zone.attempted
        item["made"] = int(item["made"]) + zone.made
    for item in grouped.values():
        item["fgPct"] = accuracy(int(item["made"]), int(item["attempted"]))
    return grouped
