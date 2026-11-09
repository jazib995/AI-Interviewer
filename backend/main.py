
import os
import secrets
from datetime import datetime, timezone,timedelta
from httpcore2 import request
from openai import OpenAI
from dotenv import load_dotenv
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
import json
from ai_service import generate_ai_response, evaluate_interview
from pathlib import Path
from fastapi import UploadFile, File, Form
import uuid
from fastapi.responses import FileResponse
load_dotenv()
client = MongoClient("mongodb://localhost:27017/")
db = client["ai_interviewer"]
interviews_collection = db["interviews"]
jobs_collection = db["jobs"]
invitations_collection = db["invitations"]
applications_collection = db["applications"]
RESUME_DIR = Path(__file__).resolve().parent / "uploads" / "resumes"
RESUME_DIR.mkdir(parents=True, exist_ok=True)

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
    invitation_token: str | None = None
    
class JobRequest(BaseModel):
    title: str
    department: str
    description: str
    requirements: str
    location: str
    job_type: str
class ApplicationStatusUpdate(BaseModel):
    status: str


# Start a new interview
@app.post("/interview/start")
def start_interview(request: InterviewRequest):
        # Validate candidate invitation
       # Validate candidate invitation
    if request.job_id and not request.invitation_token:
        raise HTTPException(
            status_code=403,
            detail="A valid invitation token is required."
        )

    if request.invitation_token:

        invitation = invitations_collection.find_one({
            "token": request.invitation_token,
            "job_id": request.job_id,
            "status": "active",
            "expires_at": {
                "$gt": datetime.now(timezone.utc)
            }
        })

        if not invitation:
            raise HTTPException(
                status_code=403,
                detail="Invalid, expired, or already used invitation."
            )

        job = jobs_collection.find_one({
            "_id": ObjectId(invitation["job_id"])
        })

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Associated job not found."
            )
        invitations_collection.update_one(
    {
        "token": request.invitation_token,
        "status": "active",
        "started_at": {
            "$exists": False
        }
    },
    {
        "$set": {
            "started_at": datetime.now(timezone.utc)
        }
    }
)
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
        print("AI RAW RESPONSE:", ai_response)

        parsed_response = json.loads(ai_response)

        if isinstance(parsed_response, dict):
            questions = parsed_response.get("items", [])
        else:
            questions = parsed_response

        if not isinstance(questions, list) or len(questions) != 5:
            raise ValueError("AI did not return exactly 5 questions.")

        for question in questions:
            if not isinstance(question, dict) or not all(
                key in question for key in ["title", "description", "tip"]
            ):
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
    job_id: str | None = None
    candidate_name: str | None = None
    candidate_email: str | None = None
    invitation_token: str | None = None


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

    invitation_claimed = False
    interview_saved = False

    try:
        # Validate invitation for job applicants
        if request.job_id and not request.invitation_token:
            raise HTTPException(
                status_code=403,
                detail="A valid invitation token is required."
            )

        # Claim invitation so it cannot be submitted twice
        if request.invitation_token:
            invitation_filter = {
            "token": request.invitation_token,
            "job_id": request.job_id,
            "status": "active",
            "$or": [
            {"expires_at": {
                "$gt": datetime.now(timezone.utc)}},
            {"started_at": {
                "$exists": True}} ]
            }
            invitation = invitations_collection.find_one(
                invitation_filter
            )

            if not invitation:
                raise HTTPException(
                    status_code=403,
                    detail="Invalid or already used invitation."
                )

            claim_result = invitations_collection.update_one(
                invitation_filter,
                {
                    "$set": {
                        "status": "processing",
                        "processing_at": datetime.now(timezone.utc)
                    }
                }
            )

            if claim_result.modified_count != 1:
                raise HTTPException(
                    status_code=403,
                    detail="This invitation has already been used."
                )

            invitation_claimed = True

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
            "candidate_name": request.candidate_name,
            "candidate_email": request.candidate_email,
            "job_id": request.job_id,
            "answers": answers,
            "total_answers": len(answers),
            "evaluation": evaluation,
            "status": "completed",
        }

        # Save everything in MongoDB
        result = interviews_collection.insert_one(interview_data)
        interview_saved = True

        # Mark invitation as permanently used
        if invitation_claimed:
            invitations_collection.update_one(
                {"token": request.invitation_token},
                {
                    "$set": {
                        "status": "used",
                        "used_at": datetime.now(timezone.utc)
                    }
                }
            )

        return {
            "message": "Interview evaluated and saved successfully!",
            "interview_id": str(result.inserted_id),
            "total_answers": len(answers),
            "evaluation": evaluation,
            "status": "completed"
        }

    except HTTPException:
        raise

    except Exception as error:

        # Restore invitation if interview was not saved
        if invitation_claimed and not interview_saved:
            invitations_collection.update_one(
                {
                    "token": request.invitation_token,
                    "status": "processing"
                },
                {
                    "$set": {"status": "active"},
                    "$unset": {"processing_at": ""}
                }
            )

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
@app.post("/jobs")
def create_job(request: JobRequest):
    try:
        job_data = {
            "title": request.title,
            "department": request.department,
            "description": request.description,
            "requirements": request.requirements,
            "location": request.location,
            "job_type": request.job_type,
            "status": "active"
        }

        result = jobs_collection.insert_one(job_data)

        return {
            "message": "Job created successfully!",
            "job_id": str(result.inserted_id),
            "status": "active"
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Job creation failed: {error}"
        )
@app.get("/jobs")
def get_jobs():
    jobs = list(
    jobs_collection.find({"status": "active"}).sort("_id", -1)
)

    for job in jobs:
        job["id"] = str(job["_id"])
        del job["_id"]

    return {
        "jobs": jobs,
        "total": len(jobs)
    }

