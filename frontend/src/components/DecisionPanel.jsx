const DECISION_META = {
  execute_silently: {
    label: 'Execute Silently',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green-border)',
    icon: '✓',
    description: 'Action is safe and clear. Execute without telling user.',
  },
  execute_notify: {
    label: 'Execute & Notify',
    color: 'var(--primary)',
    bg: 'var(--primary-bg)',
    border: 'var(--primary-border)',
    icon: '→',
    description: 'Execute now, inform user after.',
  },
  confirm_first: {
    label: 'Confirm First',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    icon: '?',
    description: 'Intent is clear but risk is high. Wait for explicit confirmation.',
  },
  ask_clarification: {
    label: 'Ask Clarification',
    color: 'var(--coral)',
    bg: 'var(--coral-bg)',
    border: 'var(--coral-border)',
    icon: '⋯',
    description: 'Intent or parameters are unresolved. Ask one specific question.',
  },
  refuse_escalate: {
    label: 'Refuse / Escalate',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
    icon: '✕',
    description: 'Adversarial signal, unacceptable risk, or policy violation.',
  },
}

export default function DecisionPanel({ decision, failureMode }) {
  const meta = DECISION_META[decision.decision] || DECISION_META.confirm_first
  const confidencePct = Math.round(decision.confidence * 100)
  const confColor = decision.confidence > 0.7 ? 'var(--green)' : decision.confidence > 0.4 ? 'var(--amber)' : 'var(--red)'

  return (
    <div>
      {failureMode && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
          borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--red)',
          lineHeight: 1.6,
        }}>
          <strong>Safe fallback triggered</strong> — failure mode: <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{failureMode}</code>.{' '}
          System defaulted to <em>confirm_first</em> to avoid irreversible execution.
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px',
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 'var(--radius)',
        marginBottom: 18,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--radius-full)',
          background: `${meta.bg}`, border: `2px solid ${meta.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: meta.color, fontWeight: 700, flexShrink: 0,
        }}>
          {meta.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: meta.color, marginBottom: 3, fontFamily: 'var(--font-display)' }}>
            {meta.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{meta.description}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Reasoning
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {decision.reasoning}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Confidence
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, height: 5, background: 'var(--surface-raised)',
            borderRadius: 'var(--radius-full)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${confidencePct}%`, height: '100%',
              background: confColor,
              transition: 'width 0.4s ease-out',
              borderRadius: 'var(--radius-full)',
            }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36, fontFamily: 'var(--mono)' }}>
            {confidencePct}%
          </span>
        </div>
      </div>

      {decision.suggested_message && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            alfred_ would say
          </div>
          <div style={{
            padding: '11px 14px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid var(--primary)`,
            borderRadius: 'var(--radius-sm)',
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65,
            fontStyle: 'italic',
          }}>
            "{decision.suggested_message}"
          </div>
        </div>
      )}
    </div>
  )
}
