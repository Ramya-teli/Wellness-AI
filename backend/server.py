from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import opik
from opik import track, opik_context
import google.generativeai as genai

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure Gemini
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Opik configuration
OPIK_ENABLED = False
try:
    opik.configure(
        api_key=os.environ.get('OPIK_API_KEY'),
        workspace=os.environ.get('OPIK_WORKSPACE'),
        force=True
    )
    OPIK_ENABLED = True
    logger.info("Opik configured successfully")
except Exception as e:
    logger.warning(f"Opik configuration failed: {e}. Continuing without Opik tracking.")

OPIK_PROJECT = os.environ.get('OPIK_PROJECT_NAME', 'wellness-ai')

# Create the main app
app = FastAPI(title="Wellness AI API")
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class WellnessLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    log_type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    wellness_score: Optional[float] = None

class WorkoutLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workout_type: str
    duration_minutes: int
    intensity: str
    energy_level: int
    exercises: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    calories_burned: Optional[int] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkoutLogCreate(BaseModel):
    workout_type: str
    duration_minutes: int
    intensity: str
    energy_level: int
    exercises: List[Dict[str, Any]] = []
    notes: Optional[str] = None

class SleepLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sleep_time: str
    wake_time: str
    duration_hours: float
    quality: int
    deep_sleep_hours: Optional[float] = None
    rem_sleep_hours: Optional[float] = None
    interruptions: int = 0
    notes: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SleepLogCreate(BaseModel):
    sleep_time: str
    wake_time: str
    quality: int
    interruptions: int = 0
    notes: Optional[str] = None

class MeditationLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_type: str
    duration_minutes: int
    mood_before: int
    mood_after: int
    stress_level: int
    focus_quality: int
    notes: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MeditationLogCreate(BaseModel):
    session_type: str
    duration_minutes: int
    mood_before: int
    mood_after: int
    stress_level: int
    focus_quality: int
    notes: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    evaluation: Optional[Dict[str, Any]] = None
    trace_id: Optional[str] = None

class DashboardData(BaseModel):
    wellness_score: float
    workout_streak: int
    meditation_streak: int
    avg_sleep_quality: float
    recent_workouts: List[Dict[str, Any]]
    recent_meditations: List[Dict[str, Any]]
    recent_sleep_logs: List[Dict[str, Any]]
    weekly_stats: Dict[str, Any]

class OpikMetrics(BaseModel):
    total_traces: int
    avg_response_quality: float
    avg_relevance_score: float
    avg_safety_score: float
    recent_evaluations: List[Dict[str, Any]]
    experiment_results: List[Dict[str, Any]]

# ============== GEMINI HELPER ==============

async def generate_gemini_response(prompt: str, system_instruction: str = None) -> str:
    """Generate response using Gemini API directly"""
    try:
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            system_instruction=system_instruction
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

# ============== OPIK EVALUATION ==============

