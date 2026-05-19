from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..dependencies import current_user
from ..models import ShotZone, TrainingSession, User
from ..schemas import (
    Pagination,
    WorkoutCreate,
    WorkoutDetail,
    WorkoutListResponse,
    WorkoutSummary,
    WorkoutUpdate,
)
from ..serializers import workout_detail, workout_list_item
from ..utils import accuracy, top_streak

router = APIRouter(prefix="/workouts", tags=["workouts"])


def owned_session(session_id: int, user: User, db: Session) -> TrainingSession:
    session = db.scalar(
        select(TrainingSession)
        .options(selectinload(TrainingSession.shot_zones))
        .where(TrainingSession.id == session_id, TrainingSession.user_id == user.id)
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found")
    return session


def summary_for(user: User, db: Session) -> WorkoutSummary:
    sessions = db.scalars(select(TrainingSession).where(TrainingSession.user_id == user.id)).all()
    attempted = sum(session.shots_attempted for session in sessions)
    made = sum(session.shots_made for session in sessions)
    return WorkoutSummary(
        totalSessions=len(sessions),
        avgAccuracy=accuracy(made, attempted),
        totalMinutes=sum(session.duration_minutes for session in sessions),
        topStreak=top_streak(list(sessions)),
    )


def replace_zones(session: TrainingSession, zones: list) -> None:
    session.shot_zones.clear()
    for zone in zones:
        session.shot_zones.append(
            ShotZone(zone=zone.zone, attempted=zone.attempted, made=zone.made)
        )


def improvement_for(session: TrainingSession, user: User, db: Session) -> str:
    previous = db.scalar(
        select(TrainingSession)
        .where(
            TrainingSession.user_id == user.id,
            TrainingSession.date < session.date,
            TrainingSession.id != session.id,
        )
        .order_by(TrainingSession.date.desc())
        .limit(1)
    )
    if previous is None:
        return "+0.0% improvement from last session"
    delta = accuracy(session.shots_made, session.shots_attempted) - accuracy(previous.shots_made, previous.shots_attempted)
    sign = "+" if delta >= 0 else ""
    return f"{sign}{round(delta, 1)}% improvement from last session"


@router.get("", response_model=WorkoutListResponse)
def list_workouts(
    page: int = 1,
    limit: int = 5,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> WorkoutListResponse:
    page = max(page, 1)
    limit = min(max(limit, 1), 50)
    total = db.scalar(select(func.count()).select_from(TrainingSession).where(TrainingSession.user_id == user.id)) or 0
    sessions = db.scalars(
        select(TrainingSession)
        .where(TrainingSession.user_id == user.id)
        .order_by(TrainingSession.date.desc(), TrainingSession.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()
    return WorkoutListResponse(
        items=[workout_list_item(session) for session in sessions],
        pagination=Pagination(page=page, limit=limit, total=total),
        summary=summary_for(user, db),
    )


@router.post("", response_model=WorkoutDetail, status_code=status.HTTP_201_CREATED)
def create_workout(payload: WorkoutCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> WorkoutDetail:
    session = TrainingSession(
        user_id=user.id,
        date=payload.date,
        title=payload.title or "Training Session",
        duration_minutes=payload.durationMinutes,
        duration_seconds=payload.durationSeconds,
        shots_attempted=payload.shotsAttempted,
        shots_made=payload.shotsMade,
        notes=payload.notes,
    )
    replace_zones(session, payload.shotZones)
    db.add(session)
    db.commit()
    db.refresh(session)
    return workout_detail(owned_session(session.id, user, db), improvement_for(session, user, db))


@router.get("/{session_id}", response_model=WorkoutDetail)
def get_workout(session_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> WorkoutDetail:
    session = owned_session(session_id, user, db)
    return workout_detail(session, improvement_for(session, user, db))


@router.patch("/{session_id}", response_model=WorkoutDetail)
def update_workout(
    session_id: int,
    payload: WorkoutUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> WorkoutDetail:
    session = owned_session(session_id, user, db)
    next_attempted = payload.shotsAttempted if payload.shotsAttempted is not None else session.shots_attempted
    next_made = payload.shotsMade if payload.shotsMade is not None else session.shots_made
    if next_made > next_attempted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="shotsMade cannot be greater than shotsAttempted")

    if payload.date is not None:
        session.date = payload.date
    if payload.title is not None:
        session.title = payload.title
    if payload.durationMinutes is not None:
        session.duration_minutes = payload.durationMinutes
    if payload.durationSeconds is not None:
        session.duration_seconds = payload.durationSeconds
    if payload.shotsAttempted is not None:
        session.shots_attempted = payload.shotsAttempted
    if payload.shotsMade is not None:
        session.shots_made = payload.shotsMade
    if payload.notes is not None:
        session.notes = payload.notes
    if payload.shotZones is not None:
        replace_zones(session, payload.shotZones)

    db.commit()
    db.refresh(session)
    return workout_detail(owned_session(session.id, user, db), improvement_for(session, user, db))


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(session_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Response:
    session = owned_session(session_id, user, db)
    db.delete(session)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
