const RISK_MAP = {
  reversibility: { irreversible: 'red', reversible: 'green', read_only: 'green', unknown: 'amber' },
  scope: { local: 'green', external: 'amber', financial: 'red', identity: 'red' },
}

const COLORS = {
  green:   { color: 'var(--green)',   bg: 'var(--green-bg)',   border: 'var(--green-border)' },
  amber:   { color: 'var(--amber)',   bg: 'var(--amber-bg)',   border: 'var(--amber-border)' },
  red:     { color: 'var(--red)',     bg: 'var(--red-bg)',     border: 'var(--red-border)' },
  primary: { color: 'var(--primary)', bg: 'var(--primary-bg)', border: 'var(--primary-border)' },
  muted:   { color: 'var(--text-muted)', bg: 'var(--surface-raised)', border: 'var(--border)' },
}

function Chip({ value, colorKey = 'muted', label }) {
  const c = COLORS[colorKey]
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11, fontWeight: 600,
      padding: '2px 9px', borderRadius: 'var(--radius-full)',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.02em',
    }}>
      {label ?? String(value)}
    </span>
  )
}

function ScoreBar({ value, highIsGood = false }) {
  const pct = Math.round(value * 100)
  const isHigh = value > 0.6
  const color = highIsGood
    ? (isHigh ? 'var(--green)' : 'var(--amber)')
    : (isHigh ? 'var(--red)' : 'var(--green)')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        flex: 1, height: 5, background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-full)', overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right', fontFamily: 'var(--mono)' }}>
        {value.toFixed(2)}
      </span>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <tr>
      <td style={{
        padding: '8px 0', color: 'var(--text-dim)',
        fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
        paddingRight: 24, whiteSpace: 'nowrap', verticalAlign: 'middle', width: 180,
      }}>
        {label}
      </td>
      <td style={{ padding: '8px 0', verticalAlign: 'middle' }}>
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
          <Chip value={signals.reversibility} colorKey={RISK_MAP.reversibility[signals.reversibility] || 'muted'} />
        </Row>
        <Row label="Scope">
          <Chip value={signals.scope} colorKey={RISK_MAP.scope[signals.scope] || 'muted'} />
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
        <Row label="Explicit hold">
          <Chip
            value={signals.has_explicit_hold}
            colorKey={signals.has_explicit_hold ? 'red' : 'green'}
            label={signals.has_explicit_hold ? 'YES — hold in history' : 'none'}
          />
        </Row>
        <Row label="Prior confirmations">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--mono)' }}>
            {signals.prior_confirmations}
          </span>
        </Row>
        <Row label="Ambiguity score">
          <ScoreBar value={signals.ambiguity_score} highIsGood={false} />
        </Row>
        <Row label="Context completeness">
          <ScoreBar value={signals.context_completeness} highIsGood={true} />
        </Row>
        {signals.adversarial_indicators?.length > 0 && (
          <Row label="Adversarial">
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
