const DECISION_META = {
  execute_silently: {
    label: 'Execute Silently',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    icon: '✓',
    description: 'Action is safe and clear. Execute without telling user.',
  },
  execute_notify: {
    label: 'Execute & Notify',
    color: 'var(--blue)',
    bg: 'var(--blue-bg)',
    icon: '→',
    description: 'Execute now, inform user after.',
  },
  confirm_first: {
    label: 'Confirm First',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    icon: '?',
    description: 'Intent is clear but risk is high. Wait for explicit confirmation.',
  },
  ask_clarification: {
    label: 'Ask Clarification',
    color: 'var(--orange)',
    bg: 'var(--orange-bg)',
    icon: '⋯',
    description: 'Intent or parameters are unresolved. Ask one specific question.',
  },
  refuse_escalate: {
    label: 'Refuse / Escalate',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    icon: '✕',
    description: 'Adversarial signal, unacceptable risk, or policy violation.',
  },
}

export default function DecisionPanel({ decision, failureMode }) {
  const meta = DECISION_META[decision.decision] || DECISION_META.confirm_first
  const confidencePct = Math.round(decision.confidence * 100)

  return (
    <div>
      {failureMode && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: 'var(--red-bg)', border: '1px solid var(--red)33',
          borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--red)',
        }}>
          <strong>Safe fallback triggered</strong> — failure mode: <code>{failureMode}</code>.
          System defaulted to <em>confirm_first</em> to avoid irreversible execution.
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 16px',
        background: meta.bg, border: `1px solid ${meta.color}33`,
        borderRadius: 'var(--radius)', marginBottom: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: `${meta.color}22`, border: `2px solid ${meta.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: meta.color, fontWeight: 700, flexShrink: 0,
        }}>
          {meta.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: meta.color, marginBottom: 2 }}>
            {meta.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{meta.description}</div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Reasoning
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
          {decision.reasoning}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Confidence
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, height: 6, background: 'var(--surface-raised)',
            borderRadius: 99, overflow: 'hidden',
          }}>
            <div style={{
              width: `${confidencePct}%`, height: '100%',
              background: decision.confidence > 0.7 ? 'var(--green)' : decision.confidence > 0.4 ? 'var(--amber)' : 'var(--red)',
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36 }}>
            {confidencePct}%
          </span>
        </div>
      </div>

      {decision.suggested_message && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            alfred_ would say
          </div>
          <div style={{
            padding: '10px 14px',
            background: 'var(--surface-raised)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13, color: 'var(--text)', lineHeight: 1.6,
            fontStyle: 'italic',
          }}>
            "{decision.suggested_message}"
          </div>
        </div>
      )}
    </div>
  )
}
