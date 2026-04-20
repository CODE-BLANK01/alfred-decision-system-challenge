import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchScenarios, runScenario, decide } from '../api.js'
import ScenarioSelector from '../components/ScenarioSelector.jsx'
import CustomInput from '../components/CustomInput.jsx'
import PipelineTrace from '../components/PipelineTrace.jsx'
import FailureSimulator from '../components/FailureSimulator.jsx'

const TABS = ['scenarios', 'custom', 'failures']

const style = document.createElement('style')
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
document.head.appendChild(style)

export default function Demo() {
  const [tab, setTab] = useState('scenarios')
  const [scenarios, setScenarios] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [trace, setTrace] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchScenarios()
      .then(data => {
        setScenarios(data)
        setSelectedId(data[0]?.id ?? null)
      })
      .catch(err => setError(err.message))
  }, [])

  async function handleRunScenario() {
    if (!selectedId) return
    setLoading(true)
    setTrace(null)
    setError(null)
    try {
      const result = await runScenario(selectedId)
      setTrace(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCustomSubmit(history, action) {
    setLoading(true)
    setTrace(null)
    setError(null)
    try {
      const result = await decide(history, action)
      setTrace(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedScenario = scenarios.find(s => s.id === selectedId)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, fontWeight: 900,
              letterSpacing: '-0.5px',
              color: 'var(--primary)',
            }}>
              alfred_
            </span>
          </Link>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            padding: '3px 10px', borderRadius: 'var(--radius-full)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Decision Layer
          </span>
        </div>
        <Link to="/" style={{
          textDecoration: 'none', fontSize: 12,
          color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          ← Back
        </Link>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 28,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 3, width: 'fit-content',
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setTrace(null); setError(null) }}
            style={{
              padding: '6px 16px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 500,
              background: tab === t ? 'var(--surface-raised)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-muted)',
              transition: 'all 0.15s',
              boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t === 'scenarios' ? 'Preloaded Scenarios' : t === 'custom' ? 'Custom Input' : 'Failure Modes'}
          </button>
        ))}
      </div>

      {tab === 'scenarios' && (
        <ScenarioSelector
          scenarios={scenarios}
          selectedId={selectedId}
          onSelect={id => { setSelectedId(id); setTrace(null); setError(null) }}
          onRun={handleRunScenario}
          loading={loading}
          selectedScenario={selectedScenario}
        />
      )}
      {tab === 'custom' && (
        <CustomInput onSubmit={handleCustomSubmit} loading={loading} />
      )}
      {tab === 'failures' && (
        <FailureSimulator
          onResult={setTrace}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
        />
      )}

      {error && (
        <div style={{
          marginTop: 24, padding: '12px 16px',
          background: 'var(--red-bg)', border: '1px solid var(--red-border)',
          borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13,
        }}>
          Error: {error}
        </div>
      )}

      {loading && !trace && (
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>Running decision pipeline…</div>
        </div>
      )}

      {trace && <PipelineTrace trace={trace} />}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      display: 'inline-block', width: 28, height: 28,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}
