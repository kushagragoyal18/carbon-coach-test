import os
import re
import json
import logging
from typing import Optional
import google.generativeai as genai
from pydantic import BaseModel, Field, ValidationError

# Set up basic logging
logger = logging.getLogger(__name__)

# JSON Response Schema for Insights
class RecommendationItem(BaseModel):
    title: str = Field(..., description="Actionable recommendation title.")
    impact_kg: float = Field(..., description="Estimated carbon reduction in kg CO2/week.")
    difficulty: str = Field(..., description="Difficulty rating: Easy, Medium, or Hard.")
    action: str = Field(..., description="Specific, concrete action commuter can take.")

class CarbonInsightsSchema(BaseModel):
    headline: str = Field(..., description="A short, catchy, engaging headline summarising user's footprint.")
    assessment: str = Field(..., description="Detailed qualitative assessment of commuter habits.")
    comparison_vs_benchmark: str = Field(..., description="How they compare to average regional commuters (60 kg CO2/week).")
    top_recommendations: list[RecommendationItem] = Field(..., description="List of top 2-4 actionable carbon reduction recommendations.")

# Input Injection Guard Patterns
INJECTION_KEYWORDS = [
    "ignore previous", "ignore instructions", "ignore the rules",
    "system directive", "system prompt", "you are now",
    "override", "hack", "bypass", "instruction leak"
]

def check_injection_guard(text: str) -> bool:
    """
    Returns True if the text is safe, False if prompt injection is suspected.
    """
    if not text:
        return True
    
    text_lower = text.lower()
    for keyword in INJECTION_KEYWORDS:
        if keyword in text_lower:
            logger.warning(f"Injection guard triggered: word '{keyword}' detected.")
            return False
            
    # Simple regex check for system instruction override attempts
    if re.search(r"ignore\s+(?:the\s+)?(?:rules|instructions|directives|constraints)", text_lower):
        logger.warning("Injection guard triggered: instruction bypass regex match.")
        return False
        
    return True

