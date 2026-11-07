
import os
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
import json
from ai_service import generate_ai_response, evaluate_interview
load_dotenv()
client = MongoClient("mongodb://localhost:27017/")
db = client["ai_interviewer"]
interviews_collection = db["interviews"]

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
    return {"status": "healthy"}
@app.get("/test-db")
def test_database():

    try:
        client.admin.command("ping")

        return {
            "message": "MongoDB connection successful!",
            "database": db.name,
            "status": "connected"
        }

    except Exception as error:
        return {
            "message": "MongoDB connection failed!",
            "error": str(error),
            "status": "error"
        }

class InterviewRequest(BaseModel):
    role: str
    interview_type: str
    difficulty: str


# Start a new interview
@app.post("/interview/start")
def start_interview(request: InterviewRequest):

    prompt = f"""
You are a professional recruitment interviewer.

Generate exactly 5 interview questions for this candidate.

Job role: {request.role}
Interview type: {request.interview_type}
Difficulty: {request.difficulty}

Return ONLY a valid JSON array.

Each item must have exactly these three fields:
- "title": the interview question
- "description": a short explanation of what the candidate should address
- "tip": a short helpful hint for the candidate

Do not include markdown or text outside the JSON array.
"""

    try:
        ai_response = generate_ai_response(prompt)

        questions = json.loads(ai_response)

        if not isinstance(questions, list) or len(questions) != 5:
            raise ValueError("AI did not return exactly 5 questions.")

        for question in questions:
            if not all(key in question for key in ["title", "description", "tip"]):
                raise ValueError("AI returned an invalid question format.")

    except (json.JSONDecodeError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI returned an invalid response: {error}"
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate interview questions: {error}"
        )

    return {
        "message": "AI-generated interview questions created successfully!",
        "role": request.role,
        "interview_type": request.interview_type,
        "difficulty": request.difficulty,
        "questions": questions
    }
class AnswerSubmission(BaseModel):
    role: str
    question: str
    answer: str
class InterviewSubmission(BaseModel):
    role: str
    interview_type: str
    difficulty: str
    answers: list[AnswerSubmission]


@app.post("/interview/submit")
def submit_answer(request: AnswerSubmission):
    return {
        "message": "Answer received successfully!",
        "role": request.role,
        "question": request.question,
        "answer": request.answer,
        "status": "received"
    }
@app.post("/interview/submit-complete")
def submit_complete_interview(request: InterviewSubmission):

    try:
        # Convert answers into a format AI can understand
        answers = [
            answer.model_dump()
            for answer in request.answers
        ]

        # Generate AI evaluation
        evaluation = evaluate_interview(
            request.role,
            request.interview_type,
            request.difficulty,
            answers
        )

        # Prepare interview data
        interview_data = {
            "role": request.role,
            "interview_type": request.interview_type,
            "difficulty": request.difficulty,
            "answers": answers,
            "total_answers": len(answers),
            "evaluation": evaluation,
            "status": "completed"
        }

        # Save everything in MongoDB
        result = interviews_collection.insert_one(interview_data)

        return {
            "message": "Interview evaluated and saved successfully!",
            "interview_id": str(result.inserted_id),
            "total_answers": len(answers),
            "evaluation": evaluation,
            "status": "completed"
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Interview evaluation failed: {error}"
        )

@app.get("/interviews")
def get_interviews():

    interviews = []

    for interview in interviews_collection.find().sort("_id", -1):

        interview["id"] = str(interview["_id"])
        del interview["_id"]

        interviews.append(interview)

    return {
        "total": len(interviews),
        "interviews": interviews
    }
@app.get("/interviews/{interview_id}")
def get_interview(interview_id: str):

    if not ObjectId.is_valid(interview_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid interview ID"
        )

    interview = interviews_collection.find_one({
        "_id": ObjectId(interview_id)
    })

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    interview["id"] = str(interview["_id"])
    del interview["_id"]

    return interview