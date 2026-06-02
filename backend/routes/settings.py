import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/settings", tags=["settings"])

# Runtime-only stores — never written to disk
_runtime_key: str = ""

_smtp_config: dict = {
    "smtp_host": "",
    "smtp_port": 587,
    "smtp_user": "",
    "smtp_password": "",
    "receiver_email": "",
}


def get_runtime_key() -> str:
    return _runtime_key or os.getenv("OPENAI_API_KEY", "")


def get_smtp_config() -> dict:
    return {
        "smtp_host": _smtp_config["smtp_host"] or os.getenv("SMTP_HOST", ""),
        "smtp_port": _smtp_config["smtp_port"] or int(os.getenv("SMTP_PORT", "587")),
        "smtp_user": _smtp_config["smtp_user"] or os.getenv("SMTP_USER", ""),
        "smtp_password": _smtp_config["smtp_password"] or os.getenv("SMTP_PASSWORD", ""),
        "receiver_email": _smtp_config["receiver_email"] or os.getenv("RECEIVER_EMAIL", ""),
    }


class OpenAIKeyRequest(BaseModel):
    api_key: str


class OpenAIKeyResponse(BaseModel):
    success: bool
    message: str


class AIStatusResponse(BaseModel):
    enabled: bool
    has_key: bool
    model: str


class SmtpConfigRequest(BaseModel):
    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    receiver_email: str


class SmtpConfigResponse(BaseModel):
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password_set: bool
    receiver_email: str


@router.get("/ai-status", response_model=AIStatusResponse)
def ai_status():
    key = get_runtime_key()
    enabled = bool(key and key.startswith("sk-"))
    return AIStatusResponse(
        enabled=enabled,
        has_key=enabled,
        model="gpt-3.5-turbo" if enabled else "",
    )


@router.post("/openai-key", response_model=OpenAIKeyResponse)
def set_openai_key(req: OpenAIKeyRequest):
    global _runtime_key
    key = req.api_key.strip()

    if key and not key.startswith("sk-"):
        return OpenAIKeyResponse(success=False, message="Invalid key format — OpenAI keys start with 'sk-'.")

    _runtime_key = key

    if key:
        os.environ["OPENAI_API_KEY"] = key
    else:
        os.environ.pop("OPENAI_API_KEY", None)

    if key:
        return OpenAIKeyResponse(success=True, message="API key activated for this session.")
    else:
        return OpenAIKeyResponse(success=True, message="API key cleared. Using fallback responses.")


@router.get("/smtp", response_model=SmtpConfigResponse)
def get_smtp():
    cfg = get_smtp_config()
    return SmtpConfigResponse(
        smtp_host=cfg["smtp_host"],
        smtp_port=cfg["smtp_port"],
        smtp_user=cfg["smtp_user"],
        smtp_password_set=bool(cfg["smtp_password"]),
        receiver_email=cfg["receiver_email"],
    )


@router.post("/smtp", response_model=OpenAIKeyResponse)
def set_smtp(req: SmtpConfigRequest):
    global _smtp_config
    _smtp_config["smtp_host"] = req.smtp_host.strip()
    _smtp_config["smtp_port"] = req.smtp_port
    _smtp_config["smtp_user"] = req.smtp_user.strip()
    if req.smtp_password.strip():
        _smtp_config["smtp_password"] = req.smtp_password.strip()
    _smtp_config["receiver_email"] = req.receiver_email.strip()

    # Apply to environment so send-email picks it up immediately
    os.environ["SMTP_HOST"] = _smtp_config["smtp_host"]
    os.environ["SMTP_PORT"] = str(_smtp_config["smtp_port"])
    os.environ["SMTP_USER"] = _smtp_config["smtp_user"]
    if _smtp_config["smtp_password"]:
        os.environ["SMTP_PASSWORD"] = _smtp_config["smtp_password"]
    os.environ["RECEIVER_EMAIL"] = _smtp_config["receiver_email"]

    return OpenAIKeyResponse(success=True, message="SMTP configuration saved for this session.")
