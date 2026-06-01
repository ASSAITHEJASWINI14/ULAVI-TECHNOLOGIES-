# Deploy ULAVI (not only on your laptop)

Your app has **three parts**. Only the backend holds secrets like `SMTP_PASSWORD`.

| Part | What it is | Where to host |
|------|------------|----------------|
| **Frontend** | React (Vite) | Vercel, Netlify, or Cloudflare Pages (free) |
| **Backend** | FastAPI + Whisper + email | Render, Railway, or Fly.io |
| **Database** | Supabase | Already in the cloud |

You **do not** upload `backend/.env` to GitHub. You paste the same values into the hosting website’s **Environment Variables** panel.

---

## Before you deploy

1. Push project to **GitHub** (private repo recommended).
2. Confirm `.gitignore` excludes `backend/.env` and root `.env`.
3. Have Gmail **App Password** ready (same as local).
4. Supabase migration applied (`from_email`, `submitted_at` columns).

---

## Step 1 — Deploy backend (API + email)

### Option A: Render (good for students)

1. Go to [render.com](https://render.com) → Sign up → **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root directory:** `backend`
   - **Runtime:** Docker (if using `backend/Dockerfile`) **or** Python
   - **Build command (Python):** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance type:** at least **512 MB RAM**; Whisper works better with **1 GB+** (use `WHISPER_MODEL=tiny` on small plans).

4. **Environment variables** (Render → Environment):

   | Key | Value |
   |-----|--------|
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `assaithejaswini@gmail.com` |
   | `SMTP_PASSWORD` | your 16-char App Password |
   | `SMTP_FROM` | `assaithejaswini@gmail.com` |
   | `WHISPER_MODEL` | `tiny` (faster on cloud; use `small` if you have more RAM) |

5. Deploy. Copy your URL, e.g. `https://ulavi-api.onrender.com`.

6. Test: open `https://YOUR-API-URL/smtp-config` → `"configured": true`.

**Note:** Free Render services **sleep** after inactivity; first request may be slow (30–60 s).

### Option B: Railway

Same env vars as above. Connect repo, set root to `backend`, deploy with Docker or Python start command.

### Docker (Render / Railway / Fly)

From repo root, the included `backend/Dockerfile` installs `ffmpeg` and runs uvicorn. Set env vars in the dashboard (not in the image).

---

## Step 2 — Deploy frontend

### Vercel (example)

1. [vercel.com](https://vercel.com) → Import GitHub repo.
2. **Framework:** Vite  
3. **Root directory:** project root (where `package.json` is)  
4. **Build command:** `npm run build`  
5. **Output directory:** `dist`  

6. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | `https://YOUR-API-URL` (no trailing slash) |
   | `VITE_SUPABASE_URL` | from Supabase dashboard |
   | `VITE_SUPABASE_ANON_KEY` | from Supabase dashboard |

7. Deploy. You get a public URL like `https://ulavi.vercel.app`.

Rebuild/redeploy whenever you change `VITE_*` variables.

### Netlify

Same as Vercel: build `npm run build`, publish `dist`, set the three `VITE_*` env vars.

---

## Step 3 — Gmail on a server (same as laptop)

On the cloud server you still use:

- `SMTP_USER` + `SMTP_PASSWORD` (App Password) in **hosting env vars**
- Users type **From / To** in the app UI

Gmail does not care whether the code runs on your laptop or Render — only that login credentials are correct.

**Do not** put `SMTP_PASSWORD` in frontend env vars. Only the backend.

---

## Step 4 — Verify production

1. Open your **Vercel URL** in a browser (phone or another PC).
2. Record → Contact → use `assaithejaswini@gmail.com` as From/To.
3. Send email → check Gmail.
4. Dashboard should load sessions from Supabase.

---

## Architecture after deploy

```
User browser  →  Vercel (React)
                    ↓ VITE_API_URL
                Render (FastAPI + SMTP + Whisper)
                    ↓
                Supabase (sessions)
                    ↓
                Gmail SMTP → Inbox
```

---

## Certification / demo options

| Approach | Good for |
|----------|----------|
| **Full deploy** (Vercel + Render) | Judges open a public link from any device |
| **Frontend only on Vercel** + backend on laptop via temporary tunnel | Quick demo if Whisper on cloud is too slow |
| **Video + screenshots** + public frontend | If backend stays local for one presentation |

For most certifications, **public frontend + public backend** is strongest.

---

## Costs

- Vercel / Netlify frontend: free tier usually enough.
- Render / Railway: free tier with limits; Whisper may need paid tier for reliability.
- Supabase: free tier for small projects.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend can’t reach API | Set `VITE_API_URL` to https API URL; redeploy frontend |
| CORS error | Backend already allows `*`; ensure API URL is correct |
| `configured: false` | Add SMTP env vars on **backend** host, redeploy |
| Transcribe timeout | Use `WHISPER_MODEL=tiny`; upgrade RAM; shorter recordings |
| 502 on email | Wrong App Password; regenerate in Google |

---

## Security checklist

- [ ] `backend/.env` not in Git  
- [ ] App Password only in Render/Railway env vars  
- [ ] Supabase **anon** key in frontend is OK (RLS should protect data)  
- [ ] Never put `SMTP_PASSWORD` in `VITE_*` variables
