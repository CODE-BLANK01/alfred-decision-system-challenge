import { simulateFailure } from '../api.js'

const FAILURE_MODES = [
  {
    id: 'timeout',
    label: 'LLM Timeout',
    description: 'The model takes longer than 15 seconds to respond. The system catches anthropic.APITimeoutError and falls back to confirm_first.',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
  },
  {
    id: 'malformed_output',
    label: 'Malformed Model Output',
    description: 'The model returns invalid JSON. The parser tries 3 extraction strategies, then falls back to confirm_first. The raw garbled output is shown.',
    color: 'var(--orange)',
    bg: 'var(--orange-bg)',
  },
  {
    id: 'missing_context',
    label: 'Missing Critical Context',
    description: 'Action submitted with no conversation history. context_completeness → 0.5, ambiguity_score is elevated. System defaults safe without calling the model.',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
  },
]

const DEMO_REQUEST = {
  conversation_history: [{ role: 'user', content: 'Can you handle that for me?' }],
  proposed_action: 'Send an email reply to confirm the meeting',
}

export default function FailureSimulator({ onResult, loading, setLoading, setError }) {
  async function run(mode) {
    setLoading(true)
    setError(null)
    try {
      const result = await simulateFailure(
        mode,
        DEMO_REQUEST.conversation_history,
        DEMO_REQUEST.proposed_action
      )
      onResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, maxWidth: 560 }}>
        These buttons simulate failure modes without making a real LLM call — so you can see
        exactly how the fallback banner and safe default appear in the pipeline trace.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FAILURE_MODES.map(f => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 16px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, color: f.color }}>
                {f.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {f.description}
              </div>
            </div>
            <button
              onClick={() => run(f.id)}
              disabled={loading}
              style={{
                padding: '7px 16px',
                background: f.bg, color: f.color,
                border: `1px solid ${f.color}44`,
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600, fontSize: 12,
                whiteSpace: 'nowrap',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Simulate →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
