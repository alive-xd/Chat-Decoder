"""
Thin wrapper around google-generativeai for Gemini 1.5 Flash.
All prompts are designed so raw messages are NEVER sent — only
anonymized summaries and statistical objects.
"""
import json
import re
from typing import Any, Dict, Optional

import google.generativeai as genai

from app.core.config import settings

_model: Optional[Any] = None


def _get_model():
    global _model
    if _model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


def _clean_json(text: str) -> str:
    """Strip markdown code fences from model output."""
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = text.strip().strip("`")
    return text


import asyncio
import google.api_core.exceptions

async def gemini_generate(prompt: str, expect_json: bool = False) -> str:
    model = _get_model()
    
    max_retries = 5
    delay = 2.0
    
    for attempt in range(max_retries):
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, model.generate_content, prompt)
            raw = response.text
            if expect_json:
                return _clean_json(raw)
            return raw
        except google.api_core.exceptions.ResourceExhausted as e:
            if attempt == max_retries - 1:
                raise e
            print(f"Gemini API rate limit hit. Retrying in {delay} seconds... (Attempt {attempt+1}/{max_retries})")
            await asyncio.sleep(delay)
            delay *= 2.0
        except Exception as e:
            raise e


async def health_score_from_stats(stats_summary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Receive anonymized stats dict, return health score 0-100,
    label, and 3 key observations. Raw messages never sent.
    """
    prompt = f"""You are a relationship communication analyst.

Given these anonymized conversation statistics (no raw messages):
{json.dumps(stats_summary, indent=2)}

Return ONLY a JSON object with this exact shape:
{{
  "score": <integer 0-100>,
  "label": "<one of: Thriving, Healthy, Developing, Strained, Critical>",
  "observations": ["<observation 1>", "<observation 2>", "<observation 3>"]
}}

Base the score on: response reciprocity, initiation balance, activity consistency,
and message frequency. Be constructive, not judgmental.
Return ONLY JSON, no preamble."""

    raw = await gemini_generate(prompt, expect_json=True)
    return json.loads(raw)


async def personality_from_samples(
    participant: str, samples: list[str]
) -> Dict[str, Any]:
    """
    Receive up to 50 anonymized message samples (sender label replaced
    with "Person A" etc.), return personality profile. No real names sent.
    """
    sample_text = "\n".join(f"- {s}" for s in samples[:50])
    prompt = f"""You are a communication style analyst.

Analyze these {len(samples[:50])} anonymized messages from a single conversation participant:
{sample_text}

Return ONLY a JSON object with this exact shape:
{{
  "tone": "<e.g. Warm, Direct, Playful, Formal, Sarcastic>",
  "humor": "<e.g. High, Moderate, Low, Dry>",
  "assertiveness": "<e.g. High, Moderate, Low>",
  "empathy": "<e.g. High, Moderate, Low>",
  "summary": "<one sentence description of their communication style>"
}}

Return ONLY JSON, no preamble."""

    raw = await gemini_generate(prompt, expect_json=True)
    return json.loads(raw)


async def rag_answer(question: str, context_chunks: list[str]) -> Dict[str, Any]:
    """Answer a question using retrieved context chunks."""
    context = "\n\n---\n\n".join(context_chunks)
    prompt = f"""You are a helpful assistant analyzing a WhatsApp conversation.

Use ONLY the following conversation excerpts to answer the question.
If the answer is not in the excerpts, say so honestly.

CONVERSATION EXCERPTS:
{context}

QUESTION: {question}

Provide a clear, concise answer based only on the excerpts above.
If you reference specific moments, mention approximate timeframes."""

    answer = await gemini_generate(prompt)
    return {"answer": answer}


async def detect_timeline_events(anonymized_summary: str) -> list[Dict[str, Any]]:
    """Detect key conversation milestones from an anonymized summary."""
    prompt = f"""You are analyzing an anonymized conversation timeline summary.

CONVERSATION SUMMARY (anonymized, no raw messages):
{anonymized_summary}

Identify key moments and return a JSON array of events. Each event:
{{
  "date": "<ISO date string YYYY-MM-DD>",
  "event": "<brief description of the moment>",
  "type": "<one of: first_message, milestone, silence, emotional_peak, topic_shift>"
}}

Return 5-10 meaningful events. Return ONLY a JSON array, no preamble."""

    raw = await gemini_generate(prompt, expect_json=True)
    return json.loads(raw)
