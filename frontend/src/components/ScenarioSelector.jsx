const CATEGORY_STYLES = {
  easy:        { color: 'var(--green)',   bg: 'var(--green-bg)',   border: 'var(--green-border)' },
  ambiguous:   { color: 'var(--amber)',   bg: 'var(--amber-bg)',   border: 'var(--amber-border)' },
  adversarial: { color: 'var(--red)',     bg: 'var(--red-bg)',     border: 'var(--red-border)' },
}

export default function ScenarioSelector({ scenarios, selectedId, onSelect, onRun, loading, selectedScenario }) {
  if (!scenarios.length) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading scenarios…</div>
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8, marginBottom: 20 }}>
        {scenarios.map(s => {
          const cat = CATEGORY_STYLES[s.category] || CATEGORY_STYLES.easy
          const isSelected = s.id === selectedId
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius)',
                border: `1px solid ${isSelected ? 'var(--primary-border)' : 'var(--border)'}`,
                background: isSelected ? 'var(--primary-bg)' : 'var(--surface)',
                color: 'var(--text)',
                textAlign: 'left',
                transition: 'all 0.15s',
                cursor: 'pointer',
                boxShadow: isSelected ? 'var(--primary-glow)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: cat.color, background: cat.bg, padding: '2px 7px',
                  borderRadius: 'var(--radius-full)', border: `1px solid ${cat.border}`,
                }}>
                  {s.category}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: isSelected ? 'var(--primary-light)' : 'var(--text)' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{s.description}</div>
            </button>
          )
        })}
      </div>

      {selectedScenario && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          marginBottom: 16,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            fontSize: 11, color: 'var(--text-dim)', marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
          }}>
            Conversation History
          </div>
          {selectedScenario.conversation_history.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 'var(--radius-full)',
                background: m.role === 'user' ? 'var(--primary-bg)' : 'var(--surface-raised)',
                color: m.role === 'user' ? 'var(--primary)' : 'var(--text-muted)',
                border: m.role === 'user' ? '1px solid var(--primary-border)' : '1px solid var(--border)',
                whiteSpace: 'nowrap', marginTop: 1,
              }}>
                {m.role}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{m.content}</span>
            </div>
          ))}

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              fontSize: 11, color: 'var(--text-dim)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
            }}>
              Proposed Action
            </div>
            <div style={{
              fontSize: 13, fontFamily: 'var(--mono)',
              color: 'var(--primary-light)',
              background: 'var(--primary-bg)',
              padding: '9px 13px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--primary-border)',
              lineHeight: 1.55,
            }}>
              {selectedScenario.proposed_action}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onRun}
        disabled={loading || !selectedId}
        style={{
          padding: '9px 24px',
          background: loading ? 'var(--surface-raised)' : 'var(--primary)',
          color: loading ? 'var(--text-muted)' : '#18181b',
          border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 700, fontSize: 13,
          transition: 'all 0.2s',
          opacity: loading ? 0.6 : 1,
          boxShadow: loading ? 'none' : 'var(--primary-glow)',
          letterSpacing: '0.01em',
        }}
      >
        {loading ? 'Analyzing…' : 'Run Decision Pipeline →'}
      </button>
    </div>
  )
}
