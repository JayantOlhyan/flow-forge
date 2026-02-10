from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', 'flowforge-secret-key-2026')
JWT_ALGORITHM = "HS256"

# LLM
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ── Models ──────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    job_title: Optional[str] = None
    industry: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    job_title: Optional[str] = None
    industry: Optional[str] = None
    onboarded: bool = False
    created_at: str

class AutomationCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    trigger: Optional[str] = ""
    action: Optional[str] = ""
    template_id: Optional[str] = None
    category: Optional[str] = "custom"
    nodes: Optional[list] = []

class AutomationOut(BaseModel):
    id: str
    name: str
    description: str
    trigger: str
    action: str
    status: str
    category: str
    template_id: Optional[str] = None
    nodes: list = []
    tasks_run: int = 0
    time_saved_minutes: int = 0
    created_at: str
    user_id: str

class AIRequest(BaseModel):
    message: str

class OnboardingUpdate(BaseModel):
    job_title: str
    industry: str

# ── Auth helpers ────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    return jwt.encode({"user_id": user_id, "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ── Auth routes ─────────────────────────────────────────

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "job_title": data.job_title or "",
        "industry": data.industry or "",
        "onboarded": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    return {"token": token, "user": {k: v for k, v in user_doc.items() if k not in ("password", "_id")}}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"])
    return {"token": token, "user": {k: v for k, v in user.items() if k != "password"}}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}

# ── Onboarding ──────────────────────────────────────────

@api_router.put("/auth/onboard")
async def onboard_user(data: OnboardingUpdate, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"job_title": data.job_title, "industry": data.industry, "onboarded": True}}
    )
    await log_activity(current_user["id"], "onboarding_complete", f"Onboarded as {data.job_title} in {data.industry}")
    return {"status": "ok"}

# ── Templates ───────────────────────────────────────────

TEMPLATES = [
    {"id": "t1", "name": "Auto-sync leads from Gmail to CRM", "description": "Automatically capture new leads from emails and push to your CRM", "category": "sales", "trigger": "New email with lead info", "action": "Create CRM contact", "time_saved": 45, "icon": "mail"},
    {"id": "t2", "name": "Extract invoice data from PDFs", "description": "Parse PDF invoices and populate spreadsheets automatically", "category": "finance", "trigger": "New PDF in Drive", "action": "Extract data to Sheets", "time_saved": 60, "icon": "file-text"},
    {"id": "t3", "name": "New employee onboarding docs", "description": "Send welcome docs to folder and notify team on Slack", "category": "hr", "trigger": "New employee added", "action": "Send docs + Slack alert", "time_saved": 30, "icon": "users"},
    {"id": "t4", "name": "Weekly report to Slack", "description": "Compile weekly metrics and post summary to your Slack channel", "category": "marketing", "trigger": "Every Monday 9 AM", "action": "Post report to Slack", "time_saved": 20, "icon": "bar-chart"},
    {"id": "t5", "name": "Sync inventory across platforms", "description": "Keep inventory levels updated across all your selling platforms", "category": "operations", "trigger": "Inventory change", "action": "Update all platforms", "time_saved": 90, "icon": "package"},
    {"id": "t6", "name": "Auto-respond to customer queries", "description": "AI reads customer emails and drafts responses for review", "category": "sales", "trigger": "New customer email", "action": "Draft AI response", "time_saved": 35, "icon": "message-square"},
    {"id": "t7", "name": "Expense report generation", "description": "Collect receipts from email, categorize, and generate monthly report", "category": "finance", "trigger": "End of month", "action": "Generate expense report", "time_saved": 120, "icon": "credit-card"},
    {"id": "t8", "name": "Social media scheduling", "description": "Queue posts across platforms from a single spreadsheet", "category": "marketing", "trigger": "New row in spreadsheet", "action": "Schedule social posts", "time_saved": 40, "icon": "share-2"},
    {"id": "t9", "name": "Meeting notes to tasks", "description": "Transcribe meetings and create action items in project management tool", "category": "operations", "trigger": "Meeting ends", "action": "Create tasks from notes", "time_saved": 25, "icon": "clipboard"},
    {"id": "t10", "name": "PTO request workflow", "description": "Route PTO requests for approval and update team calendar", "category": "hr", "trigger": "PTO form submitted", "action": "Route for approval", "time_saved": 15, "icon": "calendar"},
    {"id": "t11", "name": "Daily standup summary", "description": "Collect team updates and post daily summary to channel", "category": "operations", "trigger": "Daily at 10 AM", "action": "Post summary to Slack", "time_saved": 15, "icon": "clock"},
    {"id": "t12", "name": "Lead scoring automation", "description": "Score incoming leads based on engagement and notify sales team", "category": "sales", "trigger": "New lead activity", "action": "Score + notify team", "time_saved": 50, "icon": "target"},
]

@api_router.get("/templates")
async def get_templates(category: Optional[str] = None):
    if category and category != "all":
        return [t for t in TEMPLATES if t["category"] == category]
    return TEMPLATES

