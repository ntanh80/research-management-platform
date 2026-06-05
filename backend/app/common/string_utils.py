import re
import unicodedata
from difflib import SequenceMatcher


def slugify(text: str) -> str:
    text = (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-_")


def normalize_search(text: str) -> str:
    text = text.lower().strip()
    text = (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    return text


def fuzzy_match(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_search(a), normalize_search(b)).ratio()


def title_similarity(title1: str, title2: str) -> float:
    return fuzzy_match(title1, title2)
