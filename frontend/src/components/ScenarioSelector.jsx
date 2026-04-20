const CATEGORY_COLORS = {
  easy: { color: 'var(--green)', bg: 'var(--green-bg)' },
  ambiguous: { color: 'var(--amber)', bg: 'var(--amber-bg)' },
  adversarial: { color: 'var(--red)', bg: 'var(--red-bg)' },
}

export default function ScenarioSelector({ scenarios, selectedId, onSelect, onRun, loading, selectedScenario }) {
  if (!scenarios.length) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading scenarios…</div>
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 20 }}>
        {scenarios.map(s => {
          const cat = CATEGORY_COLORS[s.category] || CATEGORY_COLORS.easy
          const isSelected = s.id === selectedId
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius)',
                border: `1px solid ${isSelected ? cat.color : 'var(--border)'}`,
                background: isSelected ? cat.bg : 'var(--surface)',
                color: 'var(--text)',
                textAlign: 'left',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: cat.color, background: cat.bg, padding: '2px 7px',
                  borderRadius: 99, border: `1px solid ${cat.color}33`,
                }}>
                  {s.category}
                </span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.description}</div>
            </button>
          )
        })}
      </div>

      {selectedScenario && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
            Conversation History
          </div>
          {selectedScenario.conversation_history.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                background: m.role === 'user' ? 'var(--blue-bg)' : 'var(--surface-raised)',
                color: m.role === 'user' ? 'var(--blue)' : 'var(--text-muted)',
                whiteSpace: 'nowrap', marginTop: 1,
              }}>
                {m.role}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{m.content}</span>
            </div>
          ))}

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
              Proposed Action
            </div>
            <div style={{
              fontSize: 13, fontFamily: 'var(--mono)',
              color: 'var(--amber)', background: 'var(--amber-bg)',
              padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--amber)33',
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
          padding: '9px 22px',
          background: loading ? 'var(--surface-raised)' : 'var(--blue)',
          color: loading ? 'var(--text-muted)' : '#fff',
          border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: 13,
          transition: 'all 0.15s',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Analyzing…' : 'Run Decision Pipeline →'}
      </button>
    </div>
  )
}
