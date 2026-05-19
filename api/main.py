from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .app.config import get_settings
    from .app.database import Base, SessionLocal, engine
    from .app.routers import analytics, auth, dashboard, profile, workouts
    from .app.seed import seed_demo_data
except ImportError:
    from app.config import get_settings
    from app.database import Base, SessionLocal, engine
    from app.routers import analytics, auth, dashboard, profile, workouts
    from app.seed import seed_demo_data


settings = get_settings()

app = FastAPI(title="TrackMyGame API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_demo_data(db)


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "TrackMyGame API", "status": "ok"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(workouts.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
