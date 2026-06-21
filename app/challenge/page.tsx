'use client'

import { useState } from 'react'
import { useForgeStore } from '@/lib/store'
import { Sidebar } from '@/components/Sidebar'
import { callClaude } from '@/lib/claude'

interface Scorecard {
  adversarialScore: number
  verdict: string
  assumptions: string[]
  risks: string[]
  blindspots: string[]
  assets: string[]
}

export default function ChallengePage() {
  const user = useForgeStore((s) => s.user)

  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [scorecard, setScorecard] = useState<Scorecard | null>(null)
  const [error, setError] = useState('')

  if (!user) return null

  const handleStressTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setLoading(true)
    setError('')
    setScorecard(null)

    try {
      const systemPrompt = `You are Forge's adversarial stress-tester. Your role is not to encourage, but to act as a rigorous devil's advocate to help the user identify blindspots, unexamined assumptions, second-order effects, and vulnerabilities in their plan.
You MUST return ONLY a valid JSON response containing a structured scorecard. No markdown formatting, no backticks, no text before or after the JSON.
Structure:
{
  "adversarialScore": 55,
  "verdict": "UNEXAMINED EXECUTION RISK",
  "assumptions": [
    "Assumes X will remain constant",
    "Assumes Y will happen immediately"
  ],
  "risks": [
    "Risk A (second-order delay)",
    "Risk B (loss of momentum)"
  ],
  "blindspots": [
    "How will you measure Z?",
    "What is the exit condition?"
  ],
  "assets": [
    "Clear definition of done",
    "Strong initial motivation"
  ]
}
Be extremely demanding. A realistic, solid plan should score between 50 and 75. A score above 85 is virtually impossible unless everything is bulletproof.`

      const userPrompt = `Plan/Idea: "${description.trim()}"
User Archetype: "${user.archetype}"
Core Challenge: "${user.insight}"`

      const raw = await callClaude(systemPrompt, userPrompt)
      
      // Clean markdown code fences if returned
      const jsonText = raw.replace(/```json|```/g, '').trim()
      const data = JSON.parse(jsonText) as Scorecard
      setScorecard(data)
    } catch (e: unknown) {
      console.error(e)
      setError('Stress-test synthesis failed. Try formatting your idea differently or try again.')
    } finally {
      setLoading(false)
    }
  }

  const S = { fontFamily: 'var(--font-display)' }

  return (
    <>
      <style>{`
        .panel {
          background: var(--forge-surface);
          border: 1px solid var(--forge-border);
          padding: 32px;
          border-radius: 2px;
          margin-bottom: 24px;
        }
        .form-textarea {
          width: 100%;
          background: var(--forge-card);
          border: 1px solid var(--forge-border);
          color: var(--forge-white);
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.7;
          padding: 16px;
          border-radius: 2px;
          resize: none;
          outline: none;
          min-height: 140px;
          transition: border-color 0.2s;
        }
        .form-textarea:focus {
          border-color: var(--forge-ember);
        }
        .btn-ember {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: .1em;
          color: var(--forge-white);
          background: var(--forge-ember);
          border: none;
          padding: 12px 28px;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s;
          text-transform: uppercase;
        }
        .btn-ember:hover:not(:disabled) {
          opacity: 0.85;
        }
        .btn-ember:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px solid var(--forge-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          background: var(--forge-card);
        }
        .card-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .card-item {
          background: var(--forge-card);
          border: 1px solid var(--forge-border);
          padding: 14px 18px;
          border-radius: 2px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .card-item-bullet {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--forge-ember);
        }
        .card-item-text {
          font-size: 13px;
          color: var(--forge-white);
          line-height: 1.5;
          font-weight: 300;
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)' }}>
        <Sidebar />

        <main style={{ marginLeft: 220, flex: 1, padding: '48px 56px', maxWidth: 900, width: '100%' }}>
          {/* HEADER */}
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--forge-ember)', marginBottom: 8 }}>
              04 — Idea Stress-Tester
            </p>
            <h1 style={{ ...S, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: 'var(--forge-white)', lineHeight: 1.1 }}>
              Challenge
            </h1>
          </div>

          {!scorecard && !loading ? (
            /* INPUT VIEW */
            <div className="panel">
              <h2 style={{ ...S, fontSize: 22, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 16 }}>
                Stress-test a plan before you commit
              </h2>
              <p style={{ fontSize: 13, color: 'var(--forge-muted)', marginBottom: 28, lineHeight: 1.7, maxWidth: 640 }}>
                Bring an idea, goal, or life decision. Forge will act as an adversarial devil&apos;s advocate to expose your hidden assumptions, risks, and second-order blockers. Enter the plan below with as much context as possible.
              </p>

              <form onSubmit={handleStressTest} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <textarea
                  className="form-textarea"
                  placeholder="Outline your plan. Be specific: what is the timeline, what are your constraints, and why do you think this will succeed?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                {error && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--forge-ember)' }}>
                    {error}
                  </p>
                )}

                <div>
                  <button type="submit" className="btn-ember">
                    Initiate Stress-Test
                  </button>
                </div>
              </form>
            </div>
          ) : loading ? (
            /* LOADING VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
              <p style={{ ...S, fontSize: 24, fontWeight: 300, color: 'var(--forge-white)', textAlign: 'center', lineHeight: 1.3, marginBottom: 28 }}>
                Deconstructing plan assumptions...<br/>
                <span style={{ fontSize: 14, color: 'var(--forge-muted)', fontFamily: 'var(--font-body)' }}>Applying adversarial scrutiny to your proposal.</span>
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 8, height: 8, background: 'var(--forge-ember)', borderRadius: '50%', animation: 'dp 1.4s ease-in-out infinite' }} />
                <div style={{ width: 8, height: 8, background: 'var(--forge-ember)', borderRadius: '50%', animation: 'dp 1.4s ease-in-out infinite', animationDelay: '.22s' }} />
                <div style={{ width: 8, height: 8, background: 'var(--forge-ember)', borderRadius: '50%', animation: 'dp 1.4s ease-in-out infinite', animationDelay: '.44s' }} />
              </div>
              <style>{`
                @keyframes dp {
                  0%, 80%, 100% { opacity: .2; transform: scale(.7); }
                  40% { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>
          ) : scorecard ? (
            /* SCORECARD VIEW */
            <div>
              {/* SCORE CARD DETAILS */}
              <div className="panel" style={{ borderLeft: '3px solid var(--forge-ember)', display: 'flex', gap: 32, alignItems: 'center', marginBottom: 32 }}>
                <div className="score-circle">
                  {/* Circular progress highlight border */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      border: '2px solid var(--forge-ember)',
                      clipPath: `polygon(50% 50%, -50% -50%, ${scorecard?.adversarialScore || 0}% -50%, ${scorecard?.adversarialScore || 0}% 150%, -50% 150%)`,
                      opacity: 0.8,
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    Adversarial
                  </span>
                  <span style={{ ...S, fontSize: 36, color: 'var(--forge-white)', fontWeight: 300, lineHeight: 1.1 }}>
                    {scorecard?.adversarialScore ?? 0}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-muted)' }}>
                    /100
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-ember)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 4 }}>
                    VERDICT
                  </p>
                  <h2 style={{ ...S, fontSize: 26, fontWeight: 400, color: 'var(--forge-white)', letterSpacing: '.04em' }}>
                    {scorecard.verdict}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--forge-muted)', marginTop: 6 }}>
                    This score reflects execution viability. Solid, realistic plans range between 50 and 75.
                  </p>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* ASSUMPTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', color: 'var(--forge-muted)', textTransform: 'uppercase' }}>
                    Unexamined Assumptions
                  </h3>
                  <div className="card-list">
                    {scorecard.assumptions.map((item, idx) => (
                      <div key={idx} className="card-item" style={{ borderLeft: '2px solid #c8ba6b' }}>
                        <span className="card-item-bullet" style={{ color: '#c8ba6b' }}>?</span>
                        <p className="card-item-text">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RISKS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', color: 'var(--forge-muted)', textTransform: 'uppercase' }}>
                    Critical Risks
                  </h3>
                  <div className="card-list">
                    {scorecard.risks.map((item, idx) => (
                      <div key={idx} className="card-item" style={{ borderLeft: '2px solid var(--forge-ember)' }}>
                        <span className="card-item-bullet">⚠</span>
                        <p className="card-item-text">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* BLINDSPOTS (QUESTIONS) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', color: 'var(--forge-muted)', textTransform: 'uppercase' }}>
                    Open Questions
                  </h3>
                  <div className="card-list">
                    {scorecard.blindspots.map((item, idx) => (
                      <div key={idx} className="card-item" style={{ borderLeft: '2px solid #6ba4c8' }}>
                        <span className="card-item-bullet" style={{ color: '#6ba4c8' }}>➔</span>
                        <p className="card-item-text">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ASSETS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', color: 'var(--forge-muted)', textTransform: 'uppercase' }}>
                    Identified Strengths
                  </h3>
                  <div className="card-list">
                    {scorecard.assets.map((item, idx) => (
                      <div key={idx} className="card-item" style={{ borderLeft: '2px solid #a1c86b' }}>
                        <span className="card-item-bullet" style={{ color: '#a1c86b' }}>✓</span>
                        <p className="card-item-text">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 24 }}>
                <button
                  onClick={() => {
                    setScorecard(null)
                    setDescription('')
                  }}
                  className="btn-ember"
                >
                  Test Another Idea
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </>
  )
}
