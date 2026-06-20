import tempfile
import logging
from pathlib import Path

from app.database import get_supabase
from app.services.pdf_processor import extract_text

logger = logging.getLogger(__name__)

BUCKET_NAME = "documents"


def download_and_extract_text(storage_path: str) -> str:
    supabase = get_supabase()
    ext = Path(storage_path).suffix.lower() or ".pdf"

    try:
        file_bytes = supabase.storage.from_(BUCKET_NAME).download(storage_path)
    except Exception as e:
        logger.error(f"Failed to download file from storage ({storage_path}): {e}")
        return f"Error: Could not download document from storage."

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        text = extract_text(tmp_path)
        return text
    except Exception as e:
        logger.error(f"Failed to extract text from file ({storage_path}): {e}")
        return f"Error extracting text: {e}"
    finally:
        try:
            Path(tmp_path).unlink(missing_ok=True)
        except Exception:
            pass
