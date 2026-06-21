'use client'

import { useState, useEffect } from 'react'
import { useForgeStore } from '@/lib/store'
import { generateId, formatDate } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'
import { callClaude } from '@/lib/claude'

export default function TrackPage() {
  const user = useForgeStore((s) => s.user)
  const addFrictionLog = useForgeStore((s) => s.addFrictionLog)

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Focus')
  const [commitmentId, setCommitmentId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // AI Insights State
  const [insights, setInsights] = useState<string>('')
  const [loadingInsights, setLoadingInsights] = useState(false)

  if (!user) return null

  const activeCommitments = user.commitments?.filter((c) => c.status === 'active') || []
  const logs = user.frictionLogs || []

  // Group logs for visualization
  const categories = ['Sleep', 'Focus', 'Schedule', 'Energy', 'Environment', 'Other']
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = logs.filter((l) => l.category === cat).length
    return acc
  }, {} as Record<string, number>)

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1)

  // Group by day of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayCounts = daysOfWeek.reduce((acc, day, index) => {
    acc[day] = logs.filter((l) => new Date(l.createdAt).getDay() === index).length
    return acc
  }, {} as Record<string, number>)
  const maxDayCount = Math.max(...Object.values(dayCounts), 1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError('Description is required.')
      return
    }

    const newLog = {
      id: generateId(),
      description: description.trim(),
      category,
      commitmentId: commitmentId || undefined,
      createdAt: new Date().toISOString(),
    }

    addFrictionLog(newLog)
    setDescription('')
    setCommitmentId('')
    setError('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleGenerateInsights = async () => {
    if (logs.length < 5) return
    setLoadingInsights(true)
    try {
      const logsSummary = logs.map((l) => `- [${l.category}] ${l.description} (on ${formatDate(l.createdAt)})`).join('\n')
      const systemPrompt = `You are Forge's intelligence engine. Analyze the user's friction logs and return a brief, sharp, serious analysis of their patterns. Be direct, perceptive, and serious. Never use fluffy or encouraging language.
Format the output strictly as markdown:
1. One italicized Cormorant Garamond sentence summarizing their primary derailer.
2. A bulleted list of 3 specific, actionable discipline countermeasures based on their logs.`

      const userPrompt = `User Name: ${user.name}
User Archetype: ${user.archetype}
Core Challenge: ${user.insight}
Friction Logs:
${logsSummary}`

      const raw = await callClaude(systemPrompt, userPrompt)
      setInsights(raw)
    } catch (e) {
      setInsights('Failed to analyze patterns. Ensure API keys are set up.')
    } finally {
      setLoadingInsights(false)
    }
  }

  const S = { fontFamily: 'var(--font-display)' }

  return (
    <>
      <style>{`
        .panel {
          background: var(--forge-surface);
          border: 1px solid var(--forge-border);
          padding: 28px;
          border-radius: 2px;
          margin-bottom: 24px;
        }
        .form-input, .form-select {
          width: 100%;
          background: var(--forge-card);
          border: 1px solid var(--forge-border);
          color: var(--forge-white);
          font-family: var(--font-body);
          font-size: 14px;
          padding: 12px;
          border-radius: 2px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus, .form-select:focus {
          border-color: var(--forge-ember);
        }
        .form-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--forge-muted);
          margin-bottom: 8px;
        }
        .btn-ember {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: .1em;
          color: var(--forge-white);
          background: var(--forge-ember);
          border: none;
          padding: 12px 24px;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .btn-ember:hover {
          opacity: 0.85;
        }
        .bar-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .bar-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--forge-muted);
          width: 100px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .bar-track {
          flex: 1;
          height: 6px;
          background: var(--forge-border);
          position: relative;
          border-radius: 3px;
        }
        .bar-fill {
          height: 100%;
          background: var(--forge-ember);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
        .bar-count {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--forge-white);
          width: 20px;
          text-align: right;
        }
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-top: 16px;
        }
        .heatmap-cell {
          background: var(--forge-card);
          border: 1px solid var(--forge-border);
          padding: 12px 6px;
          text-align: center;
          border-radius: 2px;
        }
        .dot-cluster {
          width: 100%;
          height: 140px;
          background: var(--forge-card);
          border: 1px solid var(--forge-border);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
          transition: transform 0.2s;
        }
        .dot:hover {
          transform: translate(-50%, -50%) scale(1.6);
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)' }}>
        <Sidebar />

        <main style={{ marginLeft: 220, flex: 1, padding: '48px 56px', maxWidth: 900, width: '100%' }}>
          {/* HEADER */}
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--forge-ember)', marginBottom: 8 }}>
              02 — Friction Map
            </p>
            <h1 style={{ ...S, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: 'var(--forge-white)', lineHeight: 1.1 }}>
              Friction Map
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginBottom: 32 }}>
            {/* FAST ENTRY FORM */}
            <div className="panel" style={{ height: 'fit-content' }}>
              <h2 style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 20 }}>
                Log Friction Point
              </h2>
              <p style={{ fontSize: 13, color: 'var(--forge-muted)', marginBottom: 20 }}>
                Record whatever derailed your schedule or energy. Real accountability requires logging failures.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">What broke your plan? *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short description (e.g. Slept in 45m, Wasted 2h on YouTube)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Linked Commitment</label>
                    <select
                      className="form-select"
                      value={commitmentId}
                      onChange={(e) => setCommitmentId(e.target.value)}
                    >
                      <option value="">None (General)</option>
                      {activeCommitments.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--forge-ember)' }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--forge-white)', opacity: success ? 1 : 0, transition: 'opacity 0.2s' }}>
                    ✓ Friction logged successfully.
                  </p>
                  <button type="submit" className="btn-ember">
                    Log Point
                  </button>
                </div>
              </form>
            </div>

            {/* VISUALIZATION */}
            <div className="panel" style={{ height: 'fit-content' }}>
              <h2 style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 24 }}>
                Pattern Analysis
              </h2>

              {logs.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--forge-subtle)' }}>
                    No friction logged yet. Data maps will load here.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="form-label" style={{ marginBottom: 16 }}>Friction by Category</p>
                  {categories.map((cat) => {
                    const count = categoryCounts[cat] || 0
                    const pct = (count / maxCategoryCount) * 100
                    return (
                      <div key={cat} className="bar-container">
                        <span className="bar-label">{cat}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="bar-count">{count}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC SPATIAL MAP / DOT CLUSTER */}
          {logs.length > 0 && (
            <div className="panel">
              <p className="form-label" style={{ marginBottom: 12 }}>Visual Cluster Map</p>
              <div className="dot-cluster">
                {/* SVG background grid lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
                  <line x1="25%" y1="0" x2="25%" y2="100%" stroke="var(--forge-white)" />
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--forge-white)" />
                  <line x1="75%" y1="0" x2="75%" y2="100%" stroke="var(--forge-white)" />
                  <line x1="0" y1="33%" x2="100%" y2="33%" stroke="var(--forge-white)" />
                  <line x1="0" y1="66%" x2="100%" y2="66%" stroke="var(--forge-white)" />
                </svg>

                {logs.map((l, index) => {
                  // Determinisitc coordinate mapping based on ID hashes to keep rendering stable
                  const getCoordinate = (str: string, seed: number, max: number) => {
                    let hash = 0
                    for (let i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash)
                    }
                    return Math.abs((hash * seed) % max)
                  }

                  const x = 10 + getCoordinate(l.id, 7, 80) // 10% to 90%
                  const y = 15 + getCoordinate(l.id, 13, 70) // 15% to 85%

                  const catColors: Record<string, string> = {
                    Sleep: 'var(--forge-ember)',
                    Focus: '#6ba4c8',
                    Schedule: '#a1c86b',
                    Energy: '#c8ba6b',
                    Environment: '#c86bc0',
                    Other: 'var(--forge-muted)',
                  }

                  const color = catColors[l.category] || 'var(--forge-white)'

                  return (
                    <div
                      key={l.id}
                      className="dot"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        background: color,
                        boxShadow: `0 0 10px ${color}`,
                      }}
                      title={`[${l.category}] ${l.description}`}
                    />
                  );
                })}

                <div style={{ position: 'absolute', bottom: 8, right: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {categories.map((cat) => {
                    const catColors: Record<string, string> = {
                      Sleep: 'var(--forge-ember)',
                      Focus: '#6ba4c8',
                      Schedule: '#a1c86b',
                      Energy: '#c8ba6b',
                      Environment: '#c86bc0',
                      Other: 'var(--forge-muted)',
                    }
                    return (
                      <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--forge-muted)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColors[cat] }} />
                        {cat}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* AI PATTERN INSIGHTS */}
          <div className="panel" style={{ borderLeft: '2px solid var(--forge-ember)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 6 }}>
                  AI Pattern Insights
                </h2>
                <p style={{ fontSize: 13, color: 'var(--forge-muted)' }}>
                  Deep mining of your logged derailments to surface subconscious failure modes.
                </p>
              </div>
              {logs.length >= 5 && (
                <button
                  onClick={handleGenerateInsights}
                  disabled={loadingInsights}
                  className="btn-ember"
                >
                  {loadingInsights ? 'Analyzing...' : 'Generate Insights'}
                </button>
              )}
            </div>

            {logs.length < 5 ? (
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--forge-border)', padding: 24, textAlign: 'center', borderRadius: 2 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--forge-muted)' }}>
                  🔓 Log at least 5 friction points to unlock AI pattern analysis. (Current: {logs.length}/5)
                </p>
              </div>
            ) : insights ? (
              <div style={{ color: 'var(--forge-white)', fontSize: 14, lineHeight: 1.7 }} className="insights-content">
                <div style={{ ...S, fontSize: 18, fontStyle: 'italic', color: 'var(--forge-muted)', marginBottom: 16, borderLeft: '2px solid var(--forge-ember)', paddingLeft: 16 }} dangerouslySetInnerHTML={{ __html: insights.split('\n\n')[0] }} />
                <div dangerouslySetInnerHTML={{ __html: insights.split('\n\n').slice(1).join('\n\n') }} />
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--forge-subtle)', fontStyle: 'italic' }}>
                Click &ldquo;Generate Insights&rdquo; to analyze your {logs.length} logged patterns.
              </p>
            )}
          </div>

          {/* CHRONOLOGICAL LOG LIST */}
          <div className="panel">
            <h2 style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 20 }}>
              Friction History
            </h2>

            {logs.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--forge-subtle)', fontStyle: 'italic' }}>
                No friction logged yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--forge-border)' }}>
                {logs.map((log) => {
                  const linkedCommit = user.commitments?.find((c) => c.id === log.commitmentId)
                  return (
                    <div key={log.id} style={{ background: 'var(--forge-surface)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: '.05em',
                            textTransform: 'uppercase',
                            color: 'var(--forge-ember)',
                            border: '1px solid var(--forge-ember-dim)',
                            padding: '2px 6px',
                            borderRadius: 2
                          }}>
                            {log.category}
                          </span>
                          {linkedCommit && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--forge-muted)' }}>
                              🔗 {linkedCommit.title}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--forge-white)', fontWeight: 300 }}>{log.description}</p>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-muted)', whiteSpace: 'nowrap', marginLeft: 16 }}>
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