def generate_deterministic_insights(profile: dict, emissions: dict, benchmark_pct: float) -> dict:
    """
    Generates structured, high-quality advice purely deterministically.
    Always returns a structure matching CarbonInsightsSchema.
    """
    total = emissions.get("total", 0.0)
    t_mode = profile.get("transport_mode", "gasoline_car")
    t_dist = float(profile.get("transport_distance_weekly", 0.0))
    m_meat = int(profile.get("meals_meat_weekly", 0))
    energy_kwh = float(profile.get("home_energy_kwh_weekly", 0.0))
    
    # 1. Headline & Assessment
    if total > 60.0:
        headline = "High Impact Commute: Steps Needed"
        assessment = (
            "Your weekly commuter carbon footprint is higher than the regional average. "
            "Focusing on high-yield actions like transit days and meal changes can significantly drop your emissions."
        )
    elif total > 30.0:
        headline = "Moderate Commute Footprint: Refine Your Routine"
        assessment = (
            "You have a moderate commuting footprint. Small shifts in your transit choices or energy efficiency "
            "will help push you below the regional average footprint."
        )
    else:
        headline = "Eco-Commuter Champion!"
        assessment = (
            "Congratulations! Your weekly commuting footprint is exceptionally low. "
            "You are setting a great benchmark for sustainable commuting."
        )
        
    # 2. Benchmark comparison text
    if benchmark_pct > 0:
        comparison_vs_benchmark = f"Your weekly footprint of {total:.1f} kg CO2 is {benchmark_pct:.1f}% higher than the average regional commuter baseline (60 kg CO2/week)."
    else:
        comparison_vs_benchmark = f"Your weekly footprint of {total:.1f} kg CO2 is {abs(benchmark_pct):.1f}% lower than the average regional commuter baseline (60 kg CO2/week)."
        
    # 3. Recommendations building
    recs = []
    
    # Transport recommendation
    if t_dist > 0:
        if t_mode in ["gasoline_car", "diesel_car"]:
            recs.append(RecommendationItem(
                title="Swap 2 Drive Days for Transit",
                impact_kg=round(t_dist * (EMISSION_FACTORS_MAP(t_mode) - 0.06) * (2/5), 1),
                difficulty="Medium",
                action="Try commuting via bus or subway on Tuesdays and Thursdays. Reducing solo driving makes the biggest impact."
            ))
            recs.append(RecommendationItem(
                title="Consider a Hybrid/Electric Vehicle",
                impact_kg=round(t_dist * (EMISSION_FACTORS_MAP(t_mode) - 0.05), 1),
                difficulty="Hard",
                action="When purchasing your next vehicle, look into hybrid or electric alternatives to immediately drop emissions by 50% or more."
            ))
        elif t_mode == "hybrid_car":
            recs.append(RecommendationItem(
                title="Integrate Active Transit",
                impact_kg=round(t_dist * 0.1, 1),
                difficulty="Easy",
                action="Walk, bicycle, or use an e-scooter for short commutes or first/last-mile transit connections."
            ))
            
    # Diet recommendation
    if m_meat > 2:
        recs.append(RecommendationItem(
            title="Introduce Meatless Lunches",
            impact_kg=round(m_meat * 1.7 * 0.5, 1), # swap half to vegetarian
            difficulty="Easy",
            action="Switch to vegetarian or vegan options for your weekday lunches. Plant-based meals have 1/3 the footprint of meat."
        ))
    else:
        recs.append(RecommendationItem(
            title="Adopt Vegan Commute Days",
            impact_kg=2.0,
            difficulty="Easy",
            action="Go fully vegan for your lunch meals to shave off an extra 2-3 kg CO2 per week."
        ))
        
    # Energy recommendation
    if energy_kwh > 15:
        recs.append(RecommendationItem(
            title="Optimize Workstation Energy Use",
            impact_kg=round(energy_kwh * 0.45 * 0.2, 1),
            difficulty="Easy",
            action="Power down screens, use smart plugs, and switch to LED workstation lighting. Saving 20% electricity is simple."
        ))
        
    # Ensure we return at least 2 recommendations
    if len(recs) < 2:
        recs.append(RecommendationItem(
            title="Unplug Off-Hours Appliances",
            impact_kg=1.5,
            difficulty="Easy",
            action="Turn off chargers and workspace hardware at the wall when leaving the home or office for the weekend."
        ))
        
    # Map back to dict
    return {
        "headline": headline,
        "assessment": assessment,
        "comparison_vs_benchmark": comparison_vs_benchmark,
        "top_recommendations": [rec.model_dump() for rec in recs[:3]]
    }

def EMISSION_FACTORS_MAP(mode: str) -> float:
    # Quick utility for factors calculation
    factors = {
        "gasoline_car": 0.20, "diesel_car": 0.18, "hybrid_car": 0.10, "ev_car": 0.05,
        "motorcycle": 0.12, "bus": 0.08, "subway": 0.04, "train": 0.03, "active": 0.0
    }
    return factors.get(mode, 0.20)

def repair_json_string(response_text: str) -> str:
    """
    Cleans up response_text if it is wrapped in markdown code blocks or has trailing issues.
    """
    cleaned = response_text.strip()
    # Strip markdown block if exists: ```json ... ```
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(1).strip()
    else:
        # Look for the first { and last } to isolate the json body
        start = cleaned.find('{')
        end = cleaned.rfind('}')
        if start != -1 and end != -1:
            cleaned = cleaned[start:end+1]
    return cleaned

