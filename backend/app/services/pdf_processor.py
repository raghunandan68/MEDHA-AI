import os
import uuid
from pathlib import Path

from app.config import settings

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


def ensure_upload_dir():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_upload(file_bytes: bytes, original_filename: str) -> tuple[str, str]:
    ensure_upload_dir()
    ext = Path(original_filename).suffix or ".pdf"
    stored_name = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / stored_name
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return stored_name, str(file_path)


def extract_text_from_pdf(file_path: str) -> str:
    try:
        import fitz
    except ImportError:
        return "PDF text extraction requires PyMuPDF. Install with: pip install PyMuPDF"

    try:
        doc = fitz.open(file_path)
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
        return text.strip() or "No text could be extracted from this PDF."
    except Exception as e:
        return f"Error extracting text: {e}"


def save_text(text_content: str, filename: str = "pasted.txt") -> tuple[str, str]:
    ensure_upload_dir()
    stored_name = f"{uuid.uuid4()}.txt"
    file_path = UPLOAD_DIR / stored_name
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text_content)
    return stored_name, str(file_path)


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    if path.suffix.lower() == ".txt":
        try:
            return path.read_text(encoding="utf-8").strip() or "No text content."
        except Exception as e:
            return f"Error reading text file: {e}"
    return extract_text_from_pdf(file_path)


def cleanup_file(file_path: str):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass
