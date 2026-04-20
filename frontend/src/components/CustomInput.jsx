import { useState } from 'react'

export default function CustomInput({ onSubmit, loading }) {
  const [history, setHistory] = useState([{ role: 'user', content: '' }])
  const [action, setAction] = useState('')

  function addMessage() {
    const lastRole = history[history.length - 1]?.role
    setHistory([...history, { role: lastRole === 'user' ? 'alfred' : 'user', content: '' }])
  }

  function updateMessage(i, field, value) {
    const updated = history.map((m, idx) => idx === i ? { ...m, [field]: value } : m)
    setHistory(updated)
  }

  function removeMessage(i) {
    setHistory(history.filter((_, idx) => idx !== i))
  }

  function handleSubmit() {
    const filtered = history.filter(m => m.content.trim())
    if (!action.trim()) return
    onSubmit(filtered, action.trim())
  }

  function handleReset() {
    setHistory([{ role: 'user', content: '' }])
    setAction('')
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Conversation History
          </label>
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)',
              padding: '3px 10px', fontSize: 11, fontWeight: 500,
            }}
          >
            Reset fields
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <select
                value={msg.role}
                onChange={e => updateMessage(i, 'role', e.target.value)}
                style={selectStyle}
              >
                <option value="user">user</option>
                <option value="alfred">alfred</option>
              </select>
              <textarea
                value={msg.content}
                onChange={e => updateMessage(i, 'content', e.target.value)}
                placeholder="Message content…"
                rows={2}
                style={{ ...inputStyle, flex: 1, resize: 'vertical', fontFamily: 'var(--font)' }}
              />
              <button
                onClick={() => removeMessage(i)}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', borderRadius: 4, padding: '4px 8px', fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addMessage}
          style={{
            marginTop: 8, background: 'none', border: '1px dashed var(--border)',
            color: 'var(--text-muted)', borderRadius: 'var(--radius)',
            padding: '6px 14px', fontSize: 12, width: '100%',
          }}
        >
          + Add message
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Proposed Action
        </label>
        <textarea
          value={action}
          onChange={e => setAction(e.target.value)}
          placeholder="What does alfred_ want to do? e.g. 'Send the email to John confirming the meeting at 3pm'"
          rows={2}
          style={{ ...inputStyle, marginTop: 8, width: '100%', resize: 'vertical', fontFamily: 'var(--font)' }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !action.trim()}
        style={{
          padding: '9px 24px',
          background: loading || !action.trim() ? 'var(--surface-raised)' : 'var(--primary)',
          color: loading || !action.trim() ? 'var(--text-muted)' : '#18181b',
          border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 700, fontSize: 13,
          opacity: loading ? 0.6 : 1,
          boxShadow: loading || !action.trim() ? 'none' : 'var(--primary-glow)',
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Analyzing…' : 'Run Decision Pipeline →'}
      </button>
    </div>
  )
}

const inputStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  padding: '8px 10px',
  fontSize: 13,
  outline: 'none',
}

const selectStyle = {
  ...inputStyle,
  width: 80,
  padding: '8px 6px',
}
