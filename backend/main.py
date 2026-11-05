
from fastapi import FastAPI
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
def health_check():
    return {
        "status": "healthy"
    }