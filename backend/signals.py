import re
from models import Message, SignalSet

IRREVERSIBLE_VERBS = {
    "send", "post", "publish", "delete", "remove", "transfer", "pay",
    "buy", "purchase", "wire", "cancel", "unsubscribe", "deploy",
    "push", "charge", "book", "order", "submit", "apply", "sign",
    "reply", "respond", "export", "share", "forward", "accept",
    "confirm", "finalize", "approve", "commit",
}

READ_ONLY_VERBS = {
    "read", "view", "show", "list", "search", "find", "check",
    "get", "fetch", "lookup", "display", "summarize", "preview",
}

REVERSIBLE_VERBS = {
    "draft", "compose", "create", "edit", "save", "write",
}

FINANCIAL_KEYWORDS = {
    "pay", "payment", "transfer", "wire", "venmo", "zelle", "paypal",
    "charge", "bank", "invoice", "money", "cash", "usd", "dollar",
    "fee", "bill", "reimburse", "refund", "purchase", "buy", "order",
}

IDENTITY_KEYWORDS = {
    "password", "credential", "credentials", "login", "ssn", "social security",
    "passport", "auth", "private key",
}

EXTERNAL_KEYWORDS = {
    "send", "email", "text", "message", "sms", "tweet", "post",
    "publish", "share", "forward", "reply", "respond", "notify",
    "api", "webhook", "export", "upload",
}

EXPLICIT_HOLD_PATTERNS = [
    r"\bhold\s+off\b", r"\bdon'?t\s+send\b", r"\bwait\b",
    r"\bnot\s+yet\b", r"\bstop\b", r"\bcancel\b", r"\bpause\b",
    r"\bhold\s+on\b", r"\blet me\s+(check|review|think|confirm)\b",
    r"\bneed\s+to\s+(review|check|confirm)\b",
    r"\buntil\s+(legal|review|approval|he|she|they)\b",
]

CONFIRMATION_PATTERNS = [
    r"\byes\b", r"\byep\b", r"\byeah\b", r"\bgo\s+ahead\b",
    r"\bok(ay)?\b", r"\bconfirmed?\b", r"\bdo\s+it\b",
    r"\bsure\b", r"\bplease\s+do\b", r"\bsend\s+it\b",
    r"\bapproved?\b", r"\bfine\b",
]

URGENCY_PATTERNS = [
    r"\burgent\b", r"\basap\b", r"\bimmediately\b", r"\bright\s+now\b",
    r"\bdon'?t\s+(ask|wait|delay)\b", r"\bno\s+time\b",
    r"\bbefore\s+it'?s?\s+too\s+late\b", r"\bemergency\b",
    r"\bcritical\b",
]

ADVERSARIAL_PATTERNS = {
    "instruction_override": [
        r"ignore\s+(your\s+)?(previous\s+)?instructions",
        r"new\s+instructions",
        r"as\s+an\s+ai\s+you\s+(must|should|have\s+to)",
        r"forget\s+(everything|all)\s+(you|your)",
        r"you\s+are\s+now\s+\w+",
        r"\bdan\b",
    ],
    "urgency_injection": [
        r"\burgent\b.*\bdon'?t\s+(ask|question|verify)\b",
        r"\bemergency\b.*\bimmediately\b",
        r"\bno\s+questions?\b",
        r"\bdon'?t\s+tell\b",
    ],
    "identity_claim": [
        r"\bi'?m\s+(your\s+)?\bboss\b",
        r"\bthis\s+is\s+(from\s+)?(support|management|admin|ceo|cto)\b",
        r"\bacting\s+on\s+behalf\s+of\b",
    ],
    "scope_escalation": [],
}


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"\b\w+\b", text.lower()))


def _matches_any(text: str, patterns: list[str]) -> bool:
    low = text.lower()
    return any(re.search(p, low) for p in patterns)