def generate_insights_with_gemini(profile: dict, emissions: dict, api_key: str) -> dict:
    """
    Constructs a detailed prompt, executes the Gemini request with retry logic,
    and returns a validated JSON dictionary.
    Falls back to deterministic insights on error.
    """
    # Normalize emissions data structure
    em_data = emissions.get("emissions", emissions)
    benchmarks = emissions.get("benchmarks", {})
    benchmark_pct = benchmarks.get("percentage_vs_benchmark", emissions.get("percentage_vs_benchmark", 0.0))

    # 1. Validate inputs with injection guard
    for key, val in profile.items():
        if isinstance(val, str) and not check_injection_guard(val):
            logger.warning("Unsafe profile text detected. Reverting immediately to deterministic fallback.")
            return generate_deterministic_insights(profile, em_data, benchmark_pct)
            
    # 2. Build the prompt
    prompt = f"""
You are CarbonCoach, an expert AI carbon footprint advisor for urban daily commuters.
Analyze the user's weekly commuting habits and emissions. Return highly specific, structured carbon-footprint insights.

User's Weekly Commuting Data:
- Transport Mode: {profile.get("transport_mode")} (Emissions: {em_data.get("transport")} kg CO2)
- Weekly Commute Distance: {profile.get("transport_distance_weekly")} km
- Weekly Diet (Lunches): {profile.get("meals_meat_weekly")} Meat, {profile.get("meals_veg_weekly")} Vegetarian, {profile.get("meals_vegan_weekly")} Vegan (Emissions: {em_data.get("diet")} kg CO2)
- Home Office Energy Usage: {profile.get("home_energy_kwh_weekly")} kWh (Emissions: {em_data.get("energy")} kg CO2)
- Total Weekly Commuter Footprint: {em_data.get("total")} kg CO2
- Regional Average Commuter Footprint: 60.0 kg CO2
- User vs Regional Average Benchmark: {benchmark_pct}%

You MUST return a JSON object that strictly adheres to the following JSON schema:
{{
  "headline": "string (A short, personalized, encouraging, or warning headline)",
  "assessment": "string (A concise assessment of their transport, dietary, and workstation emissions)",
  "comparison_vs_benchmark": "string (Clear explanation comparing their total vs the average commuter baseline of 60.0 kg CO2)",
  "top_recommendations": [
    {{
      "title": "string (Actionable title, max 6 words)",
      "impact_kg": float (Estimated reduction in kg CO2/week if they adopt this)",
      "difficulty": "string (Either 'Easy', 'Medium', or 'Hard')",
      "action": "string (A concrete daily action showing them exactly what to do)"
    }}
  ]
}}

Provide 2 to 4 recommendations. Keep suggestions realistic for an urban commuter. Do not offer broad suggestions like 'install solar panels' (they are commuters renting or working). Focus on transit modes, meatless days, energy settings, active first/last-mile connections.
Return ONLY raw JSON, with no other text, conversational preamble, or formatting.
"""

    # 3. Request execution loop with repair and retry
    max_retries = 3
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting Gemini Insights generation. Attempt {attempt + 1}/{max_retries}")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json", "temperature": 0.4}
            )
            
            raw_text = response.text
            if not raw_text:
                raise ValueError("Received empty response from Gemini API.")
                
            cleaned_json = repair_json_string(raw_text)
            parsed_dict = json.loads(cleaned_json)
            
            # Strict schema validation using Pydantic
            validated_data = CarbonInsightsSchema(**parsed_dict)
            return validated_data.model_dump()
            
        except (json.JSONDecodeError, ValidationError) as err:
            logger.error(f"JSON validation error on attempt {attempt + 1}: {err}. Retrying...")
            # Modify prompt slightly on subsequent attempts to reinforce strict formatting
            prompt += "\nCORRECTION: Your previous output was not valid JSON or did not match the exact schema. Ensure strict schema match."
        except Exception as ex:
            logger.error(f"Unexpected Gemini API error on attempt {attempt + 1}: {ex}.")
            # Break early and fallback on API errors (like quota, auth, connectivity)
            break
            
    logger.warning("Gemini generation failed or exhausted retries. Falling back to deterministic generator.")
    return generate_deterministic_insights(profile, em_data, benchmark_pct)

def run_insight_engine(profile: dict, emissions: dict) -> dict:
    """
    Insight engine entry point.
    Checks for GEMINI_API_KEY environment variable. If available, calls Gemini;
    otherwise, immediately executes deterministic fallback.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    benchmark_pct = emissions.get("benchmarks", {}).get("percentage_vs_benchmark", 0.0)
    
    if api_key and api_key.strip():
        return generate_insights_with_gemini(profile, emissions, api_key.strip())
    else:
        logger.info("GEMINI_API_KEY not set. Running deterministic fallback.")
        return generate_deterministic_insights(profile, emissions["emissions"], benchmark_pct)
