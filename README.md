# Eco-Collect.ke

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![Frontend](https://img.shields.io/badge/Next.js-React-black)](https://nextjs.org/)

> Waste-collection rewards platform connecting civilians and collection centres through AI-powered waste classification.

---

## Table of contents

- [Eco-Collect.ke](#eco-collectke)
  - [Table of contents](#table-of-contents)
  - [About](#about)
  - [Features](#features)
  - [Tech stack](#tech-stack)
  - [Quickstart (dev)](#quickstart-dev)
  - [Configuration](#configuration)
  - [API (short reference)](#api-short-reference)
    - [Auth](#auth)
    - [Centres](#centres)
    - [Classification \& Uploads](#classification--uploads)
    - [Verification (corporate)](#verification-corporate)
  - [Database schema (summary)](#database-schema-summary)
  - [AI integration](#ai-integration)
  - [Storage \& uploads](#storage--uploads)
  - [Points calculation](#points-calculation)
  - [Testing \& local development](#testing--local-development)
  - [Security \& rate limiting](#security--rate-limiting)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)

---

## About

Eco-Collect.ke allows civilians to upload/capture photos of waste, get them classified by an AI model, and earn reward points when verified at collection centres managed by corporate users.

---

## Features

* Role-based users: **civilian** and **corporate (centre manager)**
* AI-powered image classification (waste category + confidence)
* Upload submission flow: image → classify → enter weight → choose centre → submit
* Corporate verification (approve/reject, adjust weight/category)
* Points ledger & history
* Next.js frontend + Flask REST backend

---

## Tech stack

* Frontend: **Next.js (React)**, Tailwind CSS (recommendation)
* Backend: **Flask**, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-Migrate
* Database: **SQLite** (dev), PostgreSQL/MySQL recommended for production
* AI: Hugging Face model `belab/waste-classification` (Inference API or local)
* Storage: Local `uploads/` (dev), Amazon S3 or S3-compatible for prod

---

## Quickstart (dev)

1. Clone the repo

```bash
git clone https://github.com/REPLACE_OWNER/Eco-Collect.KE.git
cd Eco-Collect.KE
```

2. Backend (Python 3.10+)

```bash
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env      # update values
flask db upgrade          # run migrations
flask run                 # default: http://localhost:5000
```

3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev               # default: http://localhost:3000
```

Or run `docker-compose up --build` if Docker files are present.

---

## Configuration

Place secrets in `.env` (backend) and `.env.local` (frontend). Example keys:

```
# Backend
DATABASE_URL=sqlite:///data.db
JWT_SECRET_KEY=REPLACE_ME
HF_API_KEY=REPLACE_ME
UPLOAD_FOLDER=uploads/
MAX_CONTENT_LENGTH=5242880
# S3 (optional)
S3_ENDPOINT_URL=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

**Do not commit** `.env` files.

---

## API (short reference)

All endpoints are JSON-based. File uploads use `multipart/form-data`. Include `Authorization: Bearer <access_token>` for protected routes.

### Auth

* `POST /api/register` — create account
* `POST /api/login` — returns `access_token` and `refresh_token`

### Centres

* `GET /api/centres` — list centres
* `POST /api/centres` — create centre (corporate only)

### Classification & Uploads

* `POST /api/classify` — upload image, returns `{ category, confidence }` (multipart)
* `POST /api/uploads` — submit image + weight + centre_id (multipart)
* `GET /api/uploads` — list user's uploads

### Verification (corporate)

* `GET /api/uploads?centre_id={id}&status=pending` — pending submissions
* `PATCH /api/uploads/{upload_id}/verify` — approve/reject

  * Request example:

  ```json
  { "approved": true, "new_weight": 2.3, "new_category": "metal" }
  ```

---

## Database schema (summary)

* `users` (id, username, email, password_hash, role)
* `centres` (id, name, location, capacity, contact, manager_id)
* `uploads` (id, user_id, centre_id, image_path, category, confidence, weight, points, status, created_at)
* `points_history` (id, user_id, upload_id, points, timestamp)

Use Alembic/Flask-Migrate for schema changes.

---

## AI integration

Two supported modes:

1. **Hugging Face Inference API** (recommended for quick setup) — requires `HF_API_KEY`.
2. **Local `transformers` pipeline** — heavier but no external calls.

Example (Hugging Face HTTP):

```python
api_url = "https://api-inference.huggingface.co/models/belab/waste-classification"
headers = {"Authorization": f"Bearer {HF_API_KEY}"}
files = {"file": open('image.jpg','rb')}
res = requests.post(api_url, headers=headers, files=files)
```

Map labels to internal categories; reject or flag low-confidence predictions for manual review.

---

## Storage & uploads

* Dev: `uploads/` directory (unique filenames via UUID)
* Prod: use S3 (boto3) or MinIO with env var-driven config
* Limit upload size with `MAX_CONTENT_LENGTH` and validate MIME types

---

## Points calculation

Server-side example:

```python
BASE_POINTS_PER_KG = 10

def calculate_points(weight_kg, confidence, category_factor=1.0):
    return int(weight_kg * BASE_POINTS_PER_KG * confidence * category_factor)
```

---

## Testing & local development

* Backend tests: `pytest`, `pytest-flask`
* Frontend: Jest / React Testing Library recommended
* Linters/formatters: Black, Flake8 (Python); ESLint, Prettier (JS)

---

## Security & rate limiting

* Use JWTs and secure secrets
* Hash passwords (bcrypt/passlib)
* Enforce CORS to allowed origins only
* Use `Flask-Limiter` for rate limiting (e.g., login attempts)
* Serve over HTTPS in production

---

## Roadmap

* PWA / mobile apps
* Rewards marketplace
* Leaderboards & analytics for centres
* Anti-fraud features (GPS verification, duplicate detection)
* Model fine-tuning & expanded categories

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run tests and linters
4. Open a PR with a clear description

Please follow the code style and include tests for new features.

---

## License

This project is released under the **MIT License**. See `LICENSE`.

---

