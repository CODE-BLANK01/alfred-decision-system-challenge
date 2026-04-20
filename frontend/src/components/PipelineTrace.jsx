import SignalsPanel from './SignalsPanel.jsx'
import DecisionPanel from './DecisionPanel.jsx'

export default function PipelineTrace({ trace }) {
  return (
    <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        paddingBottom: 12, borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Pipeline Trace</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{trace.latency_ms}ms</span>
        {trace.failure_mode && (
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 99,
            background: 'var(--red-bg)', color: 'var(--red)',
            border: '1px solid var(--red)33', fontWeight: 500,
          }}>
            ⚠ Fallback: {trace.failure_mode}
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
        padding: '10px 14px',
        fontWeight: 500,
        fontSize: 13,
        cursor: 'pointer',
        userSelect: 'none',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border-subtle)',
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>▶</span>
        {label}
      </summary>
      <div style={{ padding: '14px' }}>
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
      color: 'var(--text)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      lineHeight: 1.6,
      margin: 0,
    }}>
      {text}
    </pre>
  )
}
