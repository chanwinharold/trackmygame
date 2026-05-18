# TrackMyGame API - Backend Implementation Guide

Ce document décrit tout ce qu'il faut prévoir pour construire le backend FastAPI attendu par le frontend `client/`.

## Objectif

Le frontend expose les pages suivantes :

- `/login`
- `/register`
- `/dashboard`
- `/workouts`
- `/workouts/:id`
- `/workouts/:id/edit`
- `/analytics`
- `/profile`

Le backend doit fournir l'authentification, la gestion du profil joueur, les sessions d'entrainement, les agrégats dashboard et les données analytics.

## Stack recommandée

Le dossier `api/` contient déjà un squelette FastAPI.

Recommandé :

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic-settings passlib[bcrypt] python-jose[cryptography] python-multipart
```

Pour lancer l'API :

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

URL frontend en dev :

```text
http://127.0.0.1:5173
```

URL API en dev :

```text
http://127.0.0.1:8000
```

## Configuration CORS

Le frontend Vite appelle l'API depuis `http://127.0.0.1:5173`. Ajouter CORS :

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Variables d'environnement

Prévoir un fichier `.env` dans `api/` :

```env
APP_ENV=development
DATABASE_URL=sqlite:///./trackmygame.db
JWT_SECRET=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_ORIGIN=http://127.0.0.1:5173
```

## Modèles de données

### User

```json
{
  "id": 1,
  "username": "Julien Dubois",
  "displayName": "J. Carter",
  "email": "coach@performance.pro",
  "avatarUrl": null,
  "createdAt": "2026-05-18T14:00:00Z",
  "updatedAt": "2026-05-18T14:00:00Z"
}
```

Champs database recommandés :

- `id`
- `username`
- `display_name`
- `email`
- `password_hash`
- `avatar_url`
- `created_at`
- `updated_at`

### TrainingSession

```json
{
  "id": 1,
  "userId": 1,
  "date": "2023-10-24",
  "title": "Morning Drill Routine",
  "durationMinutes": 45,
  "durationSeconds": 2712,
  "shotsAttempted": 150,
  "shotsMade": 108,
  "fgPct": 72,
  "notes": "Focused on off-dribble pullups and elbow jumpers...",
  "shotZones": [
    { "zone": "Right Corner", "attempted": 32, "made": 25 },
    { "zone": "Left Wing", "attempted": 40, "made": 23 }
  ],
  "createdAt": "2026-05-18T14:00:00Z",
  "updatedAt": "2026-05-18T14:00:00Z"
}
```

Calculs :

- `fgPct = round((shotsMade / shotsAttempted) * 100, 1)`
- Si `shotsAttempted = 0`, retourner `fgPct = 0`
- `durationSeconds` est optionnel, mais utile pour afficher `45m 12s`

### ShotZone

Zones compatibles avec le frontend analytics :

- `Right Corner`
- `Left Corner`
- `Right Wing`
- `Left Wing`
- `Elbow`
- `Paint`
- `Free Throw Line`
- `Corner 3`
- `FT`

Structure :

```json
{
  "zone": "Right Corner",
  "attempted": 32,
  "made": 25,
  "fgPct": 78.1
}
```

## Authentification

Utiliser JWT Bearer Token.

Header attendu côté frontend :

```http
Authorization: Bearer <access_token>
```

### POST `/auth/register`

Crée un compte utilisateur.

Request :

```json
{
  "username": "Julien Dubois",
  "displayName": "J. Carter",
  "email": "coach@performance.pro",
  "password": "secret-password"
}
```

Response `201` :

```json
{
  "accessToken": "jwt-token",
  "tokenType": "bearer",
  "user": {
    "id": 1,
    "username": "Julien Dubois",
    "displayName": "J. Carter",
    "email": "coach@performance.pro",
    "avatarUrl": null
  }
}
```

Validation :

- `email` unique
- `username` requis
- `password` minimum 8 caractères

### POST `/auth/login`

Connecte un utilisateur.

Request :

```json
{
  "email": "coach@performance.pro",
  "password": "secret-password",
  "rememberDevice": true
}
```

Response `200` :

```json
{
  "accessToken": "jwt-token",
  "tokenType": "bearer",
  "user": {
    "id": 1,
    "username": "Julien Dubois",
    "displayName": "J. Carter",
    "email": "coach@performance.pro",
    "avatarUrl": null
  }
}
```

### GET `/auth/me`

Retourne l'utilisateur connecté.

Response `200` :

```json
{
  "id": 1,
  "username": "Julien Dubois",
  "displayName": "J. Carter",
  "email": "coach@performance.pro",
  "avatarUrl": null
}
```

## Profil

### PATCH `/profile`

Met à jour les informations personnelles.

Request :

```json
{
  "username": "Julien Dubois",
  "displayName": "J. Carter",
  "avatarUrl": null
}
```

Response `200` :

```json
{
  "id": 1,
  "username": "Julien Dubois",
  "displayName": "J. Carter",
  "email": "coach@performance.pro",
  "avatarUrl": null
}
```

