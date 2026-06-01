# ULAVI — Run the App (3 Steps)

## Step 1 — One-time setup (first time only)

Double-click:

```
SETUP-ONCE.bat
```

This installs all dependencies and opens `backend\.env` for you to add Gmail credentials.

### Gmail App Password (required for real email delivery)

1. Open https://myaccount.google.com/apppasswords  
2. Create password for **Mail**  
3. Edit `backend\.env`:

```
SMTP_USER=your-sender@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

**Rule:** The **From** email you enter in the app must match `SMTP_USER`.

### Supabase (optional, for dashboard history in cloud)

If setup prints a SQL message, open your [Supabase SQL Editor](https://supabase.com/dashboard/project/bqvuouaxqgcmkprpzrba/sql/new) and run:

```sql
ALTER TABLE ulavi_sessions
  ADD COLUMN IF NOT EXISTS from_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
```

---

## Step 2 — Start the app (every time)

Double-click:

```
START-APP.bat
```

Two windows open:
- **Backend** → http://127.0.0.1:8000  
- **Frontend** → http://localhost:5173  

Open **http://localhost:5173** in Chrome/Edge.

---

## Step 3 — Week 3 test flow

### Test A — India (+91)

1. Click **Click the Button to Speak**
2. Choose a language → record 5–10 seconds → stop
3. Wait for processing → **Process Next** → review transcript → **Next**
4. Contact screen:
   - Country: **+91 India**
   - Phone: `9876543210`
   - **From:** your sender Gmail (same as `SMTP_USER`)
   - **To:** recipient Gmail
5. **Preview Email** → verify **Query**, **Phone Number**, **Timestamp**
6. **Confirm & Send Email**
7. Check sender Gmail → **Sent** folder
8. Check recipient Gmail → **Inbox**
9. Click **Dashboard** → **Sent** and **Inbox** tabs

### Test B — United States (+1)

Repeat with:
- Country: **+1 US/Canada**
- Phone: `4155550199`
- Different recipient Gmail (optional)

---

## Quick test without voice (backend only)

```powershell
cd backend
.\venv\Scripts\activate
python test_week3_email.py
```

Edit `test_week3_email.py` first — set your real `from_email` and `to_email`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Email shows "Queued" not "Sent" | Fill in `backend\.env` Gmail App Password |
| "From address must match..." | Use the same Gmail as `SMTP_USER` in `.env` |
| Backend won't start | Run `SETUP-ONCE.bat` again |
| No transcript / slow | Install ffmpeg: `winget install ffmpeg` |
| Dashboard empty | Run Supabase SQL above, or check **Sent** tab (uses local outbox too) |

---

## What satisfies Week 3

| Requirement | Where |
|-------------|-------|
| Email body: Query + Number + Timestamp | Backend `_build_email_body()` |
| From + To email inputs | Contact screen (Step 3) |
| Confirmation before send | Email Preview screen |
| Confirmation after send | Success screen |
| Real Gmail delivery | `backend\.env` SMTP |
| Sent folder (sender) | Check sender Gmail |
| Inbox (recipient) | Check recipient Gmail |
| History in dashboard | Dashboard → Sent / Inbox tabs |
| 2 country codes tested | +91 and +1 on Contact screen |
