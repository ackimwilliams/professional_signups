import logging
from typing import BinaryIO
from pypdf import PdfReader

logger = logging.getLogger("api")


def extract_text_from_pdf(file_obj: BinaryIO) -> str:
    """
    Extracts text from a pdf resume, can extend to other file types
    """
    try:
        reader = PdfReader(file_obj)
        parts: list[str] = []

        for page in reader.pages:
            text = page.extract_text() or ""

            if text.strip():
                parts.append(text.strip())

        return "\n\n".join(parts).strip()

    except Exception: # @todo: consider using a custom exception
        logger.exception("Failed to extract text from PDF")
        return ""