### PATCH `/profile/password`

Change le mot de passe.

Request :

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

Response `204`.

Erreurs :

- `400` si confirmation invalide
- `401` si mot de passe actuel incorrect

### DELETE `/profile`

Supprime définitivement le profil et ses sessions.

Response `204`.

## Sessions d'entrainement

### GET `/workouts`

Liste paginée des sessions.

Query params :

- `range=30d`
- `page=1`
- `limit=5`

Response `200` :

```json
{
  "items": [
    {
      "id": 1,
      "date": "2023-10-24",
      "displayDate": "Oct 24, 2023",
      "dayLabel": "TUESDAY MORNING",
      "durationMinutes": 45,
      "shotsAttempted": 150,
      "shotsMade": 108,
      "fgPct": 72,
      "notesPreview": "Focused on off-dribble pullups and elbow jumpers..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 24
  },
  "summary": {
    "totalSessions": 24,
    "avgAccuracy": 68.4,
    "totalMinutes": 1240,
    "topStreak": "5 Days"
  }
}
```

### POST `/workouts`

Crée une session.

Request :

```json
{
  "date": "2023-11-24",
  "durationMinutes": 60,
  "shotsAttempted": 150,
  "shotsMade": 112,
  "notes": "Focus on high release point and consistent follow-through.",
  "shotZones": [
    { "zone": "Right Corner", "attempted": 32, "made": 25 }
  ]
}
```

Response `201` :

```json
{
  "id": 6,
  "date": "2023-11-24",
  "durationMinutes": 60,
  "shotsAttempted": 150,
  "shotsMade": 112,
  "fgPct": 74.7,
  "notes": "Focus on high release point and consistent follow-through."
}
```

### GET `/workouts/{id}`

Détail d'une session.

Response `200` :

```json
{
  "id": 4,
  "date": "2023-10-24",
  "displayDate": "Oct 24, 2023",
  "durationLabel": "45m 12s",
  "durationMinutes": 45,
  "overallAccuracy": 82.4,
  "shotsMade": 145,
  "shotsAttempted": 176,
  "trainingNotes": "Focused on high-intensity catch-and-shoot drills...",
  "hotZoneImprovement": "+4.2% improvement from last session",
  "shotZones": [
    {
      "zone": "Right Corner",
      "attempted": 44,
      "made": 36,
      "fgPct": 81.8
    }
  ]
}
```

### PATCH `/workouts/{id}`

Met à jour une session.

Request :

```json
{
  "date": "2023-11-24",
  "durationMinutes": 60,
  "shotsAttempted": 150,
  "shotsMade": 112,
  "notes": "Focus on high release point and consistent follow-through."
}
```

Response `200` : même structure que `GET /workouts/{id}`.

### DELETE `/workouts/{id}`

Supprime une session.

Response `204`.

## Dashboard

### GET `/dashboard`

Données nécessaires pour `/dashboard`.

Response `200` :

```json
{
  "totalSessions": 124,
  "sessionsChange": "+12 this month",
  "avgShootingPct": 68.4,
  "peakShooting": 82,
  "eliteTier": "Top 5%",
  "minutesTrained": 3420,
  "shootingTrend": [
    { "label": "S1", "value": 62 },
    { "label": "S2", "value": 68 },
    { "label": "S3", "value": 75 },
    { "label": "S4", "value": 71 },
    { "label": "S5", "value": 78 },
    { "label": "S6", "value": 65 },
    { "label": "S7", "value": 82 }
  ],
  "recentLogs": [
    {
      "id": 1,
      "date": "Oct 24, 2023",
      "title": "Morning Drill Routine",
      "duration": 45,
      "accuracy": 78.5
    }
  ]
}
```

Calculs :

- `totalSessions` : nombre total de sessions utilisateur
- `sessionsChange` : différence entre mois courant et mois précédent
- `avgShootingPct` : moyenne pondérée, `sum(made) / sum(attempted)`
- `peakShooting` : meilleur `fgPct`
- `minutesTrained` : somme des durées
- `shootingTrend` : 7 dernières sessions, labels `S1` à `S7`
- `recentLogs` : 3 dernières sessions

## Analytics

### GET `/analytics`

Données nécessaires pour `/analytics`.

Query params :

- `range=6w`

Response `200` :