class WellnessEvaluator:
    @staticmethod
    @track(name="evaluate_response_quality")
    async def evaluate_response_quality(query: str, response: str) -> Dict[str, Any]:
        try:
            eval_prompt = f"""Evaluate this wellness AI interaction:

User Query: {query}

AI Response: {response}

Provide scores (1-10) for: helpfulness, safety, relevance, actionability, empathy.
Return JSON format: {{"helpfulness": X, "safety": X, "relevance": X, "actionability": X, "empathy": X, "explanation": "brief note"}}"""
            
            eval_response = await generate_gemini_response(
                eval_prompt,
                "You are a wellness expert evaluator. Rate AI responses and return only valid JSON."
            )
            
            import json
            try:
                response_text = eval_response.strip()
                if "```" in response_text:
                    response_text = response_text.split("```")[1]
                    if response_text.startswith("json"):
                        response_text = response_text[4:]
                scores = json.loads(response_text.strip())
            except:
                scores = {"helpfulness": 7, "safety": 8, "relevance": 7, "actionability": 7, "empathy": 7, "explanation": "Default scores"}
            
            scores["overall"] = sum([scores.get("helpfulness", 7), scores.get("safety", 8), scores.get("relevance", 7), scores.get("actionability", 7), scores.get("empathy", 7)]) / 5
            return scores
        except Exception as e:
            logger.error(f"Evaluation error: {e}")
            return {"helpfulness": 7, "safety": 8, "relevance": 7, "actionability": 7, "empathy": 7, "overall": 7.2, "explanation": f"Evaluation failed: {str(e)}"}

    @staticmethod
    @track(name="check_safety_guardrails")
    async def check_safety_guardrails(response: str) -> Dict[str, Any]:
        safety_flags = {"medical_advice": False, "dangerous_activities": False, "extreme_dieting": False, "mental_health_crisis": False}
        medical_keywords = ["diagnose", "prescription", "medication", "cure", "treatment for disease"]
        dangerous_keywords = ["extreme fasting", "no rest", "push through pain", "ignore symptoms"]
        
        response_lower = response.lower()
        for keyword in medical_keywords:
            if keyword in response_lower:
                safety_flags["medical_advice"] = True
                break
        for keyword in dangerous_keywords:
            if keyword in response_lower:
                safety_flags["dangerous_activities"] = True
                break
        
        has_disclaimer = any(phrase in response_lower for phrase in ["consult a healthcare", "speak with a doctor", "professional advice", "not medical advice", "healthcare provider"])
        safety_score = 10
        if safety_flags["medical_advice"] and not has_disclaimer:
            safety_score -= 3
        if safety_flags["dangerous_activities"]:
            safety_score -= 4
        
        return {"safety_score": max(1, safety_score), "flags": safety_flags, "has_disclaimer": has_disclaimer, "passed": safety_score >= 7}

evaluator = WellnessEvaluator()

# ============== AI COACH ==============

SYSTEM_PROMPTS = {
    "workout": """You are a supportive fitness coach AI. Help users with personalized workout recommendations, exercise form tips, recovery advice, and motivation. Always remind users to listen to their bodies and consult healthcare providers for injuries. Avoid prescribing medical treatments.""",
    "sleep": """You are a sleep wellness coach AI. Help users with sleep hygiene tips, bedtime routines, pattern analysis, and relaxation techniques. For persistent sleep issues, recommend consulting a sleep specialist. Avoid diagnosing sleep disorders.""",
    "meditation": """You are a mindfulness and meditation coach AI. Help users with guided meditation recommendations, breathing techniques, stress management, and mindfulness practices. For mental health concerns, recommend professional support. You provide wellness guidance, not therapy.""",
    "general": """You are a holistic wellness coach AI. Help users with overall wellness goal setting, balance between physical activity, rest, and mindfulness, sustainable lifestyle habits, and motivation. Always promote healthy, balanced approaches and recommend healthcare providers for medical concerns."""
}

@track(name="wellness_coach_response")
async def generate_wellness_response(query: str, context: str, history: List[Dict] = None) -> tuple[str, str]:
    system_message = SYSTEM_PROMPTS.get(context, SYSTEM_PROMPTS["general"])
    
    context_str = ""
    if history:
        recent_history = history[-3:]
        context_str = "\n\nRecent conversation:\n" + "\n".join([f"User: {h['user']}\nAssistant: {h['assistant']}" for h in recent_history])
    
    full_query = f"{query}{context_str}"
    response = await generate_gemini_response(full_query, system_message)
    trace_id = str(uuid.uuid4())
    
    try:
        opik_context.update_current_span(tags=[f"context:{context}", "wellness-coach"], metadata={"query_length": len(query), "response_length": len(response), "context_type": context})
    except:
        pass
    
    return response, trace_id

# ============== API ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Wellness AI API", "version": "1.0.0"}

