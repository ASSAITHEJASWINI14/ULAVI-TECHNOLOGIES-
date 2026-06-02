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
from routes.settings import router as settings_router, get_smtp_config
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
    cfg = get_smtp_config()
    configured = bool(cfg["smtp_user"] and cfg["smtp_password"] and cfg["smtp_host"])
    return {"configured": configured, "host": cfg["smtp_host"]}


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
):
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

        # Use Google Translate for native → English translation
        english_translation = transcript
        if language != "en" and transcript:
            try:
                from deep_translator import GoogleTranslator
                english_translation = GoogleTranslator(source="auto", target="en").translate(transcript)
            except Exception:
                # Fallback: use Whisper's built-in translate task
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
        f"FROM (CUSTOMER): {req.from_email}",
        "",
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

    body = "\n".join(body_lines)

    # Get SMTP config (runtime settings take priority over .env)
    cfg = get_smtp_config()
    smtp_host = cfg["smtp_host"]
    smtp_user = cfg["smtp_user"]
    smtp_password = cfg["smtp_password"]
    smtp_port = cfg["smtp_port"]
    receiver_email = cfg["receiver_email"]

    if not receiver_email:
        raise HTTPException(
            status_code=400,
            detail="Receiver email not configured. Go to Settings → SMTP Configuration and set the receiver email."
        )

    status = "queued"
    error_msg = None

    if smtp_host and smtp_user and smtp_password:
        try:
            import aiosmtplib
            from email.message import EmailMessage

            msg = EmailMessage()
            msg["From"] = f"{req.from_email} via ULAVI <{smtp_user}>"
            msg["To"] = receiver_email
            msg["Subject"] = req.subject
            msg["Reply-To"] = req.from_email
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
            raise HTTPException(
                status_code=500,
                detail=f"Email sending failed: {error_msg}. Check your SMTP credentials in Settings."
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="SMTP not configured. Go to Settings → SMTP Configuration to add your Gmail credentials."
        )

    entry = {
        "id": token,
        "token": token,
        "to_email": receiver_email,
        "from_email": req.from_email,
        "subject": req.subject,
        "query": req.query,
        "phone_number": req.phone_number,
        "timestamp": req.timestamp,
        "status": status,
        "created_at": req.timestamp,
        "body": body,
    }

    outbox = load_outbox()
    outbox.insert(0, entry)
    save_outbox(outbox)

    return {
        "success": True,
        "message": "Email sent successfully",
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
