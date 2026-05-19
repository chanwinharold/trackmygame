from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import extract, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import current_user
from ..models import TrainingSession, User
from ..schemas import DashboardResponse, RecentLog, TrendPoint
from ..utils import accuracy, display_date

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def dashboard(user: User = Depends(current_user), db: Session = Depends(get_db)) -> DashboardResponse:
    sessions = list(
        db.scalars(
            select(TrainingSession)
            .where(TrainingSession.user_id == user.id)
            .order_by(TrainingSession.date.desc(), TrainingSession.id.desc())
        ).all()
    )
    attempted = sum(session.shots_attempted for session in sessions)
    made = sum(session.shots_made for session in sessions)
    accuracies = [accuracy(session.shots_made, session.shots_attempted) for session in sessions]

    today = date.today()
    current_month = db.scalar(
        select(TrainingSession)
        .where(
            TrainingSession.user_id == user.id,
            extract("year", TrainingSession.date) == today.year,
            extract("month", TrainingSession.date) == today.month,
        )
        .limit(1)
    )
    current_month_count = len(
        [
            session
            for session in sessions
            if session.date.year == today.year and session.date.month == today.month
        ]
    )
    previous_month = 12 if today.month == 1 else today.month - 1
    previous_year = today.year - 1 if today.month == 1 else today.year
    previous_month_count = len(
        [
            session
            for session in sessions
            if session.date.year == previous_year and session.date.month == previous_month
        ]
    )
    delta = current_month_count - previous_month_count
    sessions_change = f"{'+' if delta >= 0 else ''}{delta} this month"
    if current_month is None and not sessions:
        sessions_change = "+0 this month"

    last_seven = list(reversed(sessions[:7]))
    return DashboardResponse(
        totalSessions=len(sessions),
        sessionsChange=sessions_change,
        avgShootingPct=accuracy(made, attempted),
        peakShooting=max(accuracies) if accuracies else 0,
        eliteTier="Top 5%" if accuracy(made, attempted) >= 70 else "Developing",
        minutesTrained=sum(session.duration_minutes for session in sessions),
        shootingTrend=[
            TrendPoint(label=f"S{index}", value=accuracy(session.shots_made, session.shots_attempted))
            for index, session in enumerate(last_seven, start=1)
        ],
        recentLogs=[
            RecentLog(
                id=session.id,
                date=display_date(session.date),
                title=session.title,
                duration=session.duration_minutes,
                accuracy=accuracy(session.shots_made, session.shots_attempted),
            )
            for session in sessions[:3]
        ],
    )
