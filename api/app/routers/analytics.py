from collections import defaultdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..dependencies import current_user
from ..models import ShotZone, TrainingSession, User
from ..schemas import (
    AnalyticsKpis,
    AnalyticsReadout,
    AnalyticsResponse,
    ShotProfile,
    WeeklyTrend,
    ZoneCard,
)
from ..utils import accuracy, aggregate_zones, consistency_index

router = APIRouter(prefix="/analytics", tags=["analytics"])


def weekly_buckets(sessions: list[TrainingSession], weeks: int = 6) -> list[WeeklyTrend]:
    today = date.today()
    points: list[WeeklyTrend] = []
    for index in range(weeks):
        week_end = today - timedelta(days=(weeks - 1 - index) * 7)
        week_start = week_end - timedelta(days=6)
        bucket = [session for session in sessions if week_start <= session.date <= week_end]
        attempted = sum(session.shots_attempted for session in bucket)
        made = sum(session.shots_made for session in bucket)
        points.append(WeeklyTrend(label=f"W{index + 1}", accuracy=accuracy(made, attempted), volume=attempted))
    return points


@router.get("", response_model=AnalyticsResponse)
def analytics(user: User = Depends(current_user), db: Session = Depends(get_db)) -> AnalyticsResponse:
    sessions = list(
        db.scalars(
            select(TrainingSession)
            .options(selectinload(TrainingSession.shot_zones))
            .where(TrainingSession.user_id == user.id)
            .order_by(TrainingSession.date.desc())
        ).all()
    )
    all_zones = [zone for session in sessions for zone in session.shot_zones]
    zone_totals = aggregate_zones(all_zones)
    shot_profile = [
        ShotProfile(zone=str(item["zone"]), value=float(item["fgPct"]))
        for item in sorted(zone_totals.values(), key=lambda value: int(value["attempted"]), reverse=True)[:5]
    ]

    if not shot_profile:
        shot_profile = [ShotProfile(zone=zone, value=0) for zone in ["Corner 3", "Wing", "Elbow", "Paint", "FT"]]

    best = max(shot_profile, key=lambda item: item.value)
    focus = min(shot_profile, key=lambda item: item.value)
    stable = sorted(shot_profile, key=lambda item: abs(item.value - 75))[0]

    trends = weekly_buckets(sessions)
    current_attempted = sum(point.volume for point in trends[-3:])
    current_made = 0
    previous_attempted = 0
    previous_made = 0
    midpoint = date.today() - timedelta(days=21)
    for session in sessions:
        if session.date >= midpoint:
            current_made += session.shots_made
        else:
            previous_attempted += session.shots_attempted
            previous_made += session.shots_made

    current_accuracy = accuracy(current_made, current_attempted)
    previous_accuracy = accuracy(previous_made, previous_attempted)
    delta = round(current_accuracy - previous_accuracy, 1)
    sign = "+" if delta >= 0 else ""
    accuracies = [accuracy(session.shots_made, session.shots_attempted) for session in sessions]
    volume_by_zone: dict[str, int] = defaultdict(int)
    for zone in all_zones:
        volume_by_zone[zone.zone] += zone.attempted
    top_volume_zone = max(volume_by_zone, key=volume_by_zone.get) if volume_by_zone else best.zone

    peak_week = max(trends, key=lambda point: point.accuracy).label if trends else "W1"
    volatility = "LOW" if consistency_index(accuracies) >= 80 else "MODERATE"
    shot_quality = round(sum(item.value for item in shot_profile) / len(shot_profile), 1) if shot_profile else 0
    return AnalyticsResponse(
        kpis=AnalyticsKpis(
            consistencyIndex=consistency_index(accuracies),
            consistencyDelta="+9 pts over baseline" if accuracies else "+0 pts over baseline",
            shotQuality=shot_quality,
            shotQualityLabel=f"Best in {best.zone}",
            trainingLoad=current_attempted,
            trainingLoadLabel="Attempts this cycle",
            efficiencyDelta=f"{sign}{delta}%",
            efficiencyDeltaLabel="Compared to prior cycle",
        ),
        trend=trends,
        shotProfile=shot_profile,
        zones=[
            ZoneCard(label="HOT ZONE", area=best.zone, value=f"{best.value}%", tone="hot"),
            ZoneCard(label="STABLE", area=stable.zone, value=f"{stable.value}%", tone="stable"),
            ZoneCard(label="FOCUS", area=focus.zone, value=f"{focus.value}%", tone="focus"),
        ],
        readout=AnalyticsReadout(
            text=(
                f"Accuracy is strongest in {best.zone}. Keep volume high around {top_volume_zone} "
                f"and prioritize technical reps in {focus.zone}."
            ),
            peakWeek=peak_week,
            volatility=volatility,
        ),
    )


@router.get("/export", response_model=AnalyticsResponse)
def export_analytics(user: User = Depends(current_user), db: Session = Depends(get_db)) -> AnalyticsResponse:
    return analytics(user=user, db=db)