def compute_signals(
    proposed_action: str, conversation_history: list[Message]
) -> SignalSet:
    action_tokens = _tokenize(proposed_action)
    full_text = " ".join(m.content for m in conversation_history)
    user_messages = [m for m in conversation_history if m.role == "user"]
    alfred_messages = [m for m in conversation_history if m.role == "alfred"]
    latest_user = user_messages[-1].content if user_messages else ""

    # Reversibility
    has_irreversible = bool(action_tokens & IRREVERSIBLE_VERBS)
    has_read_only = bool(action_tokens & READ_ONLY_VERBS)
    has_reversible = bool(action_tokens & REVERSIBLE_VERBS)

    if has_read_only and not has_irreversible:
        reversibility = "read_only"
    elif has_irreversible:
        reversibility = "irreversible"
    elif has_reversible:
        reversibility = "reversible"
    else:
        reversibility = "unknown"

    # Scope
    if action_tokens & IDENTITY_KEYWORDS or _matches_any(proposed_action, [r"password|credential|login"]):
        scope = "identity"
    elif action_tokens & FINANCIAL_KEYWORDS:
        scope = "financial"
    elif action_tokens & EXTERNAL_KEYWORDS:
        scope = "external"
    else:
        scope = "local"

    # Explicit hold in history (excluding latest user message)
    prior_history_text = " ".join(m.content for m in conversation_history[:-1])
    has_explicit_hold = _matches_any(prior_history_text, EXPLICIT_HOLD_PATTERNS)

    # Ambiguity score
    ambiguity = 0.0
    vague_pronouns = re.findall(r"\b(it|him|her|them|that|those|this|these)\b", proposed_action.lower())
    if vague_pronouns:
        ambiguity += 0.25
    if not conversation_history:
        ambiguity += 0.3
    elif len(conversation_history) < 2:
        ambiguity += 0.15
    # Check for entities in action not grounded in history
    amounts = re.findall(r"\$[\d,]+|\d+\s*(?:dollars?|usd)", proposed_action.lower())
    if amounts and not any(a in full_text.lower() for a in amounts):
        ambiguity += 0.2
    # Scope far broader than conversation suggests
    bulk_indicators = re.findall(r"\ball\b|\beveryone\b|\bevery\b|\bmass\b", proposed_action.lower())
    if bulk_indicators and len(conversation_history) < 3:
        ambiguity += 0.2
    ambiguity = min(1.0, ambiguity)

    # Context completeness
    context = 1.0
    if not conversation_history:
        context -= 0.5
    elif len(conversation_history) < 2:
        context -= 0.3
    if has_explicit_hold:
        context -= 0.2
    if reversibility == "irreversible":
        prior_confirm = sum(
            1 for m in conversation_history[:-1]
            if m.role == "user" and _matches_any(m.content, CONFIRMATION_PATTERNS)
        )
        if prior_confirm == 0:
            context -= 0.15
    context = max(0.0, context)

    # User explicitly requested
    user_explicitly_requested = (
        bool(user_messages)
        and not has_explicit_hold
        and ambiguity < 0.5
    )

    # Prior confirmations (excluding last user message)
    prior_confirmations = sum(
        1 for m in conversation_history[:-1]
        if m.role == "user" and _matches_any(m.content, CONFIRMATION_PATTERNS)
    )

    # Urgency claim
    urgency_claim = _matches_any(latest_user, URGENCY_PATTERNS) or _matches_any(
        proposed_action, URGENCY_PATTERNS
    )

    # Adversarial indicators
    combined = full_text + " " + proposed_action
    adversarial_indicators: list[str] = []
    for indicator, patterns in ADVERSARIAL_PATTERNS.items():
        if patterns and _matches_any(combined, patterns):
            adversarial_indicators.append(indicator)

    # Scope escalation: action is external/financial but conversation shows no such intent
    if scope in ("financial", "identity", "external"):
        conv_tokens = _tokenize(full_text)
        if not (conv_tokens & (FINANCIAL_KEYWORDS | EXTERNAL_KEYWORDS | IDENTITY_KEYWORDS)):
            adversarial_indicators.append("scope_escalation")

    if urgency_claim and scope == "financial":
        if "urgency_injection" not in adversarial_indicators:
            adversarial_indicators.append("urgency_injection")

    return SignalSet(
        reversibility=reversibility,
        scope=scope,
        user_explicitly_requested=user_explicitly_requested,
        ambiguity_score=round(ambiguity, 2),
        context_completeness=round(context, 2),
        prior_confirmations=prior_confirmations,
        urgency_claim=urgency_claim,
        adversarial_indicators=adversarial_indicators,
        has_explicit_hold=has_explicit_hold,
    )
