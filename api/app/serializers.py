from .models import ShotZone, TrainingSession, User
from .schemas import ShotZoneRead, UserRead, WorkoutDetail, WorkoutListItem
from .utils import accuracy, day_label, display_date, duration_label


def user_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        username=user.username,
        displayName=user.display_name,
        email=user.email,
        avatarUrl=user.avatar_url,
        createdAt=user.created_at,
        updatedAt=user.updated_at,
    )


def zone_read(zone: ShotZone) -> ShotZoneRead:
    return ShotZoneRead(
        zone=zone.zone,
        attempted=zone.attempted,
        made=zone.made,
        fgPct=accuracy(zone.made, zone.attempted),
    )


def workout_list_item(session: TrainingSession) -> WorkoutListItem:
    return WorkoutListItem(
        id=session.id,
        date=session.date,
        displayDate=display_date(session.date),
        dayLabel=day_label(session.date),
        durationMinutes=session.duration_minutes,
        shotsAttempted=session.shots_attempted,
        shotsMade=session.shots_made,
        fgPct=accuracy(session.shots_made, session.shots_attempted),
        notesPreview=session.notes[:96],
    )


def workout_detail(session: TrainingSession, improvement: str = "+0.0% improvement from last session") -> WorkoutDetail:
    return WorkoutDetail(
        id=session.id,
        date=session.date,
        displayDate=display_date(session.date),
        dayLabel=day_label(session.date),
        durationLabel=duration_label(session),
        durationMinutes=session.duration_minutes,
        durationSeconds=session.duration_seconds,
        overallAccuracy=accuracy(session.shots_made, session.shots_attempted),
        shotsMade=session.shots_made,
        shotsAttempted=session.shots_attempted,
        trainingNotes=session.notes,
        hotZoneImprovement=improvement,
        shotZones=[zone_read(zone) for zone in session.shot_zones],
        title=session.title,
    )
