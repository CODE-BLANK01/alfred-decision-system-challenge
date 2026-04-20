import os
import time
import anthropic
from models import DecideRequest, PipelineTrace, SignalSet, DecisionOutput
from signals import compute_signals
from prompt_builder import SYSTEM_PROMPT, build_user_prompt
from decision_parser import parse_decision, SAFE_FALLBACK

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
            timeout=15.0,
        )
    return _client


def _make_safe_trace(
    request: DecideRequest,
    signals: SignalSet,
    user_prompt: str,
    raw_output: str,
    failure_mode: str,
    latency_ms: int,
    decision: DecisionOutput | None = None,
) -> PipelineTrace:
    return PipelineTrace(
        request=request,
        signals=signals,
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        raw_llm_output=raw_output,
        parsed_decision=decision or SAFE_FALLBACK,
        failure_mode=failure_mode,
        latency_ms=latency_ms,
    )


def decide_simulated(request: DecideRequest, failure_mode: str) -> PipelineTrace:
    """Returns a trace with a simulated failure — no LLM call made. For UI demonstration."""
    start = time.monotonic()
    signals = compute_signals(request.proposed_action, request.conversation_history)
    user_prompt = build_user_prompt(request.proposed_action, request.conversation_history, signals)

    SIMULATED_RAWS = {
        "timeout": "",
        "malformed_output": 'Sure! I think you should just { decision: yes_do_it, "confidence: high }',
        "missing_context": "",
    }
    raw = SIMULATED_RAWS.get(failure_mode, "")
    elapsed = int((time.monotonic() - start) * 1000)
    return _make_safe_trace(request, signals, user_prompt, raw, failure_mode, elapsed)


def decide(request: DecideRequest) -> PipelineTrace:
    start = time.monotonic()

    signals = compute_signals(request.proposed_action, request.conversation_history)
    user_prompt = build_user_prompt(
        request.proposed_action, request.conversation_history, signals
    )

    client = _get_client()
    raw_output = ""
    failure_mode: str | None = None

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": user_prompt}],
        )
        raw_output = response.content[0].text if response.content else ""
    except anthropic.APITimeoutError:
        elapsed = int((time.monotonic() - start) * 1000)
        return _make_safe_trace(
            request, signals, user_prompt, "", "timeout", elapsed
        )
    except anthropic.RateLimitError:
        elapsed = int((time.monotonic() - start) * 1000)
        return _make_safe_trace(
            request, signals, user_prompt, "", "rate_limited", elapsed
        )
    except anthropic.AuthenticationError:
        elapsed = int((time.monotonic() - start) * 1000)
        return _make_safe_trace(
            request, signals, user_prompt, "", "auth_error", elapsed
        )
    except anthropic.APIError as exc:
        elapsed = int((time.monotonic() - start) * 1000)
        return _make_safe_trace(
            request, signals, user_prompt, str(exc), "api_error", elapsed
        )
    except (TypeError, ValueError) as exc:
        # Raised when API key is missing or malformed before request is sent
        elapsed = int((time.monotonic() - start) * 1000)
        return _make_safe_trace(
            request, signals, user_prompt, str(exc), "auth_error", elapsed
        )

    parsed_decision, parse_failure = parse_decision(raw_output)
    elapsed = int((time.monotonic() - start) * 1000)

    return PipelineTrace(
        request=request,
        signals=signals,
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        raw_llm_output=raw_output,
        parsed_decision=parsed_decision,
        failure_mode=parse_failure,
        latency_ms=elapsed,
    )
