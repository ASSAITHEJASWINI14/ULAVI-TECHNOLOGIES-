# ULAVI Speech Integration — Run Guide

## Backend

**Easiest (double-click):** `backend\start-backend.bat`

**Or in PowerShell:**

```powershell
cd "c:\Users\A S SAI THEJASWINI\OneDrive\Desktop\ULAVI TECHNOLOGIES\project\backend"
.\venv\Scripts\activate
uvicorn main:app --reload
```

Important: run from the `backend` folder and use the **venv** uvicorn — not global `uvicorn` from another Python install.

### Better transcription accuracy

1. **Always pick your language** in the dropdown before recording.
2. Speak clearly for **5–20 seconds** in a quiet room.
3. Restart backend after updates (`pip install -r requirements.txt`).
4. Default model is **`small`** (accuracy). Slower but better than `tiny`.
5. For **Telugu, Kannada, Malayalam, Tamil**: pick the correct language before recording. The backend uses native-script prompts and a dedicated English pass from audio. If quality is still weak, set `WHISPER_MODEL=medium` in `backend/.env` and restart (slower on CPU).
6. English translation uses **Whisper translate** first, then **Google Translate** as fallback (needs internet).

### Slow processing?

Whisper runs on **CPU** by default. First recording after server start is slower (model warmup).

- Default model is **`tiny`** (fast). For better accuracy:  
  `set WHISPER_MODEL=base` then restart backend.
- Non-English audio runs **two** passes (transcribe + translate to English).
- Keep recordings **under 30 seconds** for faster results.
- Install **ffmpeg** (`winget install ffmpeg`) for quicker audio decoding.

API: http://127.0.0.1:8000

## Frontend

```powershell
npm install
npm run dev
```

## Optional: ffmpeg (recommended)

```powershell
winget install ffmpeg
```

Restart the terminal after install.

## Test flow

1. Open the Vite URL from `npm run dev`
2. Click **Click the Button to Speak** → choose language → record → stop
3. Wait for processing → **Process Next** → review transcripts on Screen 4

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/transcribe` | Upload audio → Whisper transcription |
| GET | `/history` | List saved transcripts |
| POST | `/send-email` | Send email with **Query**, **Phone Number**, and **Timestamp** in body |
| GET | `/email-outbox` | List sent/queued emails (local history) |
| GET | `/smtp-config` | Check if Gmail SMTP is configured |

### Week 3 — Email & Test (Gmail delivery)

Every support email includes these three fields in the body:

1. **QUERY** — English transcript of the voice message  
2. **PHONE NUMBER** — Country code + number (e.g. `+91 9876543210`)  
3. **TIMESTAMP** — ISO UTC time when the user submitted  

Users enter **both From and To Gmail addresses** on the Contact screen. After sending:

- The **From** address appears in that Gmail account's **Sent** folder  
- The **To** address receives the email in their **Inbox**  
- Both appear in the **Dashboard** (Sent / Inbox tabs)

#### Step 1 — Gmail App Password

1. Open [Google Account → Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already on
3. Go to **App passwords** → create one for "Mail" / "Other (ULAVI)"
4. Copy the 16-character password (no spaces)

#### Step 2 — Backend `.env`

```powershell
copy backend\.env.example backend\.env
```

Edit `backend\.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sender@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=your-sender@gmail.com
WHISPER_MODEL=small
TEST_TO_EMAIL=support@gmail.com
```

- **SMTP_USER** — Gmail account used to log in (App Password).
- **SMTP_FROM** — Optional default From address pre-filled in the UI (users can change it on the Contact screen).
- For reliable Gmail delivery, the **From** address in the app should match the App Password account (`SMTP_USER`).

#### Step 3 — Supabase migration (dashboard history)

Run this in your Supabase SQL editor (or apply the migration file):

```sql
ALTER TABLE ulavi_sessions
  ADD COLUMN IF NOT EXISTS from_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
```

File: `supabase/migrations/20260531120000_add_from_email_submitted_at.sql`

#### Step 4 — Install & restart backend

```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Step 5 — Test with two country codes

```powershell
# Edit test_week3_email.py with your real from/to Gmail addresses first
python test_week3_email.py
```

Or test manually in the app:

1. Record a voice query  
2. On Contact screen: pick **+91** (India) or **+1** (US), enter phone, **From Gmail**, **To Gmail**  
3. Preview → **Confirm & Send Email**  
4. Check sender Gmail **Sent** and recipient Gmail **Inbox**  
5. Open **Dashboard** → verify **Sent** and **Inbox** tabs show the message with query, phone, timestamp  

Without SMTP, payloads are saved to `backend/email_outbox.json` (status: queued).
