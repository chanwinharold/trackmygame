# TrackMyGame Deployment

Stack cible: React/Vite sur Vercel, FastAPI sur Render, PostgreSQL sur Neon.

## 1. Neon

1. Créer un projet Neon.
2. Copier l'URL de connexion PostgreSQL poolée.
3. Utiliser le format standard Neon, par exemple:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

L'API normalise automatiquement `postgresql://` vers le driver SQLAlchemy `postgresql+psycopg://`.

## 2. Render API

Créer un Web Service Render depuis ce repo.

Configuration:

```text
Root directory: .
Build command: pip install -r api/requirements.txt
Start command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
Health check path: /health
```

Variables d'environnement Render:

```env
APP_ENV=production
DATABASE_URL=<NEON_DATABASE_URL>
JWT_SECRET=<long-secret-generated>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_ORIGIN=https://<your-vercel-domain>
EXTRA_CORS_ORIGINS=https://<optional-custom-domain>
```

Le service crée les tables au démarrage si elles n'existent pas et seed un compte de démo uniquement quand la base est vide:

```text
email: coach@performance.pro
password: password123
```

## 3. Vercel Frontend

Créer un projet Vercel avec le dossier `client` comme racine.

Configuration:

```text
Framework: Vite
Root directory: client
Build command: pnpm build
Output directory: dist
Install command: pnpm install
```

Variable d'environnement Vercel:

```env
VITE_API_BASE_URL=https://<your-render-service>.onrender.com
```

Le fichier `client/vercel.json` configure les rewrites nécessaires aux routes React Router.

## 4. Développement local

Backend:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
cp api/.env.example api/.env
uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd client
pnpm install
cp .env.example .env
pnpm dev
```

Ouvrir `http://127.0.0.1:5173`.

## 5. Smoke tests production

Après déploiement:

```bash
curl https://<render-service>.onrender.com/health
```

Puis tester dans Vercel:

1. Inscription d'un nouvel utilisateur.
2. Connexion.
3. Création d'une session depuis `Workouts`.
4. Modification puis suppression d'une session.
5. Chargement de `Dashboard`, `Analytics` et `Profile`.

## 6. Notes production

- Remplacer `JWT_SECRET` par une valeur longue et unique.
- Garder `FRONTEND_ORIGIN` strictement aligné avec le domaine Vercel final.
- Pour une vraie montée en charge, ajouter Alembic avant les changements de schéma futurs. La version actuelle crée les tables automatiquement pour simplifier le premier déploiement Render/Neon.
