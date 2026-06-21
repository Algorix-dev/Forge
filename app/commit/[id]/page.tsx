'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForgeStore } from '@/lib/store'
import { generateId, formatDate, daysUntil } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CommitmentDetailPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const user = useForgeStore((s) => s.user)
  const updateCommitment = useForgeStore((s) => s.updateCommitment)
  const addFrictionLog = useForgeStore((s) => s.addFrictionLog)

  const [frictionDesc, setFrictionDesc] = useState('')
  const [frictionCat, setFrictionCat] = useState('Focus')
  const [frictionSuccess, setFrictionSuccess] = useState(false)

  if (!user) return null

  const commitment = user.commitments?.find((c) => c.id === id)
  if (!commitment) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--forge-muted)', marginBottom: 16 }}>Commitment not found.</p>
          <Link href="/commit" style={{ color: 'var(--forge-ember)', textDecoration: 'none' }}>← Back to commitments</Link>
        </div>
      </div>
    )
  }

  // Filter friction logs attached to this commitment
  const attachedFrictions = user.frictionLogs?.filter((l) => l.commitmentId === id) || []
  const partner = user.connections?.find((conn) => conn.id === commitment.partnerId)

  const handleProgressChange = (val: number) => {
    updateCommitment(id, { progress: val, updatedAt: new Date().toISOString() })
  }

  const handleAddFriction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!frictionDesc.trim()) return

    const newLog = {
      id: generateId(),
      description: frictionDesc.trim(),
      category: frictionCat,
      commitmentId: id,
      createdAt: new Date().toISOString(),
    }

    addFrictionLog(newLog)
    setFrictionDesc('')
    setFrictionSuccess(true)
    setTimeout(() => setFrictionSuccess(false), 3000)
  }

  const handleEndCommitment = (status: 'completed' | 'broken' | 'abandoned') => {
    const finalProgress = status === 'completed' ? 100 : commitment.progress
    updateCommitment(id, {
      status,
      progress: finalProgress,
      updatedAt: new Date().toISOString(),
    })
    // Redirect to Debrief page with commitment ID
    router.push(`/debrief?commitmentId=${id}`)
  }

  const daysLeft = daysUntil(commitment.deadline)
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
        .meta-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--forge-muted);
          margin-bottom: 4px;
        }
        .meta-val {
          font-size: 15px;
          color: var(--forge-white);
          line-height: 1.6;
        }
        .progress-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: var(--forge-border);
          outline: none;
          border-radius: 2px;
        }
        .progress-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--forge-ember);
          cursor: pointer;
          transition: transform 0.1s;
        }
        .progress-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .btn-end {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: .1em;
          padding: 12px 20px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          border: 1px solid var(--forge-border);
          background: transparent;
          color: var(--forge-muted);
        }
        .btn-end.complete {
          border-color: var(--forge-muted);
          color: var(--forge-white);
        }
        .btn-end.complete:hover {
          background: var(--forge-white);
          color: var(--forge-black);
        }
        .btn-end.broken {
          border-color: var(--forge-ember-dim);
          color: var(--forge-ember);
        }
        .btn-end.broken:hover {
          background: var(--forge-ember);
          color: var(--forge-white);
          border-color: var(--forge-ember);
        }
        .btn-end.abandon:hover {
          border-color: var(--forge-white);
          color: var(--forge-white);
        }
        .form-input, .form-select {
          background: var(--forge-card);
          border: 1px solid var(--forge-border);
          color: var(--forge-white);
          font-family: var(--font-body);
          font-size: 13px;
          padding: 10px;
          border-radius: 2px;
          outline: none;
        }
        .form-input:focus, .form-select:focus {
          border-color: var(--forge-ember);
        }
        .back-link {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--forge-muted);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 24px;
        }
        .back-link:hover {
          color: var(--forge-white);
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)' }}>
        <Sidebar />

        <main style={{ marginLeft: 220, flex: 1, padding: '48px 56px', maxWidth: 900, width: '100%' }}>
          <Link href="/commit" className="back-link">
            ← Commitments
          </Link>

          {/* HEADER */}
          <div style={{ borderBottom: '1px solid var(--forge-border)', paddingBottom: 28, marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: 'var(--forge-ember)', textTransform: 'uppercase' }}>
                Active Commitment
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: daysLeft < 3 ? 'var(--forge-ember)' : 'var(--forge-muted)' }}>
                {daysLeft <= 0 ? 'Due today' : `${daysLeft} days remaining`}
              </span>
            </div>
            <h1 style={{ ...S, fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 300, color: 'var(--forge-white)', lineHeight: 1.1 }}>
              {commitment.title}
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
            <div>
              {/* DETAILS */}
              <div className="panel">
                <div style={{ marginBottom: 24 }}>
                  <p className="meta-label">Why This Matters</p>
                  <p className="meta-val">{commitment.why}</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p className="meta-label">Definition of Done</p>
                  <p className="meta-val" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderLeft: '2px solid var(--forge-subtle)' }}>
                    {commitment.definition}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p className="meta-label">Deadline</p>
                    <p className="meta-val">{formatDate(commitment.deadline)}</p>
                  </div>
                  <div>
                    <p className="meta-label">Break Cost</p>
                    <p className="meta-val" style={{ color: commitment.cost ? 'var(--forge-white)' : 'var(--forge-muted)' }}>
                      {commitment.cost || 'None defined'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div>
                    <p className="meta-label">Accountability Partner</p>
                    <p className="meta-val">{partner ? `${partner.name} (${partner.archetype})` : 'Private'}</p>
                  </div>
                  <div>
                    <p className="meta-label">Visibility</p>
                    <p className="meta-val" style={{ textTransform: 'capitalize' }}>{commitment.visibility}</p>
                  </div>
                </div>
              </div>

              {/* END COMMITMENT */}
              <div className="panel">
                <p className="meta-label" style={{ marginBottom: 16 }}>End Commitment</p>
                <p style={{ fontSize: 13, color: 'var(--forge-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  If the deadline has arrived or the situation is finalized, close this commitment. Ending a commitment logs its status and routes you to a structured Debrief.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleEndCommitment('completed')} className="btn-end complete" style={{ flex: 1 }}>
                    Completed
                  </button>
                  <button onClick={() => handleEndCommitment('broken')} className="btn-end broken" style={{ flex: 1 }}>
                    Broken
                  </button>
                  <button onClick={() => handleEndCommitment('abandoned')} className="btn-end abandon" style={{ flex: 1 }}>
                    Abandon
                  </button>
                </div>
              </div>
            </div>

            <div>
              {/* PROGRESS */}
              <div className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p className="meta-label" style={{ margin: 0 }}>Progress</p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--forge-white)', fontWeight: 500 }}>
                    {commitment.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={commitment.progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="progress-slider"
                  style={{ marginBottom: 12 }}
                />
                <p style={{ fontSize: 11, color: 'var(--forge-subtle)', textAlign: 'right' }}>
                  Drag slider to update
                </p>
              </div>

              {/* FRICTION ATTACHMENT */}
              <div className="panel">
                <p className="meta-label" style={{ marginBottom: 16 }}>Log Friction</p>
                <p style={{ fontSize: 12, color: 'var(--forge-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  Did you face a derailment or distraction related to this commitment today? Log it instantly.
                </p>
                <form onSubmit={handleAddFriction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="What derailed you? (e.g. Slept late)"
                    value={frictionDesc}
                    onChange={(e) => setFrictionDesc(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      className="form-select"
                      style={{ flex: 1 }}
                      value={frictionCat}
                      onChange={(e) => setFrictionCat(e.target.value)}
                    >
                      <option value="Sleep">Sleep</option>
                      <option value="Focus">Focus</option>
                      <option value="Schedule">Schedule</option>
                      <option value="Energy">Energy</option>
                      <option value="Environment">Environment</option>
                      <option value="Other">Other</option>
                    </select>
                    <button type="submit" className="btn-end" style={{ padding: '8px 16px', border: '1px solid var(--forge-ember)', color: 'var(--forge-ember)' }}>
                      Log
                    </button>
                  </div>
                  {frictionSuccess && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-white)' }}>
                      ✓ Friction point logged.
                    </p>
                  )}
                </form>

                {/* ATTACHED FRICTIONS LIST */}
                {attachedFrictions.length > 0 && (
                  <div style={{ marginTop: 24, borderTop: '1px solid var(--forge-border)', paddingTop: 16 }}>
                    <p className="meta-label" style={{ marginBottom: 10 }}>Friction History ({attachedFrictions.length})</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {attachedFrictions.map((l) => (
                        <div key={l.id} style={{ background: 'var(--forge-card)', padding: '10px 12px', border: '1px solid var(--forge-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--forge-ember)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                              {l.category}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--forge-subtle)' }}>
                              {formatDate(l.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--forge-white)', fontWeight: 300 }}>{l.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
