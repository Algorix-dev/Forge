'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForgeStore } from '@/lib/store'
import { generateId, formatDate, calcForgeScore } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'
import { callClaude } from '@/lib/claude'

const QUESTIONS = [
  { id: 'what', label: '1. What happened vs. what you expected?', ph: 'Describe the outcome objectively. Compare your goal to the result.' },
  { id: 'well', label: '2. What did you do well?', ph: 'Identify specific actions, routines, or focus windows that succeeded.' },
  { id: 'differently', label: '3. What would you do differently?', ph: 'Where did the breakdown happen? What behavior needs to change?' },
  { id: 'lesson', label: '4. What does this tell you about yourself?', ph: 'Uncover the pattern. What is the self-discipline takeaway here?' },
]

function DebriefContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const commitmentId = searchParams.get('commitmentId')

  const user = useForgeStore((s) => s.user)
  const addDebrief = useForgeStore((s) => s.addDebrief)
  const updateCommitment = useForgeStore((s) => s.updateCommitment)
  const updateUser = useForgeStore((s) => s.updateUser)

  const [activeTab, setActiveTab] = useState<'run' | 'playbook'>('run')

  // Debrief Form Flow state
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({
    what: '',
    well: '',
    differently: '',
    lesson: '',
  })
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedDebriefId, setExpandedDebriefId] = useState<string | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const commitments = user?.commitments || []
  const debriefs = user?.debriefs || []

  // Pre-load commitment context if redirected from Commit page
  const linkedCommitment = commitmentId ? commitments.find((c) => c.id === commitmentId) : null

  useEffect(() => {
    setTimeout(() => {
      if (commitmentId) {
        setActiveTab('run')
      } else if (debriefs.length > 0) {
        setActiveTab('playbook')
      }
    }, 0)
  }, [commitmentId, debriefs.length])

  // Focus textarea when question changes (no setState here)
  useEffect(() => {
    if (activeTab === 'run' && !isProcessing) {
      textareaRef.current?.focus()
    }
  }, [qi, activeTab, isProcessing])

  if (!user) return null

  const handleNext = () => {
    if (!inputValue.trim()) {
      setError('Please answer the question before continuing.')
      return
    }

    const currentKey = QUESTIONS[qi].id
    const updatedAnswers = { ...answers, [currentKey]: inputValue.trim() }
    setAnswers(updatedAnswers)

    if (qi < QUESTIONS.length - 1) {
      const nextQi = qi + 1
      setQi(nextQi)
      setInputValue(updatedAnswers[QUESTIONS[nextQi].id] || '')
      setError('')
    } else {
      // Completed all questions, trigger AI Synthesis
      handleFinishDebrief(updatedAnswers)
    }
  }

  const handleBack = () => {
    if (qi > 0) {
      const prevQi = qi - 1
      setQi(prevQi)
      setInputValue(answers[QUESTIONS[prevQi].id] || '')
      setError('')
    }
  }

  const handleFinishDebrief = async (finalAnswers: Record<string, string>) => {
    setIsProcessing(true)
    setError('')

    try {
      const commitmentTitle = linkedCommitment ? linkedCommitment.title : 'General Life Event'
      const commitmentStatus = linkedCommitment ? linkedCommitment.status : 'N/A'

      const systemPrompt = `You are Forge's wisdom synthesiser. The user has just run a debrief on a commitment. Analyze their responses and write a single, extremely punchy, actionable self-knowledge lesson (maximum 2 sentences). Be direct, serious, and insightful. Avoid platitudes, fluff, or praise. Focus on the core psychological gap they need to address.`

      const userPrompt = `Commitment Name: "${commitmentTitle}" (Status: ${commitmentStatus})
Q1: What happened vs expected?
A1: "${finalAnswers.what}"
Q2: What did you do well?
A2: "${finalAnswers.well}"
Q3: What would you do differently?
A3: "${finalAnswers.differently}"
Q4: What does this tell you about yourself?
A4: "${finalAnswers.lesson}"`

      const aiInsight = await callClaude(systemPrompt, userPrompt)

      const newDebrief = {
        id: generateId(),
        commitmentId: commitmentId || undefined,
        what: finalAnswers.what,
        well: finalAnswers.well,
        differently: finalAnswers.differently,
        lesson: finalAnswers.lesson,
        aiInsight: aiInsight || 'A lesson is waiting to be uncovered in this follow-through gap.',
        createdAt: new Date().toISOString(),
      }

      addDebrief(newDebrief)

      // Recalculate and update global Forge Score
      const updatedDebriefs = [newDebrief, ...user.debriefs]
      const newScore = calcForgeScore(user.commitments, updatedDebriefs)
      updateUser({ forgeScore: newScore })

      // Reset form
      setQi(0)
      setAnswers({ what: '', well: '', differently: '', lesson: '' })
      setInputValue('')

      // Switch to Playbook tab to view their new insight card
      setActiveTab('playbook')
      // Automatically expand the new debrief card
      setExpandedDebriefId(newDebrief.id)
    } catch {
      setError('AI Synthesis failed. Debrief saved with fallback insight.')
      
      const fallbackDebrief = {
        id: generateId(),
        commitmentId: commitmentId || undefined,
        what: finalAnswers.what,
        well: finalAnswers.well,
        differently: finalAnswers.differently,
        lesson: finalAnswers.lesson,
        aiInsight: 'Self-honesty is the root of progress. Keep logging outcomes and review your raw answers below.',
        createdAt: new Date().toISOString(),
      }
      addDebrief(fallbackDebrief)

      // Switch to Playbook
      setQi(0)
      setAnswers({ what: '', well: '', differently: '', lesson: '' })
      setInputValue('')
      setActiveTab('playbook')
      setExpandedDebriefId(fallbackDebrief.id)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  const S = { fontFamily: 'var(--font-display)' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)' }}>
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: '48px 56px', maxWidth: 900, width: '100%' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 44 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--forge-ember)', marginBottom: 8 }}>
            03 — Debrief Engine & Playbook
          </p>
          <h1 style={{ ...S, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: 'var(--forge-white)', lineHeight: 1.1 }}>
            Debrief
          </h1>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--forge-border)', marginBottom: 36 }}>
          <button
            onClick={() => setActiveTab('run')}
            className={`tab-btn ${activeTab === 'run' ? 'active' : ''}`}
          >
            Run Debrief
          </button>
          <button
            onClick={() => setActiveTab('playbook')}
            className={`tab-btn ${activeTab === 'playbook' ? 'active' : ''}`}
          >
            Your Playbook ({debriefs.length})
          </button>
        </div>

        {/* RUN DEBRIEF TAB */}
        {activeTab === 'run' && (
          <div>
            {isProcessing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                <p style={{ ...S, fontSize: 24, fontWeight: 300, color: 'var(--forge-white)', textAlign: 'center', lineHeight: 1.3, marginBottom: 28 }}>
                  Synthesizing insights...<br/>
                  <span style={{ fontSize: 14, color: 'var(--forge-muted)', fontFamily: 'var(--font-body)' }}>Forge is forging a new lesson card for your playbook.</span>
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--forge-surface)', border: '1px solid var(--forge-border)', padding: 36, borderRadius: 2 }}>
                {linkedCommitment && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--forge-border)', padding: '16px 20px', borderRadius: 2, marginBottom: 32 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.12em', color: 'var(--forge-ember)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Debrief Context: Commitment Ended ({linkedCommitment.status})
                    </p>
                    <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--forge-white)', marginBottom: 4 }}>{linkedCommitment.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--forge-muted)' }}><em style={{ fontStyle: 'italic' }}>Done looks like:</em> {linkedCommitment.definition}</p>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-muted)', marginBottom: 12 }}>
                    <span>STEP {qi + 1} OF {QUESTIONS.length}</span>
                    <span>{QUESTIONS[qi].id.toUpperCase()}</span>
                  </div>
                  <h2 style={{ ...S, fontSize: 22, fontWeight: 300, color: 'var(--forge-white)', marginBottom: 20 }}>
                    {QUESTIONS[qi].label}
                  </h2>
                  <textarea
                    ref={textareaRef}
                    className="answer-input"
                    rows={4}
                    placeholder={QUESTIONS[qi].ph}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--forge-border)',
                      color: 'var(--forge-white)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 16,
                      fontWeight: 300,
                      lineHeight: 1.7,
                      padding: '14px 0',
                      resize: 'none',
                      outline: 'none',
                      minHeight: 100,
                      transition: 'border-color .2s',
                    }}
                  />
                  {error && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-ember)', marginTop: 10 }}>
                      {error}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                  <button
                    onClick={handleBack}
                    disabled={qi === 0}
                    className="btn-outline"
                    style={{ opacity: qi === 0 ? 0.28 : 1 }}
                  >
                    ← Back
                  </button>
                  <button onClick={handleNext} className="btn-ember">
                    {qi === QUESTIONS.length - 1 ? 'Finish Debrief →' : 'Continue →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLAYBOOK TAB */}
        {activeTab === 'playbook' && (
          <div>
            {debriefs.length === 0 ? (
              <div style={{ background: 'var(--forge-surface)', border: '1px solid var(--forge-border)', padding: 48, borderRadius: 2, textAlign: 'center' }}>
                <p style={{ ...S, fontSize: 20, fontWeight: 300, color: 'var(--forge-muted)', marginBottom: 8 }}>
                  Your Playbook is empty.
                </p>
                <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--forge-subtle)', marginBottom: 24 }}>
                  Insights and discipline lessons accumulate here automatically after you complete a debrief.
                </p>
                <button onClick={() => setActiveTab('run')} className="btn-ember">
                  Run a Debrief
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {debriefs.map((d) => {
                  const comp = commitments.find((c) => c.id === d.commitmentId)
                  const isExpanded = expandedDebriefId === d.id

                  return (
                    <div
                      key={d.id}
                      style={{
                        background: 'var(--forge-surface)',
                        border: '1px solid var(--forge-border)',
                        borderRadius: 2,
                        transition: 'border-color 0.2s',
                      }}
                    >
                      {/* HEADER SUMMARY CARD */}
                      <div
                        onClick={() => setExpandedDebriefId(isExpanded ? null : d.id)}
                        style={{
                          padding: 24,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-ember)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                            {comp ? `On Commitment: ${comp.title}` : 'General Debrief'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--forge-muted)' }}>
                            {formatDate(d.createdAt)} {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>

                        <p style={{ ...S, fontSize: '18px', fontStyle: 'italic', color: 'var(--forge-white)', lineHeight: 1.55, borderLeft: '2px solid var(--forge-ember)', paddingLeft: 16 }}>
                          &ldquo;{d.aiInsight}&rdquo;
                        </p>
                      </div>

                      {/* EXPANDABLE DETAILS */}
                      {isExpanded && (
                        <div
                          style={{
                            borderTop: '1px solid var(--forge-border)',
                            background: 'rgba(0,0,0,0.1)',
                            padding: 24,
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                              <p className="meta-label" style={{ fontSize: 9, color: 'var(--forge-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>What Happened</p>
                              <p style={{ fontSize: 13, color: 'var(--forge-white)', lineHeight: 1.6, fontWeight: 300 }}>{d.what}</p>
                            </div>
                            <div>
                              <p className="meta-label" style={{ fontSize: 9, color: 'var(--forge-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>What Went Well</p>
                              <p style={{ fontSize: 13, color: 'var(--forge-white)', lineHeight: 1.6, fontWeight: 300 }}>{d.well}</p>
                            </div>
                            <div style={{ marginTop: 12 }}>
                              <p className="meta-label" style={{ fontSize: 9, color: 'var(--forge-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Do Differently</p>
                              <p style={{ fontSize: 13, color: 'var(--forge-white)', lineHeight: 1.6, fontWeight: 300 }}>{d.differently}</p>
                            </div>
                            <div style={{ marginTop: 12 }}>
                              <p className="meta-label" style={{ fontSize: 9, color: 'var(--forge-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Core Self Lesson</p>
                              <p style={{ fontSize: 13, color: 'var(--forge-white)', lineHeight: 1.6, fontWeight: 300 }}>{d.lesson}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* LOCAL STYLES FOR THE DOT ANIMATIONS */}
      <style>{`
        .dot {
          width: 8px;
          height: 8px;
          background: var(--forge-ember);
          border-radius: 50%;
          animation: dp 1.4s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: .22s; }
        .dot:nth-child(3) { animation-delay: .44s; }
        @keyframes dp {
          0%, 80%, 100% { opacity: .2; transform: scale(.7); }
          40% { opacity: 1; transform: scale(1); }
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
        .answer-input:focus {
          border-bottom-color: var(--forge-ember) !important;
        }
      `}</style>
    </div>
  )
}

export default function DebriefPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forge-black)', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--forge-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>Initializing Debrief...</p>
      </div>
    }>
      <DebriefContent />
    </Suspense>
  )
}
