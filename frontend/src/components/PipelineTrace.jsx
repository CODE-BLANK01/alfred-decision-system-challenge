import SignalsPanel from './SignalsPanel.jsx'
import DecisionPanel from './DecisionPanel.jsx'

export default function PipelineTrace({ trace }) {
  return (
    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        paddingBottom: 14, borderBottom: '1px solid var(--border)',
        marginBottom: 4,
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
          Pipeline Trace
        </span>
        <span style={{
          fontSize: 11, color: 'var(--text-dim)',
          fontFamily: 'var(--mono)',
          background: 'var(--surface-raised)',
          padding: '2px 8px', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
        }}>
          {trace.latency_ms}ms
        </span>
        {trace.failure_mode && (
          <span style={{
            fontSize: 11, padding: '2px 9px', borderRadius: 'var(--radius-full)',
            background: 'var(--red-bg)', color: 'var(--red)',
            border: '1px solid var(--red-border)', fontWeight: 600,
            letterSpacing: '0.02em',
          }}>
            ⚠ fallback: {trace.failure_mode}
          </span>
        )}
      </div>

      <Panel label="1 · Computed Signals" defaultOpen>
        <SignalsPanel signals={trace.signals} />
      </Panel>

      <Panel label="2 · System Prompt">
        <Mono text={trace.system_prompt} />
      </Panel>

      <Panel label="3 · User Prompt (sent to model)">
        <Mono text={trace.user_prompt} />
      </Panel>

      <Panel label="4 · Raw Model Output">
        <Mono text={trace.raw_llm_output || '(empty — model was not called due to failure)'} />
      </Panel>

      <Panel label="5 · Decision" defaultOpen>
        <DecisionPanel decision={trace.parsed_decision} failureMode={trace.failure_mode} />
      </Panel>
    </div>
  )
}

function Panel({ label, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      <summary style={{
        padding: '10px 16px',
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        userSelect: 'none',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border-subtle)',
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        <span style={{ fontSize: 9, color: 'var(--text-dim)', opacity: 0.6 }}>▶</span>
        {label}
      </summary>
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </details>
  )
}

function Mono({ text }) {
  return (
    <pre style={{
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--text-secondary)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      lineHeight: 1.7,
      margin: 0,
    }}>
      {text}
    </pre>
  )
}