```json
{
  "kpis": {
    "consistencyIndex": 87,
    "consistencyDelta": "+9 pts over baseline",
    "shotQuality": 74.8,
    "shotQualityLabel": "Best in close-range sets",
    "trainingLoad": 520,
    "trainingLoadLabel": "Attempts this week",
    "efficiencyDelta": "+6.4%",
    "efficiencyDeltaLabel": "Compared to prior cycle"
  },
  "trend": [
    { "label": "W1", "accuracy": 61, "volume": 420 },
    { "label": "W2", "accuracy": 64, "volume": 460 },
    { "label": "W3", "accuracy": 67, "volume": 510 },
    { "label": "W4", "accuracy": 63, "volume": 480 },
    { "label": "W5", "accuracy": 71, "volume": 560 },
    { "label": "W6", "accuracy": 68, "volume": 520 }
  ],
  "shotProfile": [
    { "zone": "Corner 3", "value": 78 },
    { "zone": "Wing", "value": 66 },
    { "zone": "Elbow", "value": 72 },
    { "zone": "Paint", "value": 84 },
    { "zone": "FT", "value": 91 }
  ],
  "zones": [
    { "label": "HOT ZONE", "area": "Right Corner", "value": "78.2%", "tone": "hot" },
    { "label": "STABLE", "area": "Free Throw Line", "value": "91.0%", "tone": "stable" },
    { "label": "FOCUS", "area": "Left Wing", "value": "58.4%", "tone": "focus" }
  ],
  "readout": {
    "text": "Accuracy is trending upward when weekly volume stays above 500 attempts.",
    "peakWeek": "W5",
    "volatility": "LOW"
  }
}
```

Calculs recommandés :

- `consistencyIndex` : score 0-100 basé sur l'écart-type des `fgPct`
- `shotQuality` : moyenne des zones avec volume significatif
- `trainingLoad` : nombre de tirs tentés sur la période
- `efficiencyDelta` : écart de précision entre période courante et période précédente
- `trend` : agrégation hebdomadaire
- `zones` :
  - `hot` : meilleure zone
  - `stable` : zone avec fort volume et faible variance
  - `focus` : zone avec plus faible efficacité

## Exports

Le bouton `Export Report` de `/analytics` peut appeler :

### GET `/analytics/export`

Query params :

- `range=6w`
- `format=json` ou `format=csv`

Pour commencer, retourner du JSON suffit. Le CSV peut être ajouté ensuite.

## Format d'erreur standard

Utiliser un format stable :

```json
{
  "detail": {
    "code": "VALIDATION_ERROR",
    "message": "shotsMade cannot be greater than shotsAttempted",
    "fields": {
      "shotsMade": "Must be lower than or equal to shotsAttempted"
    }
  }
}
```

Codes utiles :

- `VALIDATION_ERROR`
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_TOKEN_EXPIRED`
- `NOT_FOUND`
- `FORBIDDEN`
- `CONFLICT`

## Validations métier

Sessions :

- `shotsAttempted >= 0`
- `shotsMade >= 0`
- `shotsMade <= shotsAttempted`
- `durationMinutes > 0`
- `date` ne doit pas être vide
- `notes` max recommandé : 2000 caractères

Profil :

- `email` unique
- `username` non vide
- `displayName` non vide
- mot de passe minimum 8 caractères

## Intégration frontend

Le frontend utilise actuellement des données statiques dans `client/src/data.js` et dans `client/src/Analytics.jsx`.

Quand l'API sera prête, remplacer ces données par des appels :

- `/auth/login` depuis `/login`
- `/auth/register` depuis `/register`
- `/auth/me` pour la topbar et le profil
- `/dashboard` depuis `/dashboard`
- `/workouts` depuis `/workouts`
- `/workouts/{id}` depuis `/workouts/:id`
- `/workouts/{id}` en `PATCH` depuis `/workouts/:id/edit`
- `/analytics` depuis `/analytics`
- `/profile` depuis `/profile`

## Ordre d'implémentation recommandé

1. Corriger `api/main.py` pour avoir une app FastAPI valide.
2. Ajouter CORS.
3. Ajouter SQLAlchemy et les modèles `User`, `TrainingSession`, `ShotZone`.
4. Ajouter migrations ou création automatique SQLite en dev.
5. Implémenter `/auth/register`, `/auth/login`, `/auth/me`.
6. Implémenter `/workouts` CRUD.
7. Implémenter `/dashboard` avec agrégats.
8. Implémenter `/analytics` avec agrégats hebdomadaires.
9. Implémenter `/profile`, changement de mot de passe et suppression.
10. Brancher le frontend sur l'API.

## Exemple minimal de `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TrackMyGame API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}
```

## Données seed recommandées

Créer un utilisateur de démo :

```text
email: coach@performance.pro
password: password123
username: Julien Dubois
displayName: J. Carter
```

Créer au moins 24 sessions pour correspondre aux compteurs du frontend :

- 5 sessions récentes visibles dans `/workouts`
- 7 sessions pour la courbe dashboard
- 6 semaines d'historique pour `/analytics`

## Notes importantes

- Tous les endpoints hors `/auth/login`, `/auth/register` et `/health` doivent être protégés par JWT.
- Garder les noms JSON en camelCase pour faciliter l'intégration frontend.
- Les noms de colonnes database peuvent rester en snake_case.
- Les dates doivent être envoyées en ISO `YYYY-MM-DD`; le backend peut aussi retourner des labels formatés pour l'UI.
- Les pourcentages doivent être numériques, pas des strings, sauf les labels affichés comme `"+6.4%"`.
