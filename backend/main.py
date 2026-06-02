import os
import json
import time
import uuid
import asyncio
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ULAVI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
from routes.consultation import router as consultation_router
from routes.settings import router as settings_router
app.include_router(consultation_router)
app.include_router(settings_router)

OUTBOX_FILE = Path("email_outbox.json")

def load_outbox():
    if OUTBOX_FILE.exists():
        try:
            return json.loads(OUTBOX_FILE.read_text())
        except Exception:
            return []
    return []

def save_outbox(entries):
    OUTBOX_FILE.write_text(json.dumps(entries, indent=2))


@app.get("/")
def root():
    return {"status": "ULAVI Backend running", "version": "1.0.0"}


@app.get("/smtp-config")
def smtp_config():
    configured = bool(
        os.getenv("SMTP_USER") and
        os.getenv("SMTP_PASSWORD") and
        os.getenv("SMTP_HOST")
    )
    return {"configured": configured, "host": os.getenv("SMTP_HOST", "")}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
):
    # Check Whisper is importable
    try:
        import whisper
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail=(
                "openai-whisper is not installed. "
                "Run in your backend terminal: pip install openai-whisper"
            )
        )

    # Check torch is available (whisper needs it)
    try:
        import torch  # noqa: F401
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail=(
                "PyTorch is not installed (required by Whisper). "
                "Run: pip install torch --index-url https://download.pytorch.org/whl/cpu"
            )
        )

    # Save uploaded audio to a temp file
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received.")

    suffix = ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model_name = os.getenv("WHISPER_MODEL", "tiny")

        try:
            model = whisper.load_model(model_name)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load Whisper model '{model_name}': {str(e)}"
            )

        try:
            result = model.transcribe(
                tmp_path,
                language=language if language != "en" else None
            )
        except Exception as e:
            err = str(e)
            is_ffmpeg_error = (
                "ffmpeg" in err.lower() or
                "winerror 2" in err.lower() or
                "the system cannot find the file" in err.lower() or
                "no such file or directory" in err.lower()
            )
            if is_ffmpeg_error:
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "ffmpeg is not installed or not in PATH. "
                        "Windows: run  winget install ffmpeg  then close & reopen your terminal. "
                        "Mac: run  brew install ffmpeg"
                    )
                )
            raise HTTPException(
                status_code=500,
                detail=f"Transcription failed: {err}"
            )

        transcript = result.get("text", "").strip()

        english_translation = transcript
        if language != "en" and transcript:
            try:
                translation_result = model.transcribe(tmp_path, task="translate")
                english_translation = translation_result.get("text", "").strip()
            except Exception:
                pass

        return {
            "transcript": transcript,
            "english_translation": english_translation,
            "language": language,
        }

    finally:
        Path(tmp_path).unlink(missing_ok=True)


class SendEmailRequest(BaseModel):
    to_email: str
    from_email: str
    subject: str
    query: str
    phone_number: str
    timestamp: str
    consultation: Optional[dict] = None


@app.post("/send-email")
async def send_email(req: SendEmailRequest):
    token = "ULAVI-" + uuid.uuid4().hex[:8].upper()

    body_lines = [
        "QUERY:",
        req.query,
        "",
        "PHONE NUMBER:",
        req.phone_number,
        "",
        "TIMESTAMP:",
        req.timestamp,
    ]

    if req.consultation:
        c = req.consultation
        has_data = any([
            c.get("days"), c.get("persons"), c.get("budget"),
            c.get("packagePreference"), c.get("foodPreference")
        ])
        if has_data:
            body_lines += ["", "--- CONSULTATION DETAILS ---"]
            if c.get("days"):
                body_lines.append(f"Days: {c['days']}")
            if c.get("persons"):
                body_lines.append(f"Persons: {c['persons']}")
            if c.get("budget"):
                body_lines.append(f"Budget: {c['budget']}")
            if c.get("packagePreference"):
                body_lines.append(f"Package: {c['packagePreference']}")
            if c.get("foodPreference"):
                body_lines.append(f"Food Preference: {c['foodPreference']}")
            if c.get("additionalPreferences"):
                body_lines.append(f"Additional: {c['additionalPreferences']}")

        chat_history = c.get("chatHistory", [])
        if chat_history:
            body_lines += ["", "--- Q&A ---"]
            for msg in chat_history:
                role = "User" if msg.get("role") == "user" else "AI"
                body_lines.append(f"{role}: {msg.get('content', '')}")

        if c.get("recommendations"):
            body_lines += ["", "--- RECOMMENDATIONS ---", c["recommendations"]]

    body = "\n".join(body_lines)

    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    status = "queued"
    error_msg = None

    if smtp_host and smtp_user and smtp_password:
        try:
            import aiosmtplib
            from email.message import EmailMessage

            msg = EmailMessage()
            msg["From"] = req.from_email
            msg["To"] = req.to_email
            msg["Subject"] = req.subject
            msg.set_content(body)

            await aiosmtplib.send(
                msg,
                hostname=smtp_host,
                port=smtp_port,
                username=smtp_user,
                password=smtp_password,
                start_tls=True,
            )
            status = "sent"
        except Exception as e:
            error_msg = str(e)
            status = "failed"
    else:
        status = "queued"

    entry = {
        "id": token,
        "token": token,
        "to_email": req.to_email,
        "from_email": req.from_email,
        "subject": req.subject,
        "query": req.query,
        "phone_number": req.phone_number,
        "timestamp": req.timestamp,
        "status": status,
        "created_at": req.timestamp,
        "body": body,
    }
    if error_msg:
        entry["error"] = error_msg

    outbox = load_outbox()
    outbox.insert(0, entry)
    save_outbox(outbox)

    return {
        "success": status in ("sent", "queued"),
        "message": f"Email {status}",
        "token": token,
        "status": status,
    }


@app.get("/email-outbox")
def email_outbox():
    return load_outbox()


@app.get("/history")
def history():
    return load_outbox()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
