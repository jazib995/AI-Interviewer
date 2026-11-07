
import requests
import json


OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5:3b"


def generate_ai_response(prompt):

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=120
        )

        response.raise_for_status()

        result = response.json()

        return result["response"]

    except requests.exceptions.RequestException as error:
        raise Exception(f"AI service error: {error}")

def evaluate_interview(role, interview_type, difficulty, answers):

    prompt = f"""
You are an experienced professional recruitment evaluator.

Evaluate the candidate's interview answers fairly.

Job role: {role}
Interview type: {interview_type}
Difficulty: {difficulty}

Candidate answers:
{json.dumps(answers, indent=2)}

Return ONLY valid JSON with these exact fields:

{{
    "overall_score": 0,
    "technical_knowledge_score": 0,
    "communication_score": 0,
    "strengths": [
        "A specific strength"
    ],
    "weaknesses": [
        "A specific area for improvement"
    ],
    "summary": "A concise evaluation of the candidate."
}}

Rules:
- All scores must be between 0 and 100.
- Evaluate only what the candidate actually said.
- Do not invent skills or experience.
- Be fair and constructive.
- Consider the interview type when evaluating technical knowledge.
- Do not make the final hiring decision.
"""

    response = generate_ai_response(prompt)

    evaluation = json.loads(response)

    return evaluation

