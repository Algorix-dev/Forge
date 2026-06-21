'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForgeStore } from '@/lib/store'
import { generateId, formatDate, daysUntil } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'

export default function CommitPage() {
  const user = useForgeStore((s) => s.user)
  const addCommitment = useForgeStore((s) => s.addCommitment)

  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')

  // Form State
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [definition, setDefinition] = useState('')
  const [deadline, setDeadline] = useState('')
  const [cost, setCost] = useState('')
  const [partnerId, setPartnerId] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'circle'>('private')
  const [error, setError] = useState('')

  if (!user) return null

  const commitments = user.commitments || []
  const activeCommitments = commitments.filter((c) => c.status === 'active')
  const pastCommitments = commitments.filter((c) => c.status !== 'active')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !why.trim() || !definition.trim() || !deadline) {
      setError('Please fill in all required fields.')
      return
    }

    const newCommitment = {
      id: generateId(),
      title: title.trim(),
      why: why.trim(),
      definition: definition.trim(),
      deadline: new Date(deadline).toISOString(),
      cost: cost.trim(),
      status: 'active' as const,
      progress: 0,
      partnerId: partnerId || undefined,
      visibility,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addCommitment(newCommitment)

    // Reset Form
    setTitle('')
    setWhy('')
    setDefinition('')
    setDeadline('')
    setCost('')
    setPartnerId('')
    setVisibility('private')
    setError('')
    setIsCreating(false)
    setActiveTab('active')
  }

  const S = { fontFamily: 'var(--font-display)' }

  return (
    <>
      <style>{`
        .commit-card {
          background: var(--forge-card);
          border: 1px solid var(--forge-border);
          padding: 24px;
          border-radius: 2px;
          transition: all 0.2s;
          text-decoration: none;
          display: block;
        }
        .commit-card:hover {
          border-color: var(--forge-subtle);
          transform: translateY(-1px);
        }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          background: var(--forge-surface);
          border: 1px solid var(--forge-border);
          color: var(--forge-white);
          font-family: var(--font-body);
          font-size: 14px;
          padding: 12px;
          border-radius: 2px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
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
        .tab-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--forge-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .tab-btn.active {
          color: var(--forge-white);
          border-bottom-color: var(--forge-ember);
        }
        .btn-ember {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: .1em;
          color: var(--forge-white);
          background: var(--forge-ember);
          border: none;
          padding: 10px 24px;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s;
          text-transform: uppercase;
        }
        .btn-ember:hover {
          opacity: 0.85;
        }
        .btn-outline {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: .1em;
          color: var(--forge-muted);
          background: transparent;
          border: 1px solid var(--forge-border);
          padding: 10px 24px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .btn-outline:hover {
          border-color: var(--forge-muted);
          color: var(--forge-white);
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)' }}>
        <Sidebar />

        <main style={{ marginLeft: 220, flex: 1, padding: '48px 56px', maxWidth: 900, width: '100%' }}>
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 44 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--forge-ember)', marginBottom: 8 }}>
                01 — Commitment Ledger
              </p>
              <h1 style={{ ...S, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: 'var(--forge-white)', lineHeight: 1.1 }}>
                Commitments
              </h1>
            </div>
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} className="btn-ember">
                + New Commitment
              </button>
            )}
          </div>

          {isCreating ? (
            /* CREATE FORM */
            <div style={{ background: 'var(--forge-surface)', border: '1px solid var(--forge-border)', padding: 36, borderRadius: 2, marginBottom: 40 }}>
              <h2 style={{ ...S, fontSize: 24, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 28 }}>
                Make a New Commitment
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label className="form-label">What are you committing to? *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Write code for 2 hours daily, Run 5k"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Why does this matter? (Intentionality) *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Why is this commitment critical right now? What breaks if you don't do it?"
                    value={why}
                    onChange={(e) => setWhy(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">What does &apos;Done&apos; look like? (Measurable definition) *</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Clear definition of completion (e.g. GitHub contribution green dot, Strava activity link)"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label className="form-label">Deadline *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Cost of breaking it (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. $100 to charity, Delete social media"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label className="form-label">Accountability Partner</label>
                    <select
                      className="form-select"
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                    >
                      <option value="">None (Private)</option>
                      {(user.connections || []).map((conn) => (
                        <option key={conn.id} value={conn.id}>
                          {conn.name} ({conn.archetype})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Circle Visibility</label>
                    <select
                      className="form-select"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as 'private' | 'circle')}
                    >
                      <option value="private">Private (Only Me)</option>
                      <option value="circle">Circle (Visible to Connections)</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--forge-ember)' }}>
                    {error}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="submit" className="btn-ember">
                    Save Commitment
                  </button>
                  <button type="button" onClick={() => { setIsCreating(false); setError(''); }} className="btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* LIST VIEW */
            <div>
              {/* TABS */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--forge-border)', marginBottom: 28 }}>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                >
                  Active ({activeCommitments.length})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                >
                  Past ({pastCommitments.length})
                </button>
              </div>

              {activeTab === 'active' ? (
                activeCommitments.length === 0 ? (
                  <div style={{ background: 'var(--forge-surface)', border: '1px solid var(--forge-border)', padding: 48, borderRadius: 2, textAlign: 'center' }}>
                    <p style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-muted)', marginBottom: 8 }}>
                      No active commitments.
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--forge-subtle)', marginBottom: 24 }}>
                      Discipline starts with defining what you will do.
                    </p>
                    <button onClick={() => setIsCreating(true)} className="btn-ember">
                      Make a Commitment
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {activeCommitments.map((c) => {
                      const daysLeft = daysUntil(c.deadline)
                      const partner = user.connections?.find((conn) => conn.id === c.partnerId)
                      return (
                        <Link href={`/commit/${c.id}`} key={c.id} className="commit-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                              <h3 style={{ fontSize: 18, fontWeight: 400, color: 'var(--forge-white)', marginBottom: 6 }}>
                                {c.title}
                              </h3>
                              <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--forge-muted)', marginBottom: 4 }}>
                                <em style={{ fontStyle: 'italic' }}>Why:</em> {c.why}
                              </p>
                              {partner && (
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-ember-dim)' }}>
                                  🛡️ Accountability: {partner.name}
                                </p>
                              )}
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: daysLeft < 3 ? 'var(--forge-ember)' : 'var(--forge-muted)' }}>
                              {daysLeft <= 0 ? 'Due today' : `${daysLeft}d left`}
                            </span>
                          </div>

                          <div style={{ height: 3, background: 'var(--forge-border)', borderRadius: 1.5, marginBottom: 8 }}>
                            <div style={{ height: '100%', background: 'var(--forge-ember)', borderRadius: 1.5, width: `${c.progress}%`, transition: 'width 0.3s ease' }} />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-subtle)' }}>
                              Due {formatDate(c.deadline)}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--forge-white)', fontWeight: 500 }}>
                              {c.progress}%
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )
              ) : pastCommitments.length === 0 ? (
                <div style={{ background: 'var(--forge-surface)', border: '1px solid var(--forge-border)', padding: 48, borderRadius: 2, textAlign: 'center' }}>
                  <p style={{ ...S, fontSize: 18, color: 'var(--forge-muted)' }}>
                    No completed or broken commitments yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {pastCommitments.map((c) => {
                    const statusColors: Record<string, string> = {
                      active: 'var(--forge-ember)',
                      completed: 'var(--forge-muted)',
                      broken: 'var(--forge-ember)',
                      abandoned: 'var(--forge-subtle)',
                    }
                    const statusLabels: Record<string, string> = {
                      active: 'Active',
                      completed: 'Completed',
                      broken: 'Broken',
                      abandoned: 'Abandoned',
                    }
                    return (
                      <div key={c.id} className="commit-card" style={{ opacity: 0.7 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--forge-white)', marginBottom: 4 }}>
                              {c.title}
                            </h3>
                            <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--forge-muted)' }}>
                              {c.why}
                            </p>
                          </div>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              letterSpacing: '.08em',
                              textTransform: 'uppercase',
                              padding: '4px 8px',
                              background: 'var(--forge-surface)',
                              border: `1px solid ${statusColors[c.status] || 'var(--forge-border)'}`,
                              color: statusColors[c.status] || 'var(--forge-white)',
                              borderRadius: 2,
                            }}
                          >
                            {statusLabels[c.status] || c.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-subtle)' }}>
                            Ended on {formatDate(c.updatedAt)}
                          </span>
                          {c.cost && c.status === 'broken' && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-ember)' }}>
                              💸 Cost incurred: {c.cost}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