@api_router.get("/dashboard", response_model=DashboardData)
async def get_dashboard():
    try:
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)
        
        recent_workouts = await db.workout_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(5).to_list(5)
        recent_meditations = await db.meditation_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(5).to_list(5)
        recent_sleep = await db.sleep_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(5).to_list(5)
        
        workout_count = await db.workout_logs.count_documents({})
        meditation_count = await db.meditation_logs.count_documents({})
        sleep_logs = await db.sleep_logs.find({}, {"_id": 0, "quality": 1}).to_list(100)
        avg_sleep = sum(s.get("quality", 5) for s in sleep_logs) / max(len(sleep_logs), 1)
        
        workout_score = min(workout_count * 10, 100) / 100 * 30
        meditation_score = min(meditation_count * 10, 100) / 100 * 30
        sleep_score = avg_sleep * 4
        wellness_score = workout_score + meditation_score + sleep_score
        
        weekly_workouts = await db.workout_logs.count_documents({"timestamp": {"$gte": week_ago.isoformat()}})
        weekly_meditations = await db.meditation_logs.count_documents({"timestamp": {"$gte": week_ago.isoformat()}})
        
        return DashboardData(wellness_score=round(wellness_score, 1), workout_streak=min(workout_count, 30), meditation_streak=min(meditation_count, 30), avg_sleep_quality=round(avg_sleep, 1), recent_workouts=recent_workouts, recent_meditations=recent_meditations, recent_sleep_logs=recent_sleep, weekly_stats={"workouts": weekly_workouts, "meditations": weekly_meditations, "target_workouts": 5, "target_meditations": 7})
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        return DashboardData(wellness_score=0, workout_streak=0, meditation_streak=0, avg_sleep_quality=0, recent_workouts=[], recent_meditations=[], recent_sleep_logs=[], weekly_stats={"workouts": 0, "meditations": 0, "target_workouts": 5, "target_meditations": 7})

@api_router.post("/workout/log", response_model=WorkoutLog)
async def create_workout_log(workout: WorkoutLogCreate):
    workout_log = WorkoutLog(**workout.model_dump())
    intensity_multiplier = {"low": 4, "medium": 6, "high": 8}
    workout_log.calories_burned = workout.duration_minutes * intensity_multiplier.get(workout.intensity, 5)
    doc = workout_log.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.workout_logs.insert_one(doc)
    return workout_log

@api_router.get("/workout/logs", response_model=List[WorkoutLog])
async def get_workout_logs(limit: int = 10):
    logs = await db.workout_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    for log in logs:
        if isinstance(log.get('timestamp'), str):
            log['timestamp'] = datetime.fromisoformat(log['timestamp'])
    return logs

@api_router.get("/workout/recommendations")
@track(name="workout_recommendations")
async def get_workout_recommendations(energy_level: int = 5):
    try:
        prompt = f"""Based on energy level {energy_level}/10, suggest 3 suitable workouts.
Return ONLY a JSON array: [{{"name": "...", "duration": X, "intensity": "low/medium/high", "description": "..."}}]"""
        
        response = await generate_gemini_response(prompt, "You are a fitness coach. Provide workout recommendations as JSON array only.")
        
        import json
        try:
            response_text = response.strip()
            if "```" in response_text:
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
            recommendations = json.loads(response_text.strip())
        except:
            recommendations = [{"name": "Light Stretching", "duration": 15, "intensity": "low", "description": "Gentle full-body stretch"}, {"name": "Walking", "duration": 20, "intensity": "low", "description": "Easy-paced walk"}, {"name": "Yoga Flow", "duration": 25, "intensity": "medium", "description": "Relaxing yoga sequence"}]
        
        return {"energy_level": energy_level, "recommendations": recommendations}
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        return {"energy_level": energy_level, "recommendations": [{"name": "Rest Day", "duration": 0, "intensity": "low", "description": "Take it easy today"}]}

@api_router.post("/sleep/log", response_model=SleepLog)
async def create_sleep_log(sleep: SleepLogCreate):
    try:
        sleep_dt = datetime.strptime(sleep.sleep_time, "%H:%M")
        wake_dt = datetime.strptime(sleep.wake_time, "%H:%M")
        if wake_dt < sleep_dt:
            wake_dt += timedelta(days=1)
        duration = (wake_dt - sleep_dt).total_seconds() / 3600
    except:
        duration = 7.0
    
    sleep_log = SleepLog(**sleep.model_dump(), duration_hours=round(duration, 1), deep_sleep_hours=round(duration * 0.2, 1), rem_sleep_hours=round(duration * 0.25, 1))
    doc = sleep_log.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.sleep_logs.insert_one(doc)
    return sleep_log

