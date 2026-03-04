#!/usr/bin/env python
"""
Align narration audio against canonical script text.

Primary mode:
- Uses WhisperX forced alignment when dependencies are installed.

Fallback mode:
- Uses WAV duration and deterministic timing distribution.
"""

from __future__ import annotations

import argparse
import json
import re
import wave
from pathlib import Path
from typing import Any


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def tokenize_words(text: str) -> list[str]:
    return re.findall(r"[A-Za-z0-9']+|[.,!?;:()-]", text)


def wav_duration_ms(path: Path) -> int:
    with wave.open(str(path), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        if rate <= 0:
            return 0
        return int((frames / rate) * 1000)


def canonical_words_from_reference(script: str, ref_words: list[dict[str, Any]], duration_ms: int) -> list[dict[str, Any]]:
    script_words = [w for w in tokenize_words(script) if re.search(r"[A-Za-z0-9]", w)]
    if not script_words:
        return []

    if not ref_words:
        span = max(600, duration_ms - 400)
        step = span / max(1, len(script_words))
        return [
            {
                "word": word,
                "startMs": int(200 + i * step),
                "endMs": int(200 + (i + 0.9) * step),
                "confidence": 0.3,
            }
            for i, word in enumerate(script_words)
        ]

    count_ref = len(ref_words)
    count_script = len(script_words)
    mapped: list[dict[str, Any]] = []
    for idx, word in enumerate(script_words):
        ref_idx = round((idx / max(1, count_script - 1)) * max(0, count_ref - 1))
        ref = ref_words[min(ref_idx, count_ref - 1)]
        start_ms = int(ref["startMs"])
        end_ms = int(ref["endMs"])
        if end_ms <= start_ms:
            end_ms = start_ms + 80
        mapped.append(
            {
                "word": word,
                "startMs": start_ms,
                "endMs": end_ms,
                "confidence": float(ref.get("confidence", 0.65)) * 0.95,
            }
        )
    return mapped


def sentence_segments_from_words(script: str, words: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sentences = split_sentences(script)
    if not sentences:
        return []

    script_words = [w for w in tokenize_words(script) if re.search(r"[A-Za-z0-9]", w)]
    word_cursor = 0
    segments: list[dict[str, Any]] = []
    for idx, sentence in enumerate(sentences):
        sentence_words = [w for w in tokenize_words(sentence) if re.search(r"[A-Za-z0-9]", w)]
        n_words = max(1, len(sentence_words))
        start_idx = min(word_cursor, max(0, len(words) - 1))
        end_idx = min(word_cursor + n_words - 1, max(0, len(words) - 1))
        word_cursor += n_words

        start_ms = int(words[start_idx]["startMs"]) if words else 0
        end_ms = int(words[end_idx]["endMs"]) if words else start_ms + 500
        if end_ms <= start_ms:
            end_ms = start_ms + 320

        segments.append(
            {
                "id": f"s-{idx + 1}",
                "text": sentence,
                "startMs": start_ms,
                "endMs": end_ms,
            }
        )
    return segments


def align_with_whisperx(audio_path: Path) -> list[dict[str, Any]]:
    import torch  # type: ignore
    import whisperx  # type: ignore

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = whisperx.load_model("small", device, compute_type="float32")
    transcript = model.transcribe(str(audio_path), batch_size=8)
    model_a, metadata = whisperx.load_align_model(language_code=transcript["language"], device=device)
    aligned = whisperx.align(transcript["segments"], model_a, metadata, str(audio_path), device, return_char_alignments=False)

    words: list[dict[str, Any]] = []
    for seg in aligned.get("segments", []):
        for word in seg.get("words", []):
            if "start" not in word or "end" not in word:
                continue
            token = str(word.get("word", "")).strip()
            if not token:
                continue
            words.append(
                {
                    "word": token,
                    "startMs": int(float(word["start"]) * 1000),
                    "endMs": int(float(word["end"]) * 1000),
                    "confidence": float(word.get("score", 0.75)),
                }
            )
    return words


def fallback_words(duration_ms: int, script: str) -> list[dict[str, Any]]:
    tokens = [w for w in tokenize_words(script) if re.search(r"[A-Za-z0-9]", w)]
    if not tokens:
        return []
    step = max(120, (duration_ms - 300) / len(tokens))
    out = []
    for idx, token in enumerate(tokens):
        start_ms = int(150 + idx * step)
        end_ms = int(min(duration_ms - 80, start_ms + step * 0.9))
        out.append(
            {
                "word": token,
                "startMs": start_ms,
                "endMs": max(start_ms + 80, end_ms),
                "confidence": 0.35,
            }
        )
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True)
    parser.add_argument("--script-file", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    audio_path = Path(args.audio)
    script_path = Path(args.script_file)
    output_path = Path(args.output)
    script_text = script_path.read_text(encoding="utf-8").strip()
    duration_ms = max(1000, wav_duration_ms(audio_path))

    mode = "forced"
    try:
        ref_words = align_with_whisperx(audio_path)
    except Exception:
        mode = "fallback"
        ref_words = fallback_words(duration_ms, script_text)

    canonical_words = canonical_words_from_reference(script_text, ref_words, duration_ms)
    segments = sentence_segments_from_words(script_text, canonical_words)

    payload = {
        "mode": mode,
        "durationMs": duration_ms,
        "words": canonical_words,
        "segments": segments,
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

