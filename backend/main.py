
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Interviewer API",
    description="Backend API for our AI Voice Interviewer",
    version="1.0.0"
)

# Allow our Next.js frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Interviewer API!",
        "status": "Running"
    }


@app.get("/health")
class InterviewRequest(BaseModel):
    role: str
    interview_type: str
    difficulty: str


# Start a new interview
@app.post("/interview/start")
def start_interview(request: InterviewRequest):
    return {
        "message": "Interview configuration received!",
        "role": request.role,
        "interview_type": request.interview_type,
        "difficulty": request.difficulty,
        "question": "Tell me about yourself."
    }
