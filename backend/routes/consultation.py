from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.consultation_service import chat, recommend

router = APIRouter(prefix="/api/consultation", tags=["consultation"])


class ConsultationContext(BaseModel):
    days: Optional[str] = ""
    persons: Optional[str] = ""
    budget: Optional[str] = ""
    food_preference: Optional[str] = Field(default="", alias="foodPreference")
    package_preference: Optional[str] = Field(default="", alias="packagePreference")
    additional_preferences: Optional[str] = Field(default="", alias="additionalPreferences")
    transcript: Optional[str] = ""

    model_config = {"populate_by_name": True}


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    context: ConsultationContext = ConsultationContext()


class ChatResponse(BaseModel):
    answer: str


class RecommendRequest(BaseModel):
    days: Optional[str] = ""
    persons: Optional[str] = ""
    budget: Optional[str] = ""
    foodPreference: Optional[str] = ""
    packagePreference: Optional[str] = ""
    additionalPreferences: Optional[str] = ""
    transcript: Optional[str] = ""


class RecommendResponse(BaseModel):
    recommendations: str


@router.post("/chat", response_model=ChatResponse)
async def consultation_chat(request: ChatRequest):
    try:
        context_dict = {
            "days": request.context.days,
            "persons": request.context.persons,
            "budget": request.context.budget,
            "foodPreference": request.context.food_preference,
            "packagePreference": request.context.package_preference,
            "additionalPreferences": request.context.additional_preferences,
            "transcript": request.context.transcript,
        }
        answer = chat(request.query, context_dict)
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/recommend", response_model=RecommendResponse)
async def consultation_recommend(request: RecommendRequest):
    try:
        data = {
            "days": request.days,
            "persons": request.persons,
            "budget": request.budget,
            "foodPreference": request.foodPreference,
            "packagePreference": request.packagePreference,
            "additionalPreferences": request.additionalPreferences,
            "transcript": request.transcript,
        }
        result = recommend(data)
        return RecommendResponse(recommendations=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")
