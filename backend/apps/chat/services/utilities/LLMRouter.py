"""
LLMRouter — Shared fallback mechanism for Gemini → Groq models.

Priority model list (best tool-calling support):
  Tier 1 (Gemini):
    - gemini-2.5-flash   (primary)
  Tier 2 (Groq — best tool calling):
    - llama-3.3-70b-versatile
    - llama3-groq-70b-8192-tool-use-preview
    - llama-3.1-8b-instant

Rules:
  - On server start, always begins with Gemini as primary.
  - If ANY model returns a 429 (quota) or 503 (high demand) error it is
    marked as exhausted for the remainder of the server session.
  - On exhausted, the next model in the priority list is promoted.
  - A non-transient error (e.g. bad request 400) does NOT trigger fallback.
  - Retries with exponential backoff are applied within each model before
    marking it as exhausted.
"""

import os
import time
import threading
from typing import Callable, Any


# ── Priority model list ────────────────────────────────────────────────────────

_PRIORITY_MODELS = [
    {
        "provider": "gemini",
        "model": "gemini-2.5-flash",
        "label": "Gemini 2.5 Flash",
    },
    {
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
        "label": "Groq — LLaMA 3.3 70B Versatile",
    },
    {
        "provider": "groq",
        "model": "llama3-groq-70b-8192-tool-use-preview",
        "label": "Groq — LLaMA 3 Groq 70B Tool-Use",
    },
    {
        "provider": "groq",
        "model": "llama-3.1-8b-instant",
        "label": "Groq — LLaMA 3.1 8B Instant",
    },
]

# ── Errors that trigger fallback (quota / availability) ───────────────────────

_FALLBACK_ERROR_KEYWORDS = [
    "503",
    "429",
    "quota",
    "rate limit",
    "high demand",
    "unavailable",
    "resource_exhausted",
    "too many requests",
    "overloaded",
    "exhausted",
]


def _is_fallback_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(kw in msg for kw in _FALLBACK_ERROR_KEYWORDS)


# ── Shared mutable state (reset on every server start) ────────────────────────

_lock = threading.Lock()
_current_index: int = 0          # index into _PRIORITY_MODELS
_exhausted: set[str] = set()     # model labels that are exhausted


def _current_model_info() -> dict:
    with _lock:
        return _PRIORITY_MODELS[_current_index]


def _mark_exhausted_and_advance(label: str) -> bool:
    """Mark current model exhausted and move to next. Returns False if all exhausted."""
    global _current_index
    with _lock:
        _exhausted.add(label)
        print(f"[LLMRouter] ⚠️  Model '{label}' exhausted. Searching for next available...")
        for i, m in enumerate(_PRIORITY_MODELS):
            if m["label"] not in _exhausted:
                _current_index = i
                print(f"[LLMRouter] ✅ Switched to '{m['label']}'")
                return True
        print("[LLMRouter] ❌ All models exhausted. Cannot proceed.")
        return False


# ── LLM factory ───────────────────────────────────────────────────────────────

def _build_base_llm(model_info: dict, temperature: float = 0.7):
    """Build a raw base LLM from model_info dict."""
    provider = model_info["provider"]
    model_name = model_info["model"]

    if provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=temperature,
        )
    elif provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=model_name,
            groq_api_key=os.getenv("GROQ_API_KEY"),
            temperature=temperature,
        )
    else:
        raise ValueError(f"[LLMRouter] Unknown provider: {provider}")


# ── Core invocation with retry + fallback ─────────────────────────────────────

def invoke_with_fallback(
    build_llm_fn: Callable,           # fn(base_llm) -> bound llm (e.g. .bind_tools / .with_structured_output)
    messages: list,
    temperature: float = 0.7,
    max_retries_per_model: int = 2,
) -> Any:
    """
    Invoke an LLM chain with automatic fallback across the priority model list.

    Args:
        build_llm_fn: A callable that takes a raw base_llm and returns the
                      final bound/structured LLM to invoke. Called fresh each
                      time we switch models.
        messages:     The messages list to pass to .invoke().
        temperature:  Temperature forwarded to the LLM.
        max_retries_per_model: Retry count within each individual model before
                               marking it exhausted and falling back.

    Returns:
        The LLM response object.
    """
    models_tried = 0

    while models_tried < len(_PRIORITY_MODELS):
        model_info = _current_model_info()
        label = model_info["label"]

        if label in _exhausted:
            # This shouldn't happen normally, but guard against stale state.
            if not _mark_exhausted_and_advance(label):
                raise RuntimeError("[LLMRouter] All LLM models are exhausted.")
            models_tried += 1
            continue

        print(f"[LLMRouter] Using model: {label}")
        base_llm = _build_base_llm(model_info, temperature)
        llm = build_llm_fn(base_llm)

        for attempt in range(max_retries_per_model):
            try:
                result = llm.invoke(messages)
                return result
            except Exception as e:
                if _is_fallback_error(e):
                    backoff = 2 ** attempt
                    print(
                        f"[LLMRouter] {label} — transient error (attempt {attempt+1}/"
                        f"{max_retries_per_model}): {e}. "
                        f"{'Retrying in ' + str(backoff) + 's...' if attempt < max_retries_per_model - 1 else 'Marking exhausted.'}"
                    )
                    if attempt < max_retries_per_model - 1:
                        time.sleep(backoff)
                    else:
                        # All retries for this model done → fallback
                        advanced = _mark_exhausted_and_advance(label)
                        if not advanced:
                            raise RuntimeError("[LLMRouter] All LLM models are exhausted.") from e
                        models_tried += 1
                        break  # break retry loop, outer while picks next model
                else:
                    # Non-transient error (bad request, schema mismatch, etc.) — raise immediately
                    print(f"[LLMRouter] {label} — non-transient error: {e}")
                    raise

    raise RuntimeError("[LLMRouter] Exhausted all models without a successful response.")
