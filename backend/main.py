import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import DecideRequest, PipelineTrace, ScenarioSummary
from llm_client import decide, decide_simulated
from scenarios import SCENARIOS, SCENARIOS_BY_ID
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="alfred_ Decision Layer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/scenarios", response_model=list[ScenarioSummary])
def get_scenarios():
    return SCENARIOS


@app.post("/api/decide", response_model=PipelineTrace)
def make_decision(request: DecideRequest):
    return decide(request)


@app.post("/api/scenarios/{scenario_id}/run", response_model=PipelineTrace)
def run_scenario(scenario_id: str):
    scenario = SCENARIOS_BY_ID.get(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    request = DecideRequest(
        conversation_history=scenario.conversation_history,
        proposed_action=scenario.proposed_action,
    )
    return decide(request)


@app.post("/api/simulate/{failure_mode}", response_model=PipelineTrace)
def simulate_failure(failure_mode: str, request: DecideRequest):
    """Demonstrate failure handling without a real LLM call."""
    valid = {"timeout", "malformed_output", "missing_context"}
    if failure_mode not in valid:
        raise HTTPException(status_code=400, detail=f"failure_mode must be one of {valid}")
    return decide_simulated(request, failure_mode)
