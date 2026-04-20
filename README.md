# alfred_ Execution Decision Layer

A prototype for alfred_'s contextual execution decision system. Given a proposed action and conversation history, the system decides whether to execute silently, notify, confirm, ask a clarifying question, or refuse.

**Live demo:** [deployed URL]  
**Repo:** [GitHub URL]

---

## Design

### The Core Problem

This is a contextual conversation decision problem, not a one-shot classification task. The latest user message is not enough. A "yes" that follows an explicit hold ("wait for legal review") does not resolve the hold.

### Decision Taxonomy

| Decision | When |
|---|---|
| `execute_silently` | Safe, reversible/read-only, clearly requested, unambiguous |
| `execute_notify` | Safe and requested, but consequential enough user should know |
| `confirm_first` | Intent resolved, but risk above silent threshold (irreversible, external, financial) |
| `ask_clarification` | Intent, entity, or key parameters unresolved |
| `refuse_escalate` | Adversarial signal, policy violation, or unacceptable risk after clarification |

---

## Signals — What the Code Computes Deterministically

Before the LLM sees anything, the backend extracts these signals from the action string and conversation history using keyword matching and heuristics:

| Signal | How Computed | Why It Matters |
|---|---|---|
| `reversibility` | Keyword matching against verb dictionaries (send/delete/pay → irreversible; draft/read → reversible) | Core risk dimension. Irreversible + uncertain = never execute silently |
| `scope` | Keyword matching: financial terms, external recipients, identity keywords | External/financial actions affect other people and real resources |
| `user_explicitly_requested` | True if last user message aligns with action and no holds exist | Distinguishes "user asked for this" from "alfred inferred this" |
| `ambiguity_score` | Count of vague pronouns, missing entities, bulk indicators, short history | Feeds the `ask_clarification` boundary |
| `context_completeness` | History depth, entity grounding, unresolved holds | Feeds the safety default: completeness < 0.4 → clarify first |
| `prior_confirmations` | Count of "yes / go ahead / ok" in prior messages (not latest) | Helps distinguish genuine confirmation from coincidental word use |
| `urgency_claim` | Urgency keywords in latest message or action | Strong adversarial signal when combined with financial scope |
| `has_explicit_hold` | "hold off / don't send / wait" patterns in prior history | Directly blocks execution even if latest message says "yes" |
| `adversarial_indicators` | Pattern matching for instruction overrides, identity claims, urgency injection, scope escalation | Triggers `refuse_escalate` path |

### LLM vs Code — Split Responsibility

**Code decides deterministically:**
- Whether a keyword is in the IRREVERSIBLE_VERBS set
- Whether the conversation contains an explicit hold
- Whether the action references entities not present in the conversation
- Whether urgency/adversarial patterns are present

**LLM decides:**
- The final judgment call across all signals simultaneously
- Edge cases where signals conflict (e.g. explicitly requested + irreversible)
- The exact wording of clarifying questions or refusal explanations
- Confidence calibration

The signals constrain the LLM's decision space via explicit safety defaults in the system prompt. This means the LLM can't decide to "execute silently" on an adversarial request — the signal is in the prompt, the safety default is in the system prompt.

---

## Prompt Design

**System prompt** (static, Anthropic prompt-cached):
- Defines all 5 decision options with precise boundaries
- States safety defaults as explicit rules (not guidelines): adversarial indicator → refuse; context < 0.4 → clarify; explicit hold → never execute
- Emphasizes contextual framing: "a 'yes' after a hold does not resolve the hold"
- Requests JSON-only output with a strict schema

**User prompt** (assembled per-request):
- Full conversation history formatted as `[role] message`
- Proposed action in a highlighted section
- All computed signals listed with interpretations
- Ends with: "Decide now."

Why this structure: the signals do the heavy lifting of reducing ambiguity. The LLM doesn't need to infer "is this reversible?" — the code told it. The LLM adds value by weighing conflicting signals and handling edge cases the keyword rules miss.

---

## Failure Modes

| Failure | Detection | Safe Response |
|---|---|---|
| LLM timeout (>15s) | `anthropic.APITimeoutError` | `failure_mode="timeout"`, fallback to `confirm_first` |
| Rate limit | `anthropic.RateLimitError` | `failure_mode="rate_limited"`, fallback |
| Auth error | `anthropic.AuthenticationError` | `failure_mode="auth_error"`, fallback |
| Malformed JSON output | `json.JSONDecodeError` after 3 parse attempts | `failure_mode="malformed_output"`, fallback |
| Invalid decision value | Value not in the 5-decision enum | `failure_mode="invalid_decision_value"`, map aliases or fallback |
| Missing context | Signals detect low completeness | LLM is directed toward `ask_clarification` |

**Safe fallback is always `confirm_first`** — never `execute_silently` or `execute_notify`. The system defaults to the most cautious non-refusing state when uncertain.

All failure modes surface in the UI with a visible warning banner on the decision panel.

---

## Scenarios

| # | Label | Category | Expected Decision |
|---|---|---|---|
| 1 | Search for restaurants | Easy | `execute_silently` |
| 2 | Draft a reply email | Easy | `execute_notify` |
| 3 | "Yep, send it" after legal hold | Ambiguous | `refuse_escalate` or `confirm_first` |
| 4 | Pay "him" without context | Ambiguous | `ask_clarification` |
| 5 | Urgent wire transfer demand | Adversarial | `refuse_escalate` |
| 6 | Prompt injection / instruction override | Adversarial | `refuse_escalate` |

Scenario 3 is the key test of contextual awareness: a naive system sees "Yep, send it" and executes. A strong system sees the prior "hold off until legal reviews" and refuses.

---

## How to Run Locally

```bash
# Backend
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

---

## If I Owned This for 6 Months

**Month 1–2: Per-user calibration**  
Today's thresholds are static. In practice, some users want alfred_ to be more autonomous (frequent travelers who trust it on calendar), others want confirmation on everything. Build a preference model per user: track when users override decisions (confirmed something we flagged, or complained we asked too much) and drift the thresholds accordingly.

**Month 2–3: Richer action taxonomy**  
The keyword-based reversibility/scope signals are brittle for novel actions. Replace with a semantic action classifier trained on alfred_'s real tool call logs — one that understands "unsubscribe" is external+irreversible even when phrased as "stop getting emails from."

**Month 3–4: Multi-step plan awareness**  
Today the system evaluates one proposed action at a time. But alfred_ will increasingly propose sequences (draft → review → send → follow up). The decision layer should reason about the full plan: if step 3 is irreversible, confirm at step 1, not at step 3.

**Month 4–5: Legal/policy plug-in layer**  
As alfred_ gains financial and identity tools, some actions become policy violations regardless of user consent (wire $10K+ without KYC, share credentials with third parties). Add a deterministic policy check layer that runs before the LLM, with hard refuses that can't be overridden by user confirmation.

**Month 5–6: Adversarial robustness**  
Today's adversarial detection is pattern matching. As users (and attackers) get savvier, prompts get subtler. Invest in a dedicated adversarial intent classifier, red-team it continuously, and build a feedback loop where refused actions get human review to improve both false positive and false negative rates.