# ── Automations CRUD ────────────────────────────────────

@api_router.post("/automations")
async def create_automation(data: AutomationCreate, current_user: dict = Depends(get_current_user)):
    auto_id = str(uuid.uuid4())
    
    # If from template, get template data
    template_data = {}
    if data.template_id:
        template = next((t for t in TEMPLATES if t["id"] == data.template_id), None)
        if template:
            template_data = {"trigger": template["trigger"], "action": template["action"], "time_saved_minutes": template["time_saved"]}
    
    doc = {
        "id": auto_id,
        "name": data.name,
        "description": data.description or "",
        "trigger": data.trigger or template_data.get("trigger", ""),
        "action": data.action or template_data.get("action", ""),
        "status": "active",
        "category": data.category or "custom",
        "template_id": data.template_id,
        "nodes": data.nodes or [],
        "tasks_run": 0,
        "time_saved_minutes": template_data.get("time_saved_minutes", 10),
        "user_id": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.automations.insert_one(doc)
    await log_activity(current_user["id"], "automation_created", f"Created: {data.name}")
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.get("/automations")
async def get_automations(current_user: dict = Depends(get_current_user)):
    automations = await db.automations.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return automations

@api_router.put("/automations/{auto_id}/toggle")
async def toggle_automation(auto_id: str, current_user: dict = Depends(get_current_user)):
    auto = await db.automations.find_one({"id": auto_id, "user_id": current_user["id"]}, {"_id": 0})
    if not auto:
        raise HTTPException(status_code=404, detail="Automation not found")
    new_status = "paused" if auto["status"] == "active" else "active"
    await db.automations.update_one({"id": auto_id}, {"$set": {"status": new_status}})
    await log_activity(current_user["id"], "automation_toggled", f"{auto['name']} → {new_status}")
    return {"status": new_status}

@api_router.delete("/automations/{auto_id}")
async def delete_automation(auto_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.automations.delete_one({"id": auto_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Automation not found")
    await log_activity(current_user["id"], "automation_deleted", f"Deleted automation {auto_id}")
    return {"status": "deleted"}

# ── Dashboard stats ─────────────────────────────────────

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    automations = await db.automations.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    active_count = sum(1 for a in automations if a.get("status") == "active")
    total_tasks = sum(a.get("tasks_run", 0) for a in automations)
    total_time_saved = sum(a.get("time_saved_minutes", 0) for a in automations)
    hours_saved = round(total_time_saved / 60, 1)
    productivity_value = round(hours_saved * 150, 2)  # $150/hour value
    return {
        "active_automations": active_count,
        "total_automations": len(automations),
        "tasks_run": total_tasks,
        "hours_saved": hours_saved,
        "productivity_value": productivity_value,
    }

# ── Activity Log ────────────────────────────────────────

async def log_activity(user_id: str, action: str, detail: str):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "detail": detail,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.activity_log.insert_one(doc)

@api_router.get("/activity")
async def get_activity(authorization: str = None):
    user = await get_current_user(authorization)
    logs = await db.activity_log.find({"user_id": user["id"]}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    return logs

# ── AI Suggest ──────────────────────────────────────────

@api_router.post("/ai/suggest")
async def ai_suggest(data: AIRequest, authorization: str = None):
    user = await get_current_user(authorization)
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"flowforge-{user['id']}-{uuid.uuid4()}",
            system_message="""You are Flow-Forge AI, an automation assistant. When the user describes a task they want automated, respond with a JSON object containing:
{
  "name": "Short automation name",
  "description": "Brief description of what it does",
  "trigger": "What triggers this automation",
  "action": "What action it performs",
  "category": "one of: sales, finance, hr, marketing, operations, custom",
  "suggestion": "A friendly one-sentence explanation of how this helps"
}
Only respond with valid JSON. No markdown, no extra text."""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_msg = UserMessage(text=data.message)
        response = await chat.send_message(user_msg)
        
        import json
        # Try to parse JSON from response
        clean = response.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            clean = clean.rsplit("```", 1)[0]
        
        parsed = json.loads(clean)
        await log_activity(user["id"], "ai_suggestion", f"AI suggested: {parsed.get('name', 'Unknown')}")
        return {"suggestion": parsed, "raw": response}
    except Exception as e:
        logger.error(f"AI suggestion error: {e}")
        # Fallback suggestion
        return {
            "suggestion": {
                "name": f"Automation from: {data.message[:50]}",
                "description": data.message,
                "trigger": "Custom trigger",
                "action": "Custom action",
                "category": "custom",
                "suggestion": "I created a basic automation from your description. You can customize the trigger and action."
            },
            "raw": str(e)
        }

# ── Health ──────────────────────────────────────────────

@api_router.get("/health")
async def health():
    return {"status": "ok", "service": "flow-forge"}

# ── Include router + middleware ─────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
