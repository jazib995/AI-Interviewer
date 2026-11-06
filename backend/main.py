
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
def health_check():
    return {"status": "healthy"}

class InterviewRequest(BaseModel):
    role: str
    interview_type: str
    difficulty: str


# Start a new interview
@app.post("/interview/start")
def start_interview(request: InterviewRequest):
     questions = {
    "Software Engineer": [
        {
            "title": "Tell me about yourself.",
            "description": "Introduce yourself and explain your technical background.",
            "tip": "Focus on your education, technical skills, and relevant projects."
        },
        {
            "title": "What is object-oriented programming?",
            "description": "Explain the concept of OOP and its main principles.",
            "tip": "Discuss encapsulation, inheritance, polymorphism, and abstraction."
        },
        {
            "title": "What is the difference between an array and a linked list?",
            "description": "Compare how these two data structures store and access data.",
            "tip": "Think about memory allocation and insertion or deletion."
        },
        {
            "title": "How do you handle errors in your code?",
            "description": "Explain how you identify and manage programming errors.",
            "tip": "Mention exception handling, debugging, and validation."
        },
        {
            "title": "Explain a challenging project you have worked on.",
            "description": "Describe a project, the challenges you faced, and how you solved them.",
            "tip": "Use a real project and explain your contribution."
        }
    ],

    "Frontend Developer": [
        {
            "title": "Tell me about yourself.",
            "description": "Introduce yourself and your frontend development experience.",
            "tip": "Mention your technologies and projects."
        },
        {
            "title": "What is the difference between React and Next.js?",
            "description": "Explain how these technologies differ and work together.",
            "tip": "Mention routing, rendering, and framework features."
        },
        {
            "title": "What are React hooks?",
            "description": "Explain how hooks help manage state and component behavior.",
            "tip": "Give examples such as useState and useEffect."
        },
        {
            "title": "How does responsive web design work?",
            "description": "Explain how websites adapt to different screen sizes.",
            "tip": "Mention CSS media queries and flexible layouts."
        },
        {
            "title": "How do you improve website performance?",
            "description": "Discuss techniques for making websites load and respond faster.",
            "tip": "Think about image optimization and reducing unnecessary rendering."
        }
    ],

    "Backend Developer": [
        {
            "title": "Tell me about yourself.",
            "description": "Introduce yourself and your backend development experience.",
            "tip": "Mention programming languages, databases, and projects."
        },
        {
            "title": "What is an API?",
            "description": "Explain how applications communicate through APIs.",
            "tip": "Use a simple example of a frontend requesting backend data."
        },
        {
            "title": "What is the difference between SQL and NoSQL?",
            "description": "Compare relational and non-relational databases.",
            "tip": "Discuss structure, relationships, and use cases."
        },
        {
            "title": "Explain authentication and authorization.",
            "description": "Describe how systems verify users and control their permissions.",
            "tip": "Explain the difference between identity and access."
        },
        {
            "title": "How do you handle database errors?",
            "description": "Explain how you manage failures during database operations.",
            "tip": "Mention exception handling, validation, and transactions."
        }
    ]
}
     selected_questions = questions.get(
        request.role,
        questions["Software Engineer"]
    )

     return {
        "message": "Interview configuration received!",
        "role": request.role,
        "interview_type": request.interview_type,
        "difficulty": request.difficulty,
        "questions": selected_questions
    }
class AnswerSubmission(BaseModel):
    role: str
    question: str
    answer: str


@app.post("/interview/submit")
def submit_answer(request: AnswerSubmission):

    return {
        "message": "Answer received successfully!",
        "role": request.role,
        "question": request.question,
        "answer": request.answer,
        "status": "received"
    }
