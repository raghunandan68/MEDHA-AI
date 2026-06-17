import json
import random
from typing import Any

from app.config import settings


def _call_llm(prompt: str, response_format: dict | None = None) -> str | None:
    groq_key = settings.groq_api_key
    openai_key = settings.openai_api_key

    if groq_key:
        base_url = "https://api.groq.com/openai/v1"
        api_key = groq_key
        model = settings.ai_model
    elif openai_key and openai_key != "sk-your-openai-api-key":
        base_url = None
        api_key = openai_key
        model = "gpt-4o-mini"
    else:
        return None

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key, base_url=base_url)
        kwargs: dict[str, Any] = {"model": model, "messages": [{"role": "user", "content": prompt}]}
        if response_format:
            kwargs["response_format"] = {"type": "json_object"}
        resp = client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content
    except Exception:
        return None


def generate_flashcards(text: str, count: int = 5) -> list[dict]:
    max_chars = min(5000, max(2000, count * 500))
    prompt = (
        f"Based on the following text, generate {count} flashcards for studying. "
        "Each flashcard should have 'front' (the question/concept), 'back' (the answer/definition), "
        "and 'topic' (a short category label). "
        "Make the flashcards cover different aspects of the content."
        f"Return a JSON object with a 'flashcards' array.\n\nText:\n{text[:max_chars]}"
    )
    result = _call_llm(prompt, {"type": "json_object"})
    if result:
        try:
            data = json.loads(result)
            cards = data.get("flashcards", [])
            if cards:
                return cards[:count]
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

    return _mock_flashcards(text, count)


def generate_quiz(text: str, count: int = 5, exclude_questions: list[str] | None = None) -> list[dict]:
    max_chars = min(5000, max(2000, count * 600))
    exclusion = ""
    if exclude_questions:
        exclusion = (
            "The following questions/concepts have already been covered in flashcards. "
            "DO NOT create quiz questions about these same topics. Create questions about DIFFERENT aspects of the content.\n"
            f"Already covered:\n{chr(10).join('- ' + q[:100] for q in exclude_questions)}\n\n"
        )
    prompt = (
        f"Based SOLELY on the following text, generate {count} multiple-choice quiz questions. "
        "STRICT RULES:\n"
        "- Every question MUST be directly answerable from the provided text.\n"
        "- The correct answer MUST be explicitly stated in the text.\n"
        "- Do NOT create questions about topics, facts, or concepts not present in the text.\n"
        "- All 4 options must be plausible but only one must be correct based on the text.\n"
        "- The explanation must quote or reference the specific part of the text that gives the answer.\n\n"
        "Each question should have 'question' (string), 'options' (array of 4 strings), "
        "'correct_answer' (0-based index of correct option), and 'explanation' (string). "
        f"{exclusion}"
        "Return a JSON object with a 'quizzes' array.\n\nText:\n{text[:max_chars]}"
    )
    result = _call_llm(prompt, {"type": "json_object"})
    if result:
        try:
            data = json.loads(result)
            quizzes = data.get("quizzes", [])
            if quizzes:
                return quizzes[:count]
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

    return _mock_quizzes(text, count)


def generate_title(text: str) -> str:
    prompt = (
        "Generate a short document title (max 6 words, no quotes) based on the following text. "
        "Return only the title, nothing else.\n\nText:\n" + text[:500]
    )
    result = _call_llm(prompt)
    if result:
        title = result.strip().strip('"').strip("'")
        if len(title) > 60:
            title = title[:60]
        return title
    return ""