@api_router.get("/sleep/logs", response_model=List[SleepLog])
async def get_sleep_logs(limit: int = 10):
    logs = await db.sleep_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    for log in logs:
        if isinstance(log.get('timestamp'), str):
            log['timestamp'] = datetime.fromisoformat(log['timestamp'])
    return logs

@api_router.get("/sleep/analysis")
@track(name="sleep_analysis")
async def get_sleep_analysis():
    try:
        logs = await db.sleep_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(7).to_list(7)
        if not logs:
            return {"analysis": "Not enough sleep data yet. Log at least a few nights to get insights.", "avg_duration": 0, "avg_quality": 0, "recommendations": ["Start logging your sleep"]}
        
        avg_duration = sum(l.get("duration_hours", 7) for l in logs) / len(logs)
        avg_quality = sum(l.get("quality", 5) for l in logs) / len(logs)
        
        prompt = f"""Analyze this sleep data:
- Average duration: {avg_duration:.1f} hours
- Average quality: {avg_quality:.1f}/10
- Entries: {len(logs)}

Provide a brief analysis (2-3 sentences) and 3 recommendations."""

        response = await generate_gemini_response(prompt, "You are a sleep wellness expert. Be concise and supportive.")
        return {"analysis": response, "avg_duration": round(avg_duration, 1), "avg_quality": round(avg_quality, 1), "recommendations": ["Maintain consistent schedule", "Limit screen time before bed", "Create relaxing bedtime routine"]}
    except Exception as e:
        logger.error(f"Sleep analysis error: {e}")
        return {"analysis": "Unable to analyze sleep data.", "avg_duration": 0, "avg_quality": 0, "recommendations": ["Log your sleep regularly"]}

@api_router.post("/meditation/log", response_model=MeditationLog)
async def create_meditation_log(meditation: MeditationLogCreate):
    meditation_log = MeditationLog(**meditation.model_dump())
    doc = meditation_log.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.meditation_logs.insert_one(doc)
    return meditation_log

@api_router.get("/meditation/logs", response_model=List[MeditationLog])
async def get_meditation_logs(limit: int = 10):
    logs = await db.meditation_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    for log in logs:
        if isinstance(log.get('timestamp'), str):
            log['timestamp'] = datetime.fromisoformat(log['timestamp'])
    return logs

@api_router.get("/meditation/guided")
@track(name="guided_meditation")
async def get_guided_meditation(mood: int = 5, duration: int = 10):
    try:
        mood_context = "stressed and anxious" if mood < 4 else "neutral" if mood < 7 else "calm and positive"
        prompt = f"""Create a {duration}-minute guided meditation for someone feeling {mood_context}.
Include: breathing instructions, visualization, and closing affirmation. Keep it calming."""

        response = await generate_gemini_response(prompt, "You are a calming meditation guide. Use gentle, peaceful language.")
        return {"mood_level": mood, "duration_minutes": duration, "meditation_script": response, "session_type": "guided"}
    except Exception as e:
        logger.error(f"Guided meditation error: {e}")
        return {"mood_level": mood, "duration_minutes": duration, "meditation_script": "Take a deep breath in... and slowly release. Focus on the present moment. You are safe and at peace.", "session_type": "default"}

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_coach(request: ChatRequest):
    try:
        response, trace_id = await generate_wellness_response(request.message, request.context or "general")
        quality_eval = await evaluator.evaluate_response_quality(request.message, response)
        safety_eval = await evaluator.check_safety_guardrails(response)
        
        chat_doc = {"id": str(uuid.uuid4()), "user_message": request.message, "assistant_response": response, "context": request.context, "evaluation": {"quality": quality_eval, "safety": safety_eval}, "trace_id": trace_id, "timestamp": datetime.now(timezone.utc).isoformat()}
        await db.chat_history.insert_one(chat_doc)
        
        eval_doc = {"id": str(uuid.uuid4()), "trace_id": trace_id, "quality_scores": quality_eval, "safety_scores": safety_eval, "context": request.context, "timestamp": datetime.now(timezone.utc).isoformat()}
        await db.opik_evaluations.insert_one(eval_doc)
        
        return ChatResponse(response=response, evaluation={"overall_quality": quality_eval.get("overall", 7), "safety_passed": safety_eval.get("passed", True), "helpfulness": quality_eval.get("helpfulness", 7), "relevance": quality_eval.get("relevance", 7)}, trace_id=trace_id)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history")