@app.get("/jobs/{job_id}")
def get_job(job_id: str):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    job = jobs_collection.find_one({
        "_id": ObjectId(job_id),
        "status": "active"
    })

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    job["id"] = str(job["_id"])
    del job["_id"]

    return {"job": job}

@app.post("/applications")
def submit_application(
    job_id: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    cover_letter: str = Form(""),
    resume: UploadFile = File(...)
):
    # Validate job ID
    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    # Check whether job exists and is active
    job = jobs_collection.find_one({
        "_id": ObjectId(job_id),
        "status": "active"
    })

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job is not available"
        )

    # Validate candidate information
    if not full_name.strip() or not email.strip() or not phone.strip():
        raise HTTPException(
            status_code=400,
            detail="All personal information fields are required"
        )

    # Validate resume extension
    extension = Path(resume.filename or "").suffix.lower()

    allowed_extensions = [".pdf", ".doc", ".docx"]

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC and DOCX files are allowed"
        )

    # Read resume and enforce 5 MB limit
    file_content = resume.file.read(5 * 1024 * 1024 + 1)

    if len(file_content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Resume must be smaller than 5 MB"
        )

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded resume is empty"
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{extension}"

    resume_path = RESUME_DIR / unique_filename

    # Save resume
    with open(resume_path, "wb") as file:
        file.write(file_content)

    # Save application in MongoDB
    application = {
        "job_id": job_id,
        "candidate_name": full_name.strip(),
        "candidate_email": email.strip().lower(),
        "phone": phone.strip(),
        "cover_letter": cover_letter.strip(),
        "resume": {
            "filename": resume.filename,
            "stored_filename": unique_filename,
            "content_type": resume.content_type,
            "size": len(file_content)
        },
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }

    try:
        result = applications_collection.insert_one(application)
    except Exception:
        resume_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Unable to save application"
        )

    return {
        "message": "Application submitted successfully",
        "application_id": str(result.inserted_id)
    }

@app.get("/applications")
def get_all_applications():

    applications = list(
        applications_collection.find().sort("_id", -1)
    )

    for application in applications:

        application["id"] = str(application["_id"])
        del application["_id"]

        # Get the job associated with this application
        job = jobs_collection.find_one({
            "_id": ObjectId(application["job_id"])
        })

        if job:
            application["job_title"] = job.get("title", "Unknown Job")
        else:
            application["job_title"] = "Job no longer available"

    return {
        "applications": applications,
        "total": len(applications)
    }


@app.get("/jobs/{job_id}/applications")
def get_job_applications(job_id: str):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID"
        )

    job = jobs_collection.find_one({
        "_id": ObjectId(job_id)
    })

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    applications = list(
        applications_collection.find(
            {"job_id": job_id}
        ).sort("_id", -1)
    )

    for application in applications:
        application["id"] = str(application["_id"])
        del application["_id"]

    return {
        "applications": applications,
        "total": len(applications)
    }


@app.get("/jobs/{job_id}/interviews")
def get_job_interviews(job_id: str):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid job ID."
        )

    job = jobs_collection.find_one({"_id": ObjectId(job_id)})

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found."
        )

    interviews = list(
        interviews_collection.find(
            {"job_id": job_id}
        ).sort("_id", -1)
    )

    for interview in interviews:
        interview["id"] = str(interview["_id"])
        del interview["_id"]

    job["id"] = str(job["_id"])
    del job["_id"]

    return {
        "job": job,
        "interviews": interviews,
        "total": len(interviews)
    }
@app.post("/jobs/{job_id}/invite")
def generate_job_invite(job_id: str):

    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = jobs_collection.find_one({"_id": ObjectId(job_id)})

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    token = secrets.token_urlsafe(24)

    invitation = {
        "token": token,
        "job_id": job_id,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "status": "active"
    }

    invitations_collection.insert_one(invitation)

    return {
        "message": "Invitation link generated successfully",
        "token": token,
        "job_id": job_id,
        "invite_link": f"http://localhost:3000/interview/invite/{token}"
    }

@app.get("/applications/{application_id}/resume")
def view_application_resume(application_id: str):

    if not ObjectId.is_valid(application_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid application ID"
        )

    application = applications_collection.find_one({
        "_id": ObjectId(application_id)
    })

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    resume = application.get("resume", {})
    stored_filename = resume.get("stored_filename")

    if not stored_filename:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    resume_path = (RESUME_DIR / stored_filename).resolve()

    if resume_path.parent != RESUME_DIR.resolve() or not resume_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Resume file not found"
        )

    return FileResponse(
    path=str(resume_path),
    media_type=resume.get("content_type") or "application/octet-stream",
    content_disposition_type="inline"
)
    
@app.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    request: ApplicationStatusUpdate
):
    allowed_statuses = ["pending", "shortlisted", "rejected"]

    if not ObjectId.is_valid(application_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid application ID"
        )

    if request.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status"
        )

    result = applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": request.status}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return {
        "message": "Application status updated successfully",
        "status": request.status
    }


@app.get("/interview/invite/{token}")
def validate_invitation(token: str):

    invitation = invitations_collection.find_one({
        "token": token,
        "status": "active",
        "expires_at": {
        "$gt": datetime.now(timezone.utc)
    }
    })

    if not invitation:
        raise HTTPException(
            status_code=404,
            detail="Invalid or expired invitation link"
        )

    job = jobs_collection.find_one({
        "_id": ObjectId(invitation["job_id"])
    })

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Associated job not found"
        )
    return {
        "valid": True,
        "job": {
            "id": str(job["_id"]),
            "title": job["title"],
            "department": job["department"],
            "description": job["description"],
            "requirements": job["requirements"],
            "location": job["location"],
            "job_type": job["job_type"]
        }
    }