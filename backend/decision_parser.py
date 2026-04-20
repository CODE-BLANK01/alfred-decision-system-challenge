import json
import re
from models import DecisionOutput, VALID_DECISIONS

SAFE_FALLBACK = DecisionOutput(
    decision="confirm_first",
    reasoning="Decision layer encountered an error — defaulting to confirm_first as safe behavior to avoid irreversible execution.",
    confidence=0.0,
    suggested_message="I want to make sure before I proceed. Can you confirm you'd like me to do this?",
)

# Closest string matching for slightly malformed decision values
DECISION_ALIASES: dict[str, str] = {
    "execute": "execute_silently",
    "execute_silent": "execute_silently",
    "silent": "execute_silently",
    "execute_and_notify": "execute_notify",
    "execute_then_notify": "execute_notify",
    "notify": "execute_notify",
    "confirm": "confirm_first",
    "ask": "ask_clarification",
    "clarify": "ask_clarification",
    "clarification": "ask_clarification",
    "refuse": "refuse_escalate",
    "escalate": "refuse_escalate",
    "reject": "refuse_escalate",
}


def _extract_json(raw: str) -> dict | None:
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Strip markdown code fences
    stripped = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    stripped = re.sub(r"```\s*$", "", stripped, flags=re.MULTILINE).strip()
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # Extract first {...} block
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


def parse_decision(raw: str) -> tuple[DecisionOutput, str | None]:
    """Returns (decision, failure_mode). failure_mode is None on success."""
    data = _extract_json(raw)
    if data is None:
        return SAFE_FALLBACK, "malformed_output"

    decision_raw = str(data.get("decision", "")).strip().lower()
    if decision_raw not in VALID_DECISIONS:
        decision_raw = DECISION_ALIASES.get(decision_raw, "")
    if decision_raw not in VALID_DECISIONS:
        return SAFE_FALLBACK, "invalid_decision_value"

    try:
        confidence = float(data.get("confidence", 0.5))
        confidence = max(0.0, min(1.0, confidence))
    except (TypeError, ValueError):
        confidence = 0.5

    reasoning = str(data.get("reasoning", "")).strip() or "No reasoning provided."
    suggested_message = data.get("suggested_message") or None
    if isinstance(suggested_message, str):
        suggested_message = suggested_message.strip() or None

    return (
        DecisionOutput(
            decision=decision_raw,  # type: ignore[arg-type]
            reasoning=reasoning,
            confidence=confidence,
            suggested_message=suggested_message,
        ),
        None,
    )
