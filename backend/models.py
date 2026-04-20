from typing import Literal, Optional
from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "alfred"]
    content: str
    timestamp: Optional[str] = None


class DecideRequest(BaseModel):
    conversation_history: list[Message]
    proposed_action: str


DecisionType = Literal[
    "execute_silently",
    "execute_notify",
    "confirm_first",
    "ask_clarification",
    "refuse_escalate",
]

VALID_DECISIONS: set[str] = {
    "execute_silently",
    "execute_notify",
    "confirm_first",
    "ask_clarification",
    "refuse_escalate",
}


class SignalSet(BaseModel):
    reversibility: Literal["reversible", "irreversible", "read_only", "unknown"]
    scope: Literal["local", "external", "financial", "identity"]
    user_explicitly_requested: bool
    ambiguity_score: float
    context_completeness: float
    prior_confirmations: int
    urgency_claim: bool
    adversarial_indicators: list[str]
    has_explicit_hold: bool


class DecisionOutput(BaseModel):
    decision: DecisionType
    reasoning: str
    confidence: float
    suggested_message: Optional[str] = None


class PipelineTrace(BaseModel):
    request: DecideRequest
    signals: SignalSet
    system_prompt: str
    user_prompt: str
    raw_llm_output: str
    parsed_decision: DecisionOutput
    failure_mode: Optional[str] = None
    latency_ms: int


class ScenarioSummary(BaseModel):
    id: str
    label: str
    category: str
    description: str
    conversation_history: list[Message]
    proposed_action: str
