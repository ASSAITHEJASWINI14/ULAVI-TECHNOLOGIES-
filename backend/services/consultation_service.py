import os
import json
from typing import Optional

try:
    from openai import OpenAI
    _openai_available = True
except ImportError:
    _openai_available = False


def _get_openai_client() -> Optional[object]:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or not _openai_available:
        return None
    return OpenAI(api_key=api_key)


def _build_context_summary(context: dict) -> str:
    parts = []
    if context.get("transcript"):
        parts.append(f"User query (transcribed): {context['transcript']}")
    if context.get("days"):
        parts.append(f"Number of days: {context['days']}")
    if context.get("persons"):
        parts.append(f"Number of persons: {context['persons']}")
    if context.get("budget"):
        parts.append(f"Budget: {context['budget']}")
    if context.get("packagePreference"):
        parts.append(f"Package preference: {context['packagePreference']}")
    if context.get("foodPreference"):
        parts.append(f"Food preference: {context['foodPreference']}")
    if context.get("additionalPreferences"):
        parts.append(f"Additional preferences: {context['additionalPreferences']}")
    return "\n".join(parts) if parts else "No additional context provided."


def chat(query: str, context: dict) -> str:
    client = _get_openai_client()
    context_summary = _build_context_summary(context)

    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful AI assistant for ULAVI, a multilingual voice support platform. "
                            "You help users with their queries, provide recommendations, and assist with planning. "
                            "You are generic and can handle any domain: travel, education, healthcare, events, etc. "
                            "Be concise, helpful, and practical."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Context about the user's request:\n{context_summary}\n\n"
                            f"User question: {query}"
                        ),
                    },
                ],
                max_tokens=600,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return _fallback_chat(query, context)

    return _fallback_chat(query, context)


def recommend(collected_data: dict) -> str:
    client = _get_openai_client()
    context_summary = _build_context_summary(collected_data)

    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert recommendation AI for ULAVI. "
                            "Based on the user's requirements, generate structured recommendations. "
                            "Your response should cover: key recommendations, suggested plans, "
                            "budget considerations, relevant suggestions (food/activities/services), "
                            "and general guidance. Keep it practical and actionable. "
                            "Format the response clearly with sections."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Generate recommendations based on these requirements:\n{context_summary}"
                        ),
                    },
                ],
                max_tokens=800,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return _fallback_recommend(collected_data)

    return _fallback_recommend(collected_data)


def _fallback_chat(query: str, context: dict) -> str:
    q = query.lower()
    days = context.get("days", "")
    budget = context.get("budget", "")
    persons = context.get("persons", "")
    food = context.get("foodPreference", "")

    if any(w in q for w in ["itinerary", "plan", "schedule", "day"]):
        d = f" over {days} days" if days else ""
        return (
            f"Here's a suggested plan{d}: Start with an overview of your main goal, "
            "then break it into daily milestones. Focus on the highest-priority activities first, "
            "then add supplementary ones. Build in buffer time for unexpected needs. "
            "Would you like me to refine this based on specific priorities?"
        )
    if any(w in q for w in ["food", "eat", "meal", "restaurant", "diet"]):
        pref = f" ({food})" if food else ""
        return (
            f"For food options{pref}: Look for local specialties that match your preferences. "
            "Consider meal plans if available — they often offer better value for groups. "
            "Always check for dietary accommodations in advance. "
            "Would you like specific suggestions based on your location or cuisine type?"
        )
    if any(w in q for w in ["hotel", "stay", "accommodation", "lodge"]):
        p = f" for {persons} persons" if persons else ""
        return (
            f"For accommodation{p}: Consider location convenience, amenities, and value. "
            "Booking in advance typically saves 15-30%. "
            "For groups, serviced apartments or villas can be more economical than multiple hotel rooms. "
            "What's your preferred area or specific requirements?"
        )
    if any(w in q for w in ["budget", "cost", "price", "cheap", "reduce", "save"]):
        b = f" (current budget: {budget})" if budget else ""
        return (
            f"Budget optimization tips{b}: Plan activities in advance for early-bird discounts, "
            "use group rates where applicable, and prioritize must-haves over nice-to-haves. "
            "Splitting costs among more people significantly reduces per-person expense. "
            "Would you like a breakdown by category?"
        )
    if any(w in q for w in ["weather", "climate", "season"]):
        return (
            "For weather planning: Check forecasts closer to your date for accuracy. "
            "Generally, off-peak seasons offer better rates with acceptable conditions. "
            "Always pack for variable weather and have indoor alternatives ready. "
            "Is there a specific destination or time frame you'd like details on?"
        )

    return (
        f"Thank you for your question: \"{query}\". "
        "I'm here to help with your planning and consultation needs. "
        "To give you the most relevant answer, could you provide more details about your specific situation? "
        "You can also fill in the requirements form on the left for more personalized recommendations."
    )


def _fallback_recommend(data: dict) -> str:
    days = data.get("days", "")
    persons = data.get("persons", "")
    budget = data.get("budget", "")
    food = data.get("foodPreference", "")
    package = data.get("packagePreference", "")
    extra = data.get("additionalPreferences", "")
    transcript = data.get("transcript", "")

    lines = ["RECOMMENDATIONS\n"]

    if transcript:
        lines.append(f"Based on your query: \"{transcript[:120]}{'...' if len(transcript) > 120 else ''}\"\n")

    lines.append("KEY RECOMMENDATIONS:")
    lines.append("• Define clear objectives and success criteria upfront")
    if days:
        lines.append(f"• {days}-day plan: allocate time proportionally across phases")
    if persons:
        lines.append(f"• For {persons} person(s): consider group packages and bulk pricing")
    lines.append("• Book or arrange key components at least 2 weeks in advance")
    lines.append("• Have a contingency plan for at least 10% of your timeline")

    if budget:
        lines.append(f"\nBUDGET GUIDANCE (Budget: {budget}):")
        lines.append("• Allocate ~50% to primary activities/services")
        lines.append("• ~30% to accommodation/logistics")
        lines.append("• ~15% to food and daily needs")
        lines.append("• ~5% emergency/contingency buffer")

    if food:
        lines.append(f"\nFOOD & DINING ({food}):")
        lines.append(f"• Prioritize {food} options when selecting venues")
        lines.append("• Research options in advance for availability")
        lines.append("• Consider meal plans for cost and convenience")

    if package:
        lines.append(f"\nPACKAGE PREFERENCE ({package}):")
        lines.append(f"• Look for {package.lower()} packages that bundle core needs")
        lines.append("• Compare at least 3 providers before deciding")
        lines.append("• Read reviews from similar use cases")

    if extra:
        lines.append(f"\nADDITIONAL NOTES:")
        lines.append(f"• Regarding your preferences: {extra}")

    lines.append("\nGENERAL GUIDANCE:")
    lines.append("• Document all arrangements and confirmations")
    lines.append("• Share the plan with all stakeholders")
    lines.append("• Set up check-in points to track progress")
    lines.append("• Keep communication channels open for updates")

    lines.append("\n(Note: Connect OpenAI API key in backend/.env for AI-powered recommendations)")

    return "\n".join(lines)
