from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber


ROOT_DIR = Path(__file__).resolve().parents[2]
APP_DIR = ROOT_DIR / "spelling-bee-app"
OUTPUT_FILE = APP_DIR / "src" / "pdf-levels.generated.js"

PDF_SOURCES = [
    {
        "id": "level-1",
        "label": "Level 1",
        "subtitle": "一年級萬字王",
        "file": "Level 1.pdf",
        "format": "compact",
        "expected_count": 150,
    },
    {
        "id": "level-3-1",
        "label": "Level 3.1",
        "subtitle": "Grade 3.1",
        "file": "Level 3.1.pdf",
        "format": "definition",
    },
    {
        "id": "level-3-2",
        "label": "Level 3.2",
        "subtitle": "Grade 3.2",
        "file": "Level 3.2.pdf",
        "format": "definition",
    },
    {
        "id": "level-4",
        "label": "Level 4",
        "subtitle": "Grade 4",
        "file": "Level4 -2024-New.pdf",
        "format": "definition",
    },
    {
        "id": "level-5",
        "label": "Level 5",
        "subtitle": "Grade 5",
        "file": "Level 5 v2.pdf",
        "format": "definition",
    },
    {
        "id": "level-6",
        "label": "Level 6",
        "subtitle": "Grade 6",
        "file": "Level_6_v3.pdf",
        "format": "definition",
    },
    {
        "id": "level-7",
        "label": "Level 7",
        "subtitle": "Literature 7",
        "file": "Level 7.pdf",
        "format": "definition",
    },
    {
        "id": "level-8",
        "label": "Level 8",
        "subtitle": "Literature 8",
        "file": "Level-8-V2.pdf",
        "format": "definition",
    },
]

POS_PATTERN = (
    r"n|v|adj|adv|prep|conj|interj|pron|"
    r"Adj|αdj"
)
ENTRY_PATTERN = re.compile(
    rf"^([A-Za-z][A-Za-z'-]*)\s+({POS_PATTERN})(?:\s*\.|\b)\s*(.*)$"
)
LETTER_PATTERN = re.compile(r"^[A-Z]$")
PAGE_NUMBER_PATTERN = re.compile(r"^\d+$")
WORD_PATTERN = re.compile(r"^[A-Za-z]+$")


def main() -> None:
    levels = []
    for source in PDF_SOURCES:
        pdf_path = ROOT_DIR / source["file"]
        text_lines = extract_lines(pdf_path)
        if source["format"] == "compact":
            entries = parse_compact_words(text_lines)
        else:
            entries = parse_definition_words(text_lines)

        expected_count = source.get("expected_count")
        if expected_count and len(entries) != expected_count:
            raise ValueError(
                f"{source['file']} produced {len(entries)} words; expected {expected_count}"
            )

        levels.append(
            {
                "id": source["id"],
                "label": source["label"],
                "subtitle": source["subtitle"],
                "source": source["file"],
                "words": entries,
            }
        )

    write_js(levels)


def extract_lines(pdf_path: Path) -> list[str]:
    with pdfplumber.open(pdf_path) as document:
        lines = []
        for page in document.pages:
            text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            lines.extend(text.splitlines())
    return [line.strip() for line in lines if line.strip()]


def parse_compact_words(lines: list[str]) -> list[dict[str, str]]:
    words = []
    skip_tokens = {"Level", "Spelling", "Bee"}
    for line in lines:
        if "單字表" in line or "較難生字" in line:
            continue

        parts = line.split()
        if not parts:
            continue
        if parts[0] in skip_tokens:
            continue
        if LETTER_PATTERN.fullmatch(parts[0]):
            parts = parts[1:]

        index = 0
        while index < len(parts):
            token = sanitize_token(parts[index])
            next_token = sanitize_token(parts[index + 1]) if index + 1 < len(parts) else ""
            if token == "ice" and next_token == "cream":
                words.append("ice cream")
                index += 2
                continue
            if WORD_PATTERN.fullmatch(token):
                words.append(token)
            index += 1

    return make_entries(words)


def parse_definition_words(lines: list[str]) -> list[dict[str, str]]:
    entries = []
    current_entry = None

    for line in lines:
        if is_ignored_definition_line(line):
            continue

        match = ENTRY_PATTERN.match(line)
        if match:
            if current_entry:
                entries.append(current_entry)
            word, part_of_speech, definition = match.groups()
            current_entry = {
                "word": word,
                "partOfSpeech": normalize_part_of_speech(part_of_speech),
                "definition": clean_definition(definition),
            }
            continue

        if current_entry:
            current_entry["definition"] = clean_definition(
                current_entry["definition"] + " " + line
            )

    if current_entry:
        entries.append(current_entry)

    return make_entries(entries)


def is_ignored_definition_line(line: str) -> bool:
    if PAGE_NUMBER_PATTERN.fullmatch(line):
        return True
    if LETTER_PATTERN.fullmatch(line):
        return True
    if line.startswith(("Grade ", "Literature ")):
        return True
    return False


def make_entries(values: list[str] | list[dict[str, str]]) -> list[dict[str, str]]:
    entries = []
    seen = set()
    for value in values:
        if isinstance(value, str):
            entry = {"word": value}
        else:
            entry = value

        word = entry["word"].strip()
        key = word.lower()
        if not word or key in seen:
            continue
        seen.add(key)

        normalized = {"word": word}
        if entry.get("partOfSpeech"):
            normalized["partOfSpeech"] = entry["partOfSpeech"].strip()
        if entry.get("definition"):
            normalized["definition"] = entry["definition"].strip()
        entries.append(normalized)
    return entries


def sanitize_token(token: str) -> str:
    return re.sub(r"[^A-Za-z]", "", token)


def normalize_part_of_speech(value: str) -> str:
    return value.replace("α", "a").lower()


def clean_definition(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" .")


def write_js(levels: list[dict[str, object]]) -> None:
    payload = json.dumps(levels, ensure_ascii=False, indent=2)
    OUTPUT_FILE.write_text(
        "window.SpellingPdfLevels = Object.freeze("
        + payload
        + ");\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
