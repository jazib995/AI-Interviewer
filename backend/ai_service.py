
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
You are a STRICT and experienced technical recruitment evaluator.

Your job is to evaluate candidates based ONLY on the quality of their actual answers.

IMPORTANT:
Do not reward candidates for simply attempting an answer.
Do not give generous scores.
Do not assume the candidate knows something they did not demonstrate.

JOB DETAILS:
Role: {role}
Interview Type: {interview_type}
Difficulty: {difficulty}

CANDIDATE ANSWERS:
{json.dumps(answers, indent=2)}

STRICT SCORING RUBRIC:

0-10:
- Empty answers.
- Nonsense or random text.
- Unrelated answers.
- One-word answers that provide no meaningful information.
- Answers such as "yes", "okay", "I don't know" without explanation.

11-30:
- Very weak understanding.
- Mostly incorrect information.
- Extremely incomplete answers.
- Candidate barely addresses the question.

31-50:
- Partial understanding.
- Some relevant information.
- Major missing concepts or technical mistakes.

51-70:
- Reasonably correct answers.
- Demonstrates basic understanding.
- Some missing details or weaknesses.

71-85:
- Strong and relevant answers.
- Good conceptual understanding.
- Accurate explanations and appropriate examples.

86-100:
- Excellent answers.
- Detailed, accurate explanations.
- Strong reasoning and practical examples.
- Demonstrates advanced understanding where appropriate.

EVALUATION RULES:

1. Evaluate EVERY answer against its corresponding question.
2. Relevance is essential. Unrelated answers must receive very low scores.
3. A one-word answer must not receive a high score simply because it contains a technically correct keyword.
4. Do not confuse answer length with answer quality. A short but accurate answer can receive a good score if it fully answers the question.
5. Penalize incorrect technical explanations.
6. Reward correct concepts, reasoning, examples and practical understanding.
7. Never invent strengths, experience or technical knowledge.
8. If all answers are meaningless or irrelevant, the overall score must be 0-10.
9. Do not inflate scores to encourage the candidate.
10. Evaluate communication based on clarity, relevance and ability to explain ideas, not accent or grammar alone.
11. Consider the interview difficulty when evaluating answers.
12. Be objective and consistent.

SCORING:

- overall_score: Overall quality across all answers.
- technical_knowledge_score: Accuracy and understanding of relevant concepts.
- communication_score: Clarity, relevance and explanation quality.

The overall score must reflect the actual quality of the answers.
Do not give high overall scores when most answers are weak.

Return ONLY valid JSON with exactly these fields:

{{
    "overall_score": 0,
    "technical_knowledge_score": 0,
    "communication_score": 0,
    "strengths": [],
    "weaknesses": [],
    "summary": "A concise and honest evaluation of the candidate."
}}

Do not include markdown or text outside the JSON.
"""

    response = generate_ai_response(prompt)

    evaluation = json.loads(response)

    return evaluation