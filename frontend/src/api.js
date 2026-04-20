const BASE = import.meta.env.VITE_API_URL || ''

export async function fetchScenarios() {
  const res = await fetch(`${BASE}/api/scenarios`)
  if (!res.ok) throw new Error(`Failed to fetch scenarios: ${res.status}`)
  return res.json()
}

export async function runScenario(scenarioId) {
  const res = await fetch(`${BASE}/api/scenarios/${scenarioId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to run scenario: ${res.status}`)
  return res.json()
}

export async function decide(conversationHistory, proposedAction) {
  const res = await fetch(`${BASE}/api/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_history: conversationHistory,
      proposed_action: proposedAction,
    }),
  })
  if (!res.ok) throw new Error(`Failed to get decision: ${res.status}`)
  return res.json()
}

export async function simulateFailure(failureMode, conversationHistory, proposedAction) {
  const res = await fetch(`${BASE}/api/simulate/${failureMode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_history: conversationHistory,
      proposed_action: proposedAction,
    }),
  })
  if (!res.ok) throw new Error(`Failed to simulate: ${res.status}`)
  return res.json()
}
