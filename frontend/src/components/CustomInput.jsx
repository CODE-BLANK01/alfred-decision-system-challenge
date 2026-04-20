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

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
          Conversation History
        </label>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
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
          padding: '9px 22px',
          background: loading || !action.trim() ? 'var(--surface-raised)' : 'var(--blue)',
          color: loading || !action.trim() ? 'var(--text-muted)' : '#fff',
          border: 'none', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: 13,
          opacity: loading ? 0.7 : 1,
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
