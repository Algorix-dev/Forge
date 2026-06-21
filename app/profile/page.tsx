'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForgeStore } from '@/lib/store'
import { Sidebar } from '@/components/Sidebar'
import { calcForgeScore } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const user = useForgeStore((s) => s.user)
  const updateUser = useForgeStore((s) => s.updateUser)

  const [activeTab, setActiveTab] = useState<'profile' | 'circles'>('profile')

  // Profile Form State
  const [name, setName] = useState(user?.name || '')
  const [role, setRole] = useState(user?.role || '')
  const [location, setLocation] = useState(user?.location || '')
  const [focus, setFocus] = useState(user?.focus || '')
  const [meetUpIntent, setMeetUpIntent] = useState(user?.meetUpIntent || false)
  
  // Simulated connection visibility controls
  const [visibilitySettings, setVisibilitySettings] = useState<Record<string, { commitments: boolean, score: boolean }>>({
    'conn_1': { commitments: true, score: true },
    'conn_2': { commitments: true, score: true },
    'conn_3': { commitments: false, score: true },
  })

  // Simulated notifications toggles
  const [checkinReminders, setCheckinReminders] = useState(true)
  const [partnerNudges, setPartnerNudges] = useState(true)

  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  if (!user) return null

  // Calculate real current score
  const score = calcForgeScore(user.commitments || [], user.debriefs || [])

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser({
      name,
      role,
      location,
      focus,
      meetUpIntent,
    })
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleRedoInterview = () => {
    if (confirm('Are you sure you want to redo your onboarding interview? This will reset your archetype and insight, but keep your logs and commitments intact.')) {
      updateUser({ onboarded: false })
      router.push('/interview')
    }
  }

  const toggleConnectionVisibility = (id: string, field: 'commitments' | 'score') => {
    setVisibilitySettings(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: !prev[id][field]
      }
    }))
  }

  // Create leaderboard including the user
  const leaderboard = [
    { name: `${user.name} (You)`, archetype: user.archetype, score, isSelf: true },
    ...(user.connections || []).map(c => ({ name: c.name, archetype: c.archetype, score: c.forgeScore, isSelf: false }))
  ].sort((a, b) => b.score - a.score)

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
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          color: var(--forge-white);
          user-select: none;
        }
        .checkbox-box {
          width: 16px;
          height: 16px;
          border: 1px solid var(--forge-border);
          background: var(--forge-card);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          color: var(--forge-ember);
          font-size: 10px;
          font-weight: bold;
        }
        .leaderboard-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid var(--forge-border);
        }
        .leaderboard-row:last-child {
          border-bottom: none;
        }
        .leaderboard-row.self {
          background: rgba(200,96,42,0.05);
          border-left: 2px solid var(--forge-ember);
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)' }}>
        <Sidebar />

        <main style={{ marginLeft: 220, flex: 1, padding: '48px 56px', maxWidth: 900, width: '100%' }}>
          {/* HEADER */}
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--forge-ember)', marginBottom: 8 }}>
              05 — Integrity & Connections
            </p>
            <h1 style={{ ...S, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: 'var(--forge-white)', lineHeight: 1.1 }}>
              Profile & Circles
            </h1>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--forge-border)', marginBottom: 36 }}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              Profile & Settings
            </button>
            <button
              onClick={() => setActiveTab('circles')}
              className={`tab-btn ${activeTab === 'circles' ? 'active' : ''}`}
            >
              Circles & Social ({user.connections?.length || 0})
            </button>
          </div>

          {activeTab === 'profile' ? (
            /* PROFILE & SETTINGS TAB */
            <div>
              <div className="panel" style={{ borderLeft: '2px solid var(--forge-ember)', marginBottom: 32 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Archetype
                </p>
                <h3 style={{ ...S, fontSize: 26, color: 'var(--forge-white)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>
                  {user.archetype}
                </h3>
                <p style={{ ...S, fontSize: 18, fontStyle: 'italic', color: 'var(--forge-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                  &ldquo;{user.reflection}&rdquo;
                </p>
                <p style={{ fontSize: 13, color: 'var(--forge-subtle)', lineHeight: 1.6 }}>
                  {user.insight}
                </p>
              </div>

              <div className="panel">
                <h2 style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 24 }}>
                  Personal Details
                </h2>

                <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Role Focus</label>
                      <input
                        type="text"
                        className="form-input"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Founder, Developer, Creator"
                      />
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'var(--forge-border)', margin: '12px 0' }} />

                  <h3 style={{ ...S, fontSize: 16, fontWeight: 300, color: 'var(--forge-white)' }}>
                    Meet-up Intent (Opt-in Circle Networking)
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--forge-muted)', lineHeight: 1.5 }}>
                    Enable this to signal to connections where you are located and what goals you are working on, facilitating AI circles pairings.
                  </p>

                  <div
                    className="checkbox-container"
                    onClick={() => setMeetUpIntent(!meetUpIntent)}
                  >
                    <div className="checkbox-box">
                      {meetUpIntent && '✓'}
                    </div>
                    <span>Opt-in to Circle Networking matchmaking</span>
                  </div>

                  {meetUpIntent && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 4 }}>
                      <div>
                        <label className="form-label">Location (City, Country)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Lagos, Nigeria or Austin, USA"
                        />
                      </div>
                      <div>
                        <label className="form-label">Focus Area</label>
                        <input
                          type="text"
                          className="form-input"
                          value={focus}
                          onChange={(e) => setFocus(e.target.value)}
                          placeholder="e.g. Fintech, Deep Work, Creative Writing"
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ height: 1, background: 'var(--forge-border)', margin: '12px 0' }} />

                  <h3 style={{ ...S, fontSize: 16, fontWeight: 300, color: 'var(--forge-white)' }}>
                    Simulated Alerts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                    <div className="checkbox-container" onClick={() => setCheckinReminders(!checkinReminders)}>
                      <div className="checkbox-box">{checkinReminders && '✓'}</div>
                      <span>Daily check-in reminders (morning)</span>
                    </div>
                    <div className="checkbox-container" onClick={() => setPartnerNudges(!partnerNudges)}>
                      <div className="checkbox-box">{partnerNudges && '✓'}</div>
                      <span>Receive partner nudges when commitments are due</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                    <button type="submit" className="btn-ember">
                      Save Changes
                    </button>
                    {saveSuccess && (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--forge-white)' }}>
                        ✓ Settings saved.
                      </p>
                    )}
                  </div>
                </form>
              </div>

              {/* DANGER ZONE (REDO INTERVIEW) */}
              <div className="panel" style={{ border: '1px solid var(--forge-ember-dim)', background: 'rgba(200,96,42,0.01)' }}>
                <h3 style={{ ...S, fontSize: 18, fontWeight: 400, color: 'var(--forge-white)', marginBottom: 8 }}>
                  Danger Zone
                </h3>
                <p style={{ fontSize: 12, color: 'var(--forge-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  If your personal trajectory or discipline issues have changed, you can retake the onboarding interview. This resets your archetype profile description but preserves all past commitments and logged logs.
                </p>
                <button onClick={handleRedoInterview} className="btn-outline" style={{ borderColor: 'var(--forge-ember-dim)', color: 'var(--forge-ember)' }}>
                  Redo Onboarding Interview
                </button>
              </div>
            </div>
          ) : (
            /* CIRCLES & SOCIAL TAB */
            <div>
              {/* INTRO */}
              <div className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h2 style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 6 }}>
                      Accountability Circle
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--forge-muted)', lineHeight: 1.5 }}>
                      Forge Circles are small, private support teams. You share commitment signals and streak scores — never private journaling or debrief logs.
                    </p>
                  </div>
                  <button onClick={() => setShowInviteModal(true)} className="btn-ember">
                    Invite Connection
                  </button>
                </div>

                {showInviteModal && (
                  <div style={{ background: 'var(--forge-card)', border: '1px solid var(--forge-ember)', padding: 18, borderRadius: 2, marginBottom: 20 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--forge-ember)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Mock Invitation Link Generated
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        className="form-input"
                        readOnly
                        value="https://forge.built/invite/usr_e847c22a"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--forge-muted)', flex: 1 }}
                      />
                      <button onClick={() => { alert('Link copied to clipboard.'); setShowInviteModal(false); }} className="btn-outline" style={{ padding: '8px 16px' }}>
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* LEADERBOARD */}
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--forge-border)' }}>
                  <h3 style={{ ...S, fontSize: 18, fontWeight: 300, color: 'var(--forge-white)' }}>
                    Circle Leaderboard
                  </h3>
                </div>
                <div>
                  {leaderboard.map((player, idx) => (
                    <div
                      key={player.name}
                      className={`leaderboard-row ${player.isSelf ? 'self' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--forge-muted)', width: 20 }}>
                          {idx + 1}
                        </span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 400, color: 'var(--forge-white)' }}>
                            {player.name}
                          </p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--forge-muted)', letterSpacing: '.05em' }}>
                            {player.archetype}
                          </p>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--forge-white)' }}>
                        {player.score}
                        <span style={{ fontSize: 11, color: 'var(--forge-muted)', fontFamily: 'var(--font-mono)' }}>/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONNECTION SETTINGS / CONTROLS */}
              <div className="panel">
                <h3 style={{ ...S, fontSize: 18, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 20 }}>
                  Connection Permissions
                </h3>
                <p style={{ fontSize: 12, color: 'var(--forge-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                  Adjust what integrity metrics and follow-through logs you expose to each connection in your circle.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {(user.connections || []).map((conn) => {
                    const settings = visibilitySettings[conn.id] || { commitments: true, score: true }
                    return (
                      <div
                        key={conn.id}
                        style={{
                          background: 'var(--forge-card)',
                          border: '1px solid var(--forge-border)',
                          padding: 18,
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: 14, color: 'var(--forge-white)', fontWeight: 400 }}>{conn.name}</h4>
                          <p style={{ fontSize: 11, color: 'var(--forge-muted)', fontFamily: 'var(--font-mono)' }}>
                            {conn.location || 'Location: General'} • {conn.focus || 'Focus: General'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 20 }}>
                          <div
                            className="checkbox-container"
                            onClick={() => toggleConnectionVisibility(conn.id, 'commitments')}
                          >
                            <div className="checkbox-box">{settings.commitments && '✓'}</div>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>COMMITMENTS</span>
                          </div>
                          <div
                            className="checkbox-container"
                            onClick={() => toggleConnectionVisibility(conn.id, 'score')}
                          >
                            <div className="checkbox-box">{settings.score && '✓'}</div>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>FORGE SCORE</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
