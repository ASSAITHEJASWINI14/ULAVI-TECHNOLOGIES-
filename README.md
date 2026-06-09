# ULAVI — Multilingual Voice Support Platform

End-to-end voice query system: record in any language, transcribe with Whisper, translate to English, and email support with **Query**, **Phone Number**, and **Timestamp**.
## 🌐 Live Demo
https://your-vercel-url.vercel.app

## Backend - on Render 
 https://ulavi-technologies.onrender.com

## 🎥 Demo Video
https://www.linkedin.com/posts/a-s-sai-thejaswini-2b57762b0_artificialintelligence-generativeai-openai-ugcPost-7469765981087682561-FWBu/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAErdNSkBx4lSmIMisW76JLdv5Lr62otbdOo

## 💻 Source Code
https://github.com/ASSAITHEJASWINI14/ULAVI-TECHNOLOGIES-

## Project structure

| Area | Path | Role |
|------|------|------|
| Frontend | `src/` | React + Vite UI (8 screens) |
| Backend | `backend/` | FastAPI, Whisper, SMTP email |
| Database | `supabase/` | Session history for dashboard |
| Week 3 test | `backend/test_week3_email.py` | Multi-country email API test |

## Features
- Voice Translation
- Speech-to-Text
- AI-Powered Responses
- Email Notifications
- Dashboard Analytics

## Tech Stack
- React + Vite
- FastAPI
- OpenAI
- Render
- Vercel

## Quick start

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env — SMTP_USER, SMTP_PASSWORD, SMTP_FROM
uvicorn main:app --reload
```

Or double-click `backend\start-backend.bat`.

API: http://127.0.0.1:8000

### 2. Frontend

```powershell
npm install
npm run dev
```

Set `VITE_API_URL=http://127.0.0.1:8000` in `.env` if needed.

### 3. Supabase (dashboard)

Apply `supabase/migrations/20260531120000_add_from_email_submitted_at.sql` in the Supabase SQL editor.

## User flow (Week 3)

1. **Landing** → Record voice (pick language)
2. **Processing** → Whisper + English translation
3. **Transcript** → Review text
4. **Contact** → Country code + phone, **From** email, **To** email (all editable)
5. **Email preview** → Confirm query, phone, timestamp
6. **Success** → Confirmation + reference token
7. **Dashboard** → Sent / Inbox views

## Email body (required fields)

Every email includes:

```
QUERY:
<english transcript>

PHONE NUMBER:
+91 9876543210

TIMESTAMP:
2026-05-31T12:00:00.000Z
```

## SMTP configuration

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Gmail account for App Password login |
| `SMTP_PASSWORD` | 16-character App Password |
| `SMTP_FROM` | Default From address (optional; UI can override) |

Users type **From** and **To** in the app. The backend sends with the From address from the request; SMTP login uses `SMTP_USER`.

## Week 3 certification

See **[WEEK3_CERTIFICATION.md](./WEEK3_CERTIFICATION.md)** for checklist, test steps, and evidence template.

Automated test (backend must be running):

```powershell
cd backend
.\venv\Scripts\activate
python test_week3_email.py
```

## Deploy online (not only on laptop)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** — host frontend on Vercel/Netlify, backend on Render/Railway, secrets in hosting env vars (not in Git).

## More docs

- [SETUP.md](./SETUP.md) — Detailed setup and API reference
- [RUN.md](./RUN.md) — Run scripts and troubleshooting
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment guide
