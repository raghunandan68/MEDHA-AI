import json
import random
from typing import Any

from app.config import settings


def _call_llm(prompt: str, response_format: dict | None = None, system: str | None = None) -> str | None:
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
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        kwargs: dict[str, Any] = {"model": model, "messages": messages}
        if response_format:
            kwargs["response_format"] = {"type": "json_object"}
        resp = client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content
    except Exception:
        return None


def generate_flashcards(text: str, count: int = 5) -> list[dict]:
    if not _has_real_content(text):
        return _mock_flashcards(text, count)

    total_chars = max(5000, count * 3000)
    text_section = _sample_text(text, total_chars)

    system = (
        "You are a document analysis expert. Your task is to create flashcards that serve as a "
        "complete recap of the provided text. The flashcards must collectively cover ALL key concepts, "
        "ideas, definitions, and important details in the text. "
        "Each flashcard's 'back' must be self-contained and detailed enough that the user understands "
        "the concept fully without referring back to the original document. "
        "Do not skip any important concept. The set of flashcards should be a comprehensive study guide."
    )
    prompt = (
        f"Generate EXACTLY {count} flashcards that serve as a complete recap of the text below. "
        "STRICT RULES:\n"
        "1. Collectively, the flashcards MUST cover ALL key concepts and ideas from the entire text.\n"
        "2. Each 'front' should be a clear question or concept name.\n"
        "3. Each 'back' must be a detailed, self-contained explanation so the user understands "
        "the concept fully WITHOUT needing the original document.\n"
        "4. Assign a 'topic' (the SPECIFIC concept or subject from the document content itself, "
        "e.g. 'Photosynthesis', 'Supply Chain', 'Neural Networks', NOT generic labels like 'Introduction' or 'Core Concepts').\n"
        "5. Do NOT create duplicate or overlapping cards.\n"
        "6. The flashcards should progress logically through the document's content.\n\n"
        "Each flashcard must have 'front' (string), 'back' (string), and 'topic' (string). "
        f"Return a JSON object with a 'flashcards' array.\n\nText:\n{text_section}"
    )
    result = _call_llm(prompt, {"type": "json_object"}, system=system)
    if result:
        try:
            data = json.loads(result)
            cards = data.get("flashcards", [])
            if cards:
                return cards[:count]
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

    return _mock_flashcards(text, count)


def _has_real_content(text: str) -> bool:
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 30]
    return len(sentences) >= 2