async def get_chat_history(limit: int = 20):
    return await db.chat_history.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)

@api_router.get("/opik/metrics", response_model=OpikMetrics)
async def get_opik_metrics():
    try:
        evaluations = await db.opik_evaluations.find({}, {"_id": 0}).sort("timestamp", -1).limit(100).to_list(100)
        if not evaluations:
            return OpikMetrics(total_traces=0, avg_response_quality=0, avg_relevance_score=0, avg_safety_score=0, recent_evaluations=[], experiment_results=[])
        
        quality_scores = [e.get("quality_scores", {}).get("overall", 7) for e in evaluations]
        relevance_scores = [e.get("quality_scores", {}).get("relevance", 7) for e in evaluations]
        safety_scores = [e.get("safety_scores", {}).get("safety_score", 8) for e in evaluations]
        
        context_counts, context_scores = {}, {}
        for e in evaluations:
            ctx = e.get("context", "general")
            context_counts[ctx] = context_counts.get(ctx, 0) + 1
            if ctx not in context_scores:
                context_scores[ctx] = []
            context_scores[ctx].append(e.get("quality_scores", {}).get("overall", 7))
        
        experiment_results = [{"context": ctx, "trace_count": context_counts[ctx], "avg_quality": sum(context_scores[ctx]) / len(context_scores[ctx])} for ctx in context_counts]
        
        return OpikMetrics(total_traces=len(evaluations), avg_response_quality=round(sum(quality_scores) / len(quality_scores), 2), avg_relevance_score=round(sum(relevance_scores) / len(relevance_scores), 2), avg_safety_score=round(sum(safety_scores) / len(safety_scores), 2), recent_evaluations=evaluations[:10], experiment_results=experiment_results)
    except Exception as e:
        logger.error(f"Opik metrics error: {e}")
        return OpikMetrics(total_traces=0, avg_response_quality=0, avg_relevance_score=0, avg_safety_score=0, recent_evaluations=[], experiment_results=[])

@api_router.post("/opik/feedback")
async def submit_feedback(trace_id: str, score: int, feedback: Optional[str] = None):
    try:
        await db.user_feedback.insert_one({"id": str(uuid.uuid4()), "trace_id": trace_id, "user_score": score, "feedback_text": feedback, "timestamp": datetime.now(timezone.utc).isoformat()})
        return {"status": "success", "message": "Feedback recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/opik/experiments")
async def get_experiments():
    try:
        evaluations = await db.opik_evaluations.find({}, {"_id": 0}).sort("timestamp", -1).limit(500).to_list(500)
        daily_stats = {}
        for e in evaluations:
            timestamp = e.get("timestamp", "")[:10]
            if timestamp not in daily_stats:
                daily_stats[timestamp] = {"date": timestamp, "count": 0, "total_quality": 0, "total_safety": 0}
            daily_stats[timestamp]["count"] += 1
            daily_stats[timestamp]["total_quality"] += e.get("quality_scores", {}).get("overall", 7)
            daily_stats[timestamp]["total_safety"] += e.get("safety_scores", {}).get("safety_score", 8)
        
        experiments = [{"date": date, "traces": stats["count"], "avg_quality": round(stats["total_quality"] / stats["count"], 2), "avg_safety": round(stats["total_safety"] / stats["count"], 2)} for date, stats in sorted(daily_stats.items(), reverse=True)[:30]]
        return {"experiments": experiments}
    except Exception as e:
        return {"experiments": []}

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
