from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import ShotZone, TrainingSession, User
from .security import hash_password


ZONE_NAMES = ["Right Corner", "Left Wing", "Elbow", "Paint", "Free Throw Line"]


def seed_demo_data(db: Session) -> None:
    if db.scalar(select(User.id).limit(1)) is not None:
        return

    user = User(
        username="Julien Dubois",
        display_name="J. Carter",
        email="coach@performance.pro",
        password_hash=hash_password("password123"),
    )
    db.add(user)
    db.flush()

    today = date.today()
    titles = [
        "Morning Drill Routine",
        "Conditioning & Free Throws",
        "High Intensity Jumpers",
        "Free Throw Clinic",
        "Mid-range Catch and Shoot",
        "Corner Three Series",
    ]

    for index in range(24):
        attempted = 110 + (index % 6) * 18
        pct = 58 + ((index * 7) % 27)
        made = round(attempted * pct / 100)
        session = TrainingSession(
            user_id=user.id,
            date=today - timedelta(days=index * 2),
            title=titles[index % len(titles)],
            duration_minutes=35 + (index % 5) * 7,
            duration_seconds=(35 + (index % 5) * 7) * 60 + (index % 4) * 8,
            shots_attempted=attempted,
            shots_made=made,
            notes=(
                "Focused on high release point, repeatable footwork, and balanced follow-through "
                "under moderate fatigue."
            ),
        )
        db.add(session)
        db.flush()

        for zone_index, zone_name in enumerate(ZONE_NAMES):
            zone_attempted = max(8, attempted // len(ZONE_NAMES) + zone_index * 2)
            zone_pct = min(95, max(35, pct + zone_index * 4 - 8))
            db.add(
                ShotZone(
                    session_id=session.id,
                    zone=zone_name,
                    attempted=zone_attempted,
                    made=round(zone_attempted * zone_pct / 100),
                )
            )

    db.commit()