def _sample_text(text: str, total_chars: int = 15000) -> str:
    if len(text) <= total_chars:
        return text

    skip_ahead = min(len(text) // 5, 6000)
    body = text[skip_ahead:]
    lines = body.split("\n")
    content_idx = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if len(stripped) > 60 and " " in stripped and not stripped.startswith("."):
            content_idx = max(0, i - 1)
            break
    body = "\n".join(lines[content_idx:])

    if len(body) <= total_chars:
        return body

    seg_count = 4
    seg_size = total_chars // seg_count
    gap = max(0, len(body) - seg_count * seg_size) // (seg_count - 1)
    parts = []
    for i in range(seg_count):
        start = i * (seg_size + gap)
        parts.append(body[start:start + seg_size])
    return "\n\n".join(parts)


def generate_quiz(text: str, count: int = 5, exclude_questions: list[str] | None = None) -> list[dict]:
    if not _has_real_content(text):
        return _mock_quizzes(text, count)

    total_chars = max(5000, count * 3000)
    text_section = _sample_text(text, total_chars)

    exclusion = ""
    if exclude_questions:
        exclusion = (
            "The following questions/concepts have already been covered in flashcards. "
            "DO NOT create quiz questions about these same topics. Create questions about DIFFERENT aspects of the content.\n"
            f"Already covered:\n{chr(10).join('- ' + q[:100] for q in exclude_questions)}\n\n"
        )

    system = (
        "You are a strict document-based quiz generator. "
        "You MUST ONLY use information explicitly present in the provided text below. "
        "Never use your pre-trained knowledge or external facts. "
        "If the text does not contain enough information for a question, do not create that question. "
        "CRITICAL: Read the entire provided text first, then create questions ONLY about what is "
        "explicitly written. Do not infer, extrapolate, or add outside knowledge."
    )
    prompt = (
        f"Based SOLELY on the following document text, generate {count} multiple-choice quiz questions. "
        "STRICT RULES:\n"
        "- EVERY question MUST be directly answerable from the provided text ONLY.\n"
        "- Each question must reference a specific fact, definition, number, name, or statement found in the text.\n"
        "- Do NOT use 'complete the sentence', 'fill in the blank', or 'what does this describe' formats. "
        "These are flashcard-style questions, not quiz questions.\n"
        "- Instead, use question types like: 'What is...', 'Which of the following...', "
        "'According to the document...', 'What does the document say about...'.\n"
        f"- If the text doesn't contain enough information for {count} questions, generate fewer.\n"
        "- Do NOT create questions about topics, facts, or concepts not present in the text.\n"
        "- The correct answer MUST be explicitly stated word-for-word in the text.\n"
        "- All 4 options must be plausible but only one must be correct based on the text.\n"
        "- The explanation must quote the exact sentence from the text that gives the answer.\n\n"
        "Each question should have 'question' (string), 'options' (array of 4 strings), "
        "'correct_answer' (0-based index of correct option), 'explanation' (string), "
        "and 'topic' (string) — the SPECIFIC concept or subject this question tests, extracted from the "
        "document content itself (e.g. 'Photosynthesis', 'Market Equilibrium', 'TCP/IP Protocol'), "
        "NOT generic category labels like 'Core Concepts' or 'Definitions'. "
        f"{exclusion}"
        f"Return a JSON object with a 'quizzes' array.\n\nDocument Text:\n{text_section}"
    )
    result = _call_llm(prompt, {"type": "json_object"}, system=system)
    if result:
        try:
            data = json.loads(result)
            quizzes = data.get("quizzes", [])
            if quizzes:
                validated = _validate_quiz_questions(quizzes, text_section)
                if validated:
                    return validated[:count]
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

    return _mock_quizzes(text, count)


def _validate_quiz_questions(quizzes: list[dict], text: str) -> list[dict]:
    text_lower = text.lower()
    valid = []
    for q in quizzes:
        question = q.get("question", "")
        if not question:
            continue
        key_phrases = [p for p in question.lower().split() if len(p) > 4]
        if not key_phrases:
            valid.append(q)
            continue
        matches = sum(1 for p in key_phrases if p in text_lower)
        if matches / len(key_phrases) >= 0.3:
            valid.append(q)
    return valid


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
    paragraphs = [p.strip() for p in text.replace("\n", " ").split("  ") if len(p.strip()) > 80]
    if not paragraphs:
        return [{"front": "No content found", "back": "The document has no extractable text.", "topic": "Error"}]

    cards = []
    for i in range(min(count, len(paragraphs))):
        para = paragraphs[i]
        sentences_in_para = [s.strip() for s in para.split(".") if len(s.strip()) > 20]
        if not sentences_in_para:
            continue
        first_sentence = sentences_in_para[0]
        words = first_sentence.split()
        topic = " ".join(words[:8]) if len(words) > 8 else first_sentence
        cards.append({
            "front": f"Summarize what the document says about: {topic[:120]}",
            "back": para[:300],
            "topic": topic[:80],
        })
    return cards


def _mock_quizzes(text: str, count: int) -> list[dict]:
    paragraphs = [p.strip() for p in text.replace("\n", " ").split("  ") if len(p.strip()) > 80]
    if not paragraphs:
        return [{"question": "No readable content found in the document.", "options": ["Yes", "No", "Maybe", "N/A"], "correct_answer": 1, "explanation": "The document does not contain extractable text.", "topic": "General"}]

    random.shuffle(paragraphs)
    quizzes = []
    for i in range(min(count, len(paragraphs))):
        para = paragraphs[i]
        sentences_in_para = [s.strip() for s in para.split(".") if len(s.strip()) > 20]
        if len(sentences_in_para) < 2:
            continue

        answer_sentence = sentences_in_para[0]
        wrong_sentences = random.sample([s for s in sentences_in_para[1:] if s != answer_sentence], min(3, len(sentences_in_para)-1))

        correct = answer_sentence[:200]
        options = [correct] + [s[:200] for s in wrong_sentences]
        while len(options) < 4:
            options.append("None of the above")
        random.shuffle(options)
        correct_idx = options.index(correct)

        key_words = " ".join(answer_sentence.split()[:4])

        quizzes.append({
            "question": f"Which of the following statements is directly from the document about {key_words}?",
            "options": options,
            "correct_answer": correct_idx,
            "explanation": f"The document states: \"{answer_sentence[:200]}\"",
            "topic": key_words[:80],
        })
    return quizzes[:count]


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
