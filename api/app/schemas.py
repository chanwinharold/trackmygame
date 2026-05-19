from __future__ import annotations

from datetime import date as date_type
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class CamelModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class UserRead(CamelModel):
    id: int
    username: str
    displayName: str
    email: EmailStr
    avatarUrl: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None


class RegisterRequest(CamelModel):
    username: str = Field(min_length=1, max_length=120)
    displayName: str | None = Field(default=None, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str
    rememberDevice: bool = False


class TokenResponse(CamelModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserRead


class ProfileUpdate(CamelModel):
    username: str | None = Field(default=None, min_length=1, max_length=120)
    displayName: str | None = Field(default=None, min_length=1, max_length=120)
    avatarUrl: str | None = Field(default=None, max_length=500)


class PasswordUpdate(CamelModel):
    currentPassword: str
    newPassword: str = Field(min_length=8, max_length=128)
    confirmPassword: str = Field(min_length=8, max_length=128)


class ShotZoneIn(CamelModel):
    zone: str = Field(min_length=1, max_length=80)
    attempted: int = Field(ge=0)
    made: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_made(self) -> "ShotZoneIn":
        if self.made > self.attempted:
            raise ValueError("made cannot be greater than attempted")
        return self


class ShotZoneRead(CamelModel):
    zone: str
    attempted: int
    made: int
    fgPct: float


class WorkoutBase(CamelModel):
    date: date_type
    title: str | None = Field(default=None, max_length=160)
    durationMinutes: int = Field(gt=0)
    durationSeconds: int | None = Field(default=None, ge=1)
    shotsAttempted: int = Field(ge=0)
    shotsMade: int = Field(ge=0)
    notes: str = Field(default="", max_length=2000)
    shotZones: list[ShotZoneIn] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_shots(self) -> "WorkoutBase":
        if self.shotsMade > self.shotsAttempted:
            raise ValueError("shotsMade cannot be greater than shotsAttempted")
        return self


class WorkoutCreate(WorkoutBase):
    pass


class WorkoutUpdate(CamelModel):
    date: date_type | None = None
    title: str | None = Field(default=None, max_length=160)
    durationMinutes: int | None = Field(default=None, gt=0)
    durationSeconds: int | None = Field(default=None, ge=1)
    shotsAttempted: int | None = Field(default=None, ge=0)
    shotsMade: int | None = Field(default=None, ge=0)
    notes: str | None = Field(default=None, max_length=2000)
    shotZones: list[ShotZoneIn] | None = None

    @model_validator(mode="after")
    def validate_shots(self) -> "WorkoutUpdate":
        if (
            self.shotsMade is not None
            and self.shotsAttempted is not None
            and self.shotsMade > self.shotsAttempted
        ):
            raise ValueError("shotsMade cannot be greater than shotsAttempted")
        return self


class WorkoutListItem(CamelModel):
    id: int
    date: date_type
    displayDate: str
    dayLabel: str
    durationMinutes: int
    shotsAttempted: int
    shotsMade: int
    fgPct: float
    notesPreview: str


class Pagination(CamelModel):
    page: int
    limit: int
    total: int


class WorkoutSummary(CamelModel):
    totalSessions: int
    avgAccuracy: float
    totalMinutes: int
    topStreak: str


class WorkoutListResponse(CamelModel):
    items: list[WorkoutListItem]
    pagination: Pagination
    summary: WorkoutSummary


class WorkoutDetail(CamelModel):
    id: int
    date: date_type
    displayDate: str
    dayLabel: str
    durationLabel: str
    durationMinutes: int
    durationSeconds: int | None = None
    overallAccuracy: float
    shotsMade: int
    shotsAttempted: int
    trainingNotes: str
    hotZoneImprovement: str
    shotZones: list[ShotZoneRead]
    title: str


class TrendPoint(CamelModel):
    label: str
    value: float


class RecentLog(CamelModel):
    id: int
    date: str
    title: str
    duration: int
    accuracy: float


class DashboardResponse(CamelModel):
    totalSessions: int
    sessionsChange: str
    avgShootingPct: float
    peakShooting: float
    eliteTier: str
    minutesTrained: int
    shootingTrend: list[TrendPoint]
    recentLogs: list[RecentLog]


class AnalyticsKpis(CamelModel):
    consistencyIndex: int
    consistencyDelta: str
    shotQuality: float
    shotQualityLabel: str
    trainingLoad: int
    trainingLoadLabel: str
    efficiencyDelta: str
    efficiencyDeltaLabel: str


class WeeklyTrend(CamelModel):
    label: str
    accuracy: float
    volume: int


class ShotProfile(CamelModel):
    zone: str
    value: float


class ZoneCard(CamelModel):
    label: str
    area: str
    value: str
    tone: str


class AnalyticsReadout(CamelModel):
    text: str
    peakWeek: str
    volatility: str


class AnalyticsResponse(CamelModel):
    kpis: AnalyticsKpis
    trend: list[WeeklyTrend]
    shotProfile: list[ShotProfile]
    zones: list[ZoneCard]
    readout: AnalyticsReadout


class Message(CamelModel):
    detail: str
