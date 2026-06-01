import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/settings", tags=["settings"])

# Runtime-only key store — never written to disk
_runtime_key: str = ""


def get_runtime_key() -> str:
    return _runtime_key or os.getenv("OPENAI_API_KEY", "")


class OpenAIKeyRequest(BaseModel):
    api_key: str


class OpenAIKeyResponse(BaseModel):
    success: bool
    message: str


class AIStatusResponse(BaseModel):
    enabled: bool
    has_key: bool
    model: str


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

    # Also update the environment variable so the consultation service picks it up immediately
    if key:
        os.environ["OPENAI_API_KEY"] = key
    else:
        os.environ.pop("OPENAI_API_KEY", None)

    if key:
        return OpenAIKeyResponse(success=True, message="API key activated for this session.")
    else:
        return OpenAIKeyResponse(success=True, message="API key cleared. Using fallback responses.")
