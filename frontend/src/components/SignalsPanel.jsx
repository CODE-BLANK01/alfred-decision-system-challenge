const RISK_MAP = {
  reversibility: { irreversible: 'red', reversible: 'green', read_only: 'green', unknown: 'amber' },
  scope: { local: 'green', external: 'amber', financial: 'red', identity: 'red' },
}

const COLORS = {
  green: { color: 'var(--green)', bg: 'var(--green-bg)' },
  amber: { color: 'var(--amber)', bg: 'var(--amber-bg)' },
  red: { color: 'var(--red)', bg: 'var(--red-bg)' },
  blue: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
  muted: { color: 'var(--text-muted)', bg: 'var(--surface-raised)' },
}

function Chip({ value, colorKey = 'muted', label }) {
  const c = COLORS[colorKey]
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 12, fontWeight: 500,
      padding: '2px 9px', borderRadius: 99,
      background: c.bg, color: c.color,
      border: `1px solid ${c.color}33`,
    }}>
      {label ?? String(value)}
    </span>
  )
}

function ScoreBar({ value, max = 1.0, highIsGood = false }) {
  const pct = Math.round((value / max) * 100)
  const isHigh = value > 0.6
  const color = highIsGood
    ? (isHigh ? 'var(--green)' : 'var(--amber)')
    : (isHigh ? 'var(--red)' : 'var(--green)')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        flex: 1, height: 6, background: 'var(--surface-raised)',
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>
        {value.toFixed(2)}
      </span>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <tr>
      <td style={{ padding: '7px 0', color: 'var(--text-muted)', fontSize: 12, paddingRight: 20, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        {label}
      </td>
      <td style={{ padding: '7px 0', verticalAlign: 'middle' }}>
        {children}
      </td>
    </tr>
  )
}

export default function SignalsPanel({ signals }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tbody>
        <Row label="Reversibility">
          <Chip
            value={signals.reversibility}
            colorKey={RISK_MAP.reversibility[signals.reversibility] || 'muted'}
          />
        </Row>
        <Row label="Scope">
          <Chip
            value={signals.scope}
            colorKey={RISK_MAP.scope[signals.scope] || 'muted'}
          />
        </Row>
        <Row label="Explicitly requested">
          <Chip
            value={signals.user_explicitly_requested}
            colorKey={signals.user_explicitly_requested ? 'green' : 'amber'}
            label={signals.user_explicitly_requested ? 'yes' : 'no'}
          />
        </Row>
        <Row label="Urgency claim">
          <Chip
            value={signals.urgency_claim}
            colorKey={signals.urgency_claim ? 'red' : 'green'}
            label={signals.urgency_claim ? 'detected' : 'none'}
          />
        </Row>
        <Row label="Explicit hold in history">
          <Chip
            value={signals.has_explicit_hold}
            colorKey={signals.has_explicit_hold ? 'red' : 'green'}
            label={signals.has_explicit_hold ? 'YES — user said hold off' : 'no'}
          />
        </Row>
        <Row label="Prior confirmations">
          <span style={{ fontSize: 13, color: 'var(--text)' }}>{signals.prior_confirmations}</span>
        </Row>
        <Row label="Ambiguity score">
          <ScoreBar value={signals.ambiguity_score} highIsGood={false} />
        </Row>
        <Row label="Context completeness">
          <ScoreBar value={signals.context_completeness} highIsGood={true} />
        </Row>
        {signals.adversarial_indicators?.length > 0 && (
          <Row label="Adversarial indicators">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {signals.adversarial_indicators.map(ind => (
                <Chip key={ind} value={ind} colorKey="red" />
              ))}
            </div>
          </Row>
        )}
      </tbody>
    </table>
  )
}
