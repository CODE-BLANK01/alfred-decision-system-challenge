import { Link } from 'react-router-dom'

const DECISIONS = [
  {
    icon: '✓',
    label: 'Execute Silently',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green-border)',
    desc: 'Safe, reversible, clearly requested. No need to bother the user.',
  },
  {
    icon: '→',
    label: 'Execute & Notify',
    color: 'var(--primary)',
    bg: 'var(--primary-bg)',
    border: 'var(--primary-border)',
    desc: 'Action is safe but consequential enough that the user should know it happened.',
  },
  {
    icon: '?',
    label: 'Confirm First',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    desc: 'Intent is clear but the action is irreversible, financial, or external.',
  },
  {
    icon: '⋯',
    label: 'Ask Clarification',
    color: 'var(--coral)',
    bg: 'var(--coral-bg)',
    border: 'var(--coral-border)',
    desc: 'Intent, entity, or key parameters are unresolved. One specific question.',
  },
  {
    icon: '✕',
    label: 'Refuse / Escalate',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
    desc: 'Adversarial signal, policy violation, or unacceptable risk. Hard stop.',
  },
]

const PIPELINE = [
  { step: '01', label: 'Signals', desc: 'Deterministic code extracts reversibility, scope, holds, urgency, and adversarial indicators from the action and conversation history.' },
  { step: '02', label: 'Prompt', desc: 'Signals + full conversation thread are assembled into a structured prompt. The LLM sees pre-computed facts, not raw text alone.' },
  { step: '03', label: 'Judgment', desc: 'Claude weighs the signals and makes the final call — edge cases, conflicting signals, confidence calibration.' },
  { step: '04', label: 'Decision', desc: 'Output is parsed, validated, and returned with the full trace — inputs, signals, raw output, and rationale all visible.' },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        maxWidth: 960, margin: '0 auto', padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22, fontWeight: 900,
          letterSpacing: '-0.5px', color: 'var(--primary)',
        }}>
          alfred_
        </span>
        <Link to="/demo" style={{
          textDecoration: 'none',
          padding: '7px 18px',
          background: 'var(--primary)',
          color: '#18181b',
          borderRadius: 'var(--radius)',
          fontSize: 13, fontWeight: 700,
          boxShadow: 'var(--primary-glow)',
          transition: 'all 0.2s',
        }}>
          Open Demo →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px 64px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-full)', padding: '4px 14px',
          marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.04em' }}>
            Application Challenge Submission
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 6vw, 58px)',
          fontWeight: 900, lineHeight: 1.1,
          letterSpacing: '-1.5px',
          color: 'var(--text)',
          marginBottom: 24, maxWidth: 680,
        }}>
          When should{' '}
          <span style={{ color: 'var(--primary)' }}>alfred_</span>{' '}
          act on your behalf?
        </h1>

        <p style={{
          fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.75,
          maxWidth: 560, marginBottom: 40,
        }}>
          A prototype of alfred_'s Execution Decision Layer — the system that decides
          whether to act silently, confirm, ask a question, or refuse, based on the
          full context of a conversation.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/demo" style={{
            textDecoration: 'none',
            padding: '11px 28px',
            background: 'var(--primary)',
            color: '#18181b',
            borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 700,
            boxShadow: 'var(--primary-glow)',
            transition: 'all 0.2s',
          }}>
            Try the Demo →
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              padding: '11px 24px',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Problem framing */}
      <section style={{
        maxWidth: 960, margin: '0 auto', padding: '0 24px 72px',
      }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-dim)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
          }}>
            The Problem
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 680, marginBottom: 20 }}>
            As alfred_ gains more powerful tools — sending emails, booking flights, making payments —
            the hardest product problem isn't capability. It's <strong style={{ color: 'var(--text)' }}>judgment</strong>:
            knowing when to act and when to stop.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 680 }}>
            This is a <em>contextual conversation decision problem</em>, not a one-shot classification task.
            A "yes" that follows an explicit hold ("wait for legal review") does not resolve the hold.
            The system must reason over the full conversation thread — not just the latest message.
          </p>
        </div>
      </section>

      {/* 5 Decisions */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 72px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Decision Taxonomy
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Five possible outcomes
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {DECISIONS.map(d => (
            <div key={d.label} style={{
              padding: '18px 20px',
              background: 'var(--surface)',
              border: `1px solid ${d.border}`,
              borderRadius: 'var(--radius)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)',
                  background: d.bg, border: `1px solid ${d.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: d.color, fontWeight: 700, flexShrink: 0,
                }}>
                  {d.icon}
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, color: d.color, fontFamily: 'var(--font-display)' }}>
                  {d.label}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {d.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 72px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            How It Works
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Full pipeline, fully transparent
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PIPELINE.map((p, i) => (
            <div key={p.step} style={{
              display: 'flex', gap: 24, alignItems: 'flex-start',
              padding: '20px 24px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                color: 'var(--primary)', minWidth: 24, marginTop: 2,
                letterSpacing: '0.04em',
              }}>
                {p.step}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 5 }}>{p.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: 960, margin: '0 auto', padding: '0 24px 96px',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'var(--primary-bg)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '52px 40px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px',
            color: 'var(--text)', marginBottom: 14,
          }}>
            See it in action
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
            Run the 6 preloaded scenarios, submit custom inputs, or simulate failure modes
            to see how the decision pipeline behaves.
          </p>
          <Link to="/demo" style={{
            textDecoration: 'none',
            display: 'inline-block',
            padding: '12px 32px',
            background: 'var(--primary)',
            color: '#18181b',
            borderRadius: 'var(--radius)',
            fontSize: 15, fontWeight: 700,
            boxShadow: 'var(--primary-glow)',
          }}>
            Open the Demo →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-dim)',
      }}>
        Built for the alfred_ Application Challenge
      </footer>
    </div>
  )
}