def generate_chat_response(message: str, context: str = "") -> str:
    context = context.strip()
    if context:
        prompt = (
            "You are Medha AI, a strict document-based Q&A assistant. "
            "Your ONLY source of knowledge is the document context provided below. "
            "You MUST follow these rules:\n"
            "1. ONLY answer questions using information explicitly present in the provided context.\n"
            "2. If the question cannot be fully answered from the context, say "
            "\"I don't have enough information to answer that based on your document.\"\n"
            "3. Do NOT use any external knowledge, common sense, or prior training to answer.\n"
            "4. Do NOT make up or infer information that is not directly stated.\n"
            "5. Keep responses concise and directly based on the text.\n"
            "6. If the user greets you or asks how you are, respond briefly and steer back to the document.\n\n"
            f"--- DOCUMENT CONTEXT ---\n{context[:4000]}\n--- END CONTEXT ---\n\n"
            f"User message: {message}\n\nResponse:"
        )
    else:
        prompt = (
            "You are Medha AI, a document-based learning assistant. "
            "No documents have been uploaded yet by the user. "
            "Respond by politely explaining that you can only answer questions based on uploaded documents, "
            "and ask them to upload a PDF or paste text to get started. "
            "Do NOT answer any factual or knowledge-based questions without a document.\n\n"
            f"User message: {message}\n\nResponse:"
        )

    result = _call_llm(prompt)
    if result:
        return result.strip()

    if context:
        return "I don't have enough information to answer that based on your document."
    return _mock_chat_response(message)


def _mock_flashcards(text: str, count: int) -> list[dict]:
    topics = ["Core Concepts", "Key Terms", "Important Ideas", "Summary", "Key Takeaways"]
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 20]
    cards = []
    for i in range(min(count, 10)):
        sentence = sentences[i % max(len(sentences), 1)] if sentences else f"Concept {i+1}"
        words = sentence.split()[:6]
        question = f"What is the significance of {' '.join(words)}?" if words else f"Question {i+1}"
        cards.append({
            "front": question,
            "back": sentence[:200] if len(sentence) > 10 else f"Key point #{i+1} from the document.",
            "topic": topics[i % len(topics)],
        })
    return cards


def _mock_quizzes(text: str, count: int) -> list[dict]:
    templates = [
        {"q": "What is the main topic discussed in this document?", "opts": ["The main subject area", "An unrelated topic", "A minor detail", "None of the above"], "correct": 0, "exp": "The document focuses on its primary subject matter throughout."},
        {"q": "Which of the following best describes the key concept?", "opts": ["A fundamental principle", "An optional detail", "A tangential point", "An incorrect assumption"], "correct": 0, "exp": "The key concept is the central idea around which the document is structured."},
        {"q": "What can be inferred from the content?", "opts": ["The author's main argument", "A hidden meaning", "An unrelated fact", "A personal opinion"], "correct": 0, "exp": "The content presents the author's main argument with supporting evidence."},
        {"q": "How does the document structure its information?", "opts": ["Logically from basics to advanced", "Randomly without structure", "In reverse chronological order", "As a list of facts"], "correct": 0, "exp": "Information is organized logically, building from foundational concepts to more complex ideas."},
        {"q": "What is the primary purpose of this material?", "opts": ["To educate and inform", "To entertain", "To persuade", "To criticize"], "correct": 0, "exp": "The material is educational in nature, designed to inform the reader about the subject."},
    ]
    quizzes = []
    for i in range(min(count, len(templates))):
        t = templates[i]
        quizzes.append({
            "question": t["q"],
            "options": t["opts"],
            "correct_answer": t["correct"],
            "explanation": t["exp"],
        })
    random.shuffle(quizzes)
    return quizzes


def _mock_chat_response(message: str) -> str:
    message_lower = message.lower()
    if "hello" in message_lower or "hi " in message_lower or message_lower.startswith("hi"):
        return "Hello! I'm your Medha AI learning assistant. How can I help you with your studies today? You can upload a PDF document, and I'll help you create flashcards, quizzes, and study notes!"
    if "summarize" in message_lower or "summary" in message_lower:
        return "I'd be happy to summarize your document! Please upload a PDF first using the attachment button, then I'll analyze it and provide a comprehensive summary."
    if "flashcard" in message_lower:
        return "I can generate flashcards from your uploaded PDFs! Upload a document and say 'summarize this' to automatically create flashcards covering all the key concepts."
    if "quiz" in message_lower or "test" in message_lower or "practice" in message_lower:
        return "Ready to test your knowledge? I can generate quiz questions from any uploaded document. Upload a PDF and let me know when you want to practice!"
    return "That's a great question! To give you the most accurate response, try uploading a PDF document related to your topic. I'll analyze it and provide detailed answers, create flashcards, and generate practice quizzes to help you master the material."
