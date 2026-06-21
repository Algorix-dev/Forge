'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForgeStore } from '@/lib/store'

const QUESTIONS = [
  { id: 'name',    text: "First — what's your name?",                                             type: 'text', ph: 'Your name' },
  { id: 'goal',    text: 'What are you working toward in the next 12 months?',                    type: 'text', ph: 'Be specific. Vague goals get vague results.' },
  { id: 'role',    text: 'What role best describes where you are right now?',                     type: 'role' },
  { id: 'failure', text: "When you set a goal and don't follow through, what usually happens?",   type: 'text', ph: 'Be honest. This is where it gets useful.' },
  { id: 'goodweek',text: 'What does a good week look like for you when things are going well?',  type: 'text', ph: 'Walk me through it.' },
  { id: 'friction',text: 'Where do your plans most often fall apart?',                           type: 'text', ph: 'The recurring breaking point.' },
  { id: 'account', text: 'What does accountability mean to you, honestly?',                      type: 'text', ph: "Not what it should mean — what it actually means to you." },
]

const ROLES = ['Student', 'Professional', 'Founder', 'Creator', 'Other']

type Screen = 'intro' | 'question' | 'processing' | 'profile'

interface Profile {
  archetype: string
  reflection: string
  insight: string
  modules: string[]
  moduleReason: string
}

async function callClaude(system: string, user: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text?.trim() || ''
}

export default function InterviewPage() {
  const router = useRouter()
  const setUser = useForgeStore((s) => s.setUser)

  const [screen, setScreen]       = useState<Screen>('intro')
  const [qi, setQi]               = useState(0)
  const [answers, setAnswers]     = useState<Record<string, string>>({})
  const [selRole, setSelRole]     = useState<string | null>(null)
  const [inputVal, setInputVal]   = useState('')
  const [displayedQ, setDisplayedQ] = useState('')
  const [typing, setTyping]       = useState(false)
  const [ack, setAck]             = useState('')
  const [showAck, setShowAck]     = useState(false)
  const [waiting, setWaiting]     = useState(false)
  const [error, setError]         = useState('')
  const [profile, setProfile]     = useState<Profile | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const q = QUESTIONS[qi]

  /* Typewriter */
  const typewrite = useCallback((text: string, cb?: () => void) => {
    setTyping(true)
    setDisplayedQ('')
    let i = 0
    const tick = () => {
      if (i <= text.length) {
        setDisplayedQ(text.slice(0, i))
        i++
        setTimeout(tick, 28)
      } else {
        setTyping(false)
        cb?.()
      }
    }
    tick()
  }, [])

  /* Load question */
  useEffect(() => {
    if (screen !== 'question') return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional UI reset when navigating between questions
    setInputVal('')
    setSelRole(null)
    setAck('')
    setShowAck(false)
    setError('')
    typewrite(q.text, () => {
      if (q.type !== 'role') setTimeout(() => textareaRef.current?.focus(), 80)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, screen])

  const handleContinue = async () => {
    if (typing || waiting) return

    /* Validate */
    if (q.type === 'role' && !selRole) { setError('Please select a role to continue.'); return }
    if (q.type === 'text' && !inputVal.trim()) { setError('Please enter an answer before continuing.'); return }

    const ans = q.type === 'role' ? selRole! : inputVal.trim()
    const newAnswers = { ...answers, [q.id]: ans }
    setAnswers(newAnswers)

    /* Last question → generate profile */
    if (qi === QUESTIONS.length - 1) {
      setScreen('processing')
      const qa = QUESTIONS.map((qq) => `Q: ${qq.text}\nA: ${newAnswers[qq.id] || '—'}`).join('\n\n')
      try {
        const raw = await callClaude(
          `You are Forge's intelligence engine. Analyze interview answers and return ONLY valid JSON — no markdown, no backticks. Exact structure:
{"archetype":"2-4 word type in ALL CAPS like THE AMBITIOUS STARTER","reflection":"One sharp sentence reflecting them back accurately — makes them feel seen, not flattered","insight":"One sentence naming their core challenge","modules":["Module1","Module2","Module3"],"moduleReason":"One sentence on why these modules in this order"}
Modules from: Commit, Track, Debrief, Challenge. Order by what they need most.`, qa)
        const p = JSON.parse(raw.replace(/```json|```/g, '').trim()) as Profile
        setProfile(p)
        /* Save to store */
        setUser({
          name: newAnswers.name || 'You',
          archetype: p.archetype,
          reflection: p.reflection,
          insight: p.insight,
          modules: p.modules,
          moduleReason: p.moduleReason,
          role: newAnswers.role || '',
          interviewAnswers: newAnswers,
          forgeScore: 0,
          commitments: [],
          frictionLogs: [],
          debriefs: [],
          onboarded: true,
          joinedAt: new Date().toISOString(),
        })
      } catch {
        const fallback: Profile = {
          archetype: 'THE DETERMINED BUILDER',
          reflection: 'You know exactly what you want — the gap is in the follow-through.',
          insight: 'Your core challenge is staying committed when initial momentum fades.',
          modules: ['Commit', 'Track', 'Debrief'],
          moduleReason: 'Build real commitment structure first, then learn what breaks it.',
        }
        setProfile(fallback)
        setUser({ name: newAnswers.name || 'You', ...fallback, role: newAnswers.role || '', interviewAnswers: newAnswers, forgeScore: 0, commitments: [], frictionLogs: [], debriefs: [], onboarded: true, joinedAt: new Date().toISOString() })
      }
      setScreen('profile')
      return
    }

    /* Acknowledgment (skip for name) */
    if (q.id !== 'name') {
      setWaiting(true)
      const text = await callClaude(
        'You are Forge — a serious personal accountability platform. The user just answered an onboarding question. Give a single-sentence response under 18 words. Be direct and perceptive. Never say "Great", "Thanks", or anything sycophantic. No full stop at the end.',
        `Q: "${q.text}"\nA: "${ans}"`
      ).catch(() => '')
      if (text) { setAck(text); setShowAck(true); await new Promise(r => setTimeout(r, 2000)) }
      setShowAck(false)
      setWaiting(false)
      await new Promise(r => setTimeout(r, 280))
    }

    setQi((prev) => prev + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !waiting) { e.preventDefault(); handleContinue() }
  }

  const S = { fontFamily: 'var(--font-display)' }

  return (
    <>
      <style>{`
        body{overflow:hidden}
        .screen{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:100px 48px 48px;opacity:0;pointer-events:none;transition:opacity .45s ease}
        .screen.active{opacity:1;pointer-events:all}
        .cursor-blink{display:inline-block;width:2px;height:.9em;background:var(--forge-ember);vertical-align:text-bottom;margin-left:3px;animation:blink .75s step-end infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .dot{width:6px;height:6px;background:var(--forge-ember);border-radius:50%;animation:dp 1.4s ease-in-out infinite}
        .dot:nth-child(2){animation-delay:.22s}
        .dot:nth-child(3){animation-delay:.44s}
        @keyframes dp{0%,80%,100%{opacity:.2;transform:scale(.7)}40%{opacity:1;transform:scale(1)}}
        .role-btn{font-family:var(--font-mono);font-size:12px;letter-spacing:.1em;color:var(--forge-muted);background:transparent;border:1px solid var(--forge-border);padding:10px 22px;border-radius:2px;cursor:pointer;transition:all .2s}
        .role-btn:hover{border-color:var(--forge-muted);color:var(--forge-white)}
        .role-btn.sel{border-color:var(--forge-ember);color:var(--forge-ember);background:rgba(200,96,42,.06)}
        .answer-input{width:100%;background:transparent;border:none;border-bottom:1px solid var(--forge-border);color:var(--forge-white);font-family:var(--font-body);font-size:16px;font-weight:300;line-height:1.7;padding:14px 0;resize:none;outline:none;min-height:90px;transition:border-color .2s}
        .answer-input::placeholder{color:var(--forge-subtle)}
        .answer-input:focus{border-bottom-color:var(--forge-ember)}
        .ack{font-style:italic;color:var(--forge-muted);opacity:0;transition:opacity .5s;flex:1;line-height:1.5}
        .ack.show{opacity:1}
        .ack::before{content:'↳ ';color:var(--forge-ember);font-style:normal}
        .btn-cont{font-family:var(--font-mono);font-size:12px;letter-spacing:.1em;color:var(--forge-muted);background:transparent;border:1px solid var(--forge-border);padding:12px 26px;border-radius:2px;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
        .btn-cont:hover:not(:disabled){border-color:var(--forge-ember);color:var(--forge-white)}
        .btn-cont:disabled{opacity:.28;cursor:default}
        .nav-logo{font-family:var(--font-display);font-size:20px;font-weight:500;letter-spacing:.32em;text-transform:uppercase;color:var(--forge-white);text-decoration:none}
        .profile-mod{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:var(--forge-ember);border:1px solid var(--forge-ember-dim);padding:6px 14px;border-radius:2px}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',inset:'0 0 auto 0',padding:'28px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:10}}>
        <Link href="/" className="nav-logo">Forge</Link>
        <div style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'.14em',color:'var(--forge-muted)',opacity:screen==='question'?1:0,transition:'opacity .4s'}}>
          {qi + 1} / {QUESTIONS.length}
        </div>
      </nav>

      {/* INTRO */}
      <div className={`screen ${screen==='intro'?'active':''}`}>
        <p style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--forge-ember)',marginBottom:28}}>The Interview</p>
        <h1 style={{...S,fontSize:'clamp(46px,7vw,86px)',fontWeight:300,lineHeight:.95,letterSpacing:'-.02em',color:'var(--forge-white)',textAlign:'center',marginBottom:28}}>
          Before anything<br/>else — <em style={{fontStyle:'italic',color:'var(--forge-ember)'}}>who are you?</em>
        </h1>
        <p style={{fontSize:15,fontWeight:300,color:'var(--forge-muted)',textAlign:'center',maxWidth:360,lineHeight:1.75,marginBottom:52}}>
          Seven questions. No right answers. Forge only works if you&apos;re honest.
        </p>
        <button onClick={()=>setScreen('question')}
                style={{fontFamily:'var(--font-body)',fontSize:14,fontWeight:500,letterSpacing:'.05em',color:'var(--forge-white)',background:'var(--forge-ember)',border:'none',padding:'14px 40px',borderRadius:2,cursor:'pointer',opacity:1,transition:'opacity .2s'}}
                onMouseEnter={e=>(e.currentTarget.style.opacity='.82')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
          Begin →
        </button>
      </div>

      {/* QUESTION */}
      <div className={`screen ${screen==='question'?'active':''}`}>
        <div style={{width:'100%',maxWidth:640}}>
          <div style={{...S,fontSize:'clamp(26px,4.2vw,50px)',fontWeight:300,lineHeight:1.18,color:'var(--forge-white)',marginBottom:44,minHeight:110}}>
            {displayedQ}
            {typing && <span className="cursor-blink" />}
          </div>

          {q?.type==='role' ? (
            <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:44}}>
              {ROLES.map(r=>(
                <button key={r} className={`role-btn ${selRole===r?'sel':''}`} onClick={()=>{setSelRole(r);setError('')}}>{r}</button>
              ))}
            </div>
          ) : (
            <textarea ref={textareaRef} className="answer-input" placeholder={q?.ph||'Type your answer...'} value={inputVal}
                      onChange={e=>{setInputVal(e.target.value);setError('')}} onKeyDown={handleKeyDown} rows={4} />
          )}

          {error && <p style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.08em',color:'var(--forge-ember-dim)',marginTop:10}}>{error}</p>}

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:28,gap:24}}>
            <p className={`ack ${showAck?'show':''}`} style={{fontFamily:'var(--font-display)',fontSize:16}}>{ack}</p>
            <button className="btn-cont" onClick={handleContinue} disabled={waiting}>
              {waiting ? '· · ·' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>

      {/* PROCESSING */}
      <div className={`screen ${screen==='processing'?'active':''}`}>
        <p style={{...S,fontSize:'clamp(24px,3.5vw,40px)',fontWeight:300,color:'var(--forge-white)',textAlign:'center',lineHeight:1.3,marginBottom:48}}>
          Forge is reading<br/>your answers.
        </p>
        <div style={{display:'flex',gap:10}}>
          <div className="dot"/><div className="dot"/><div className="dot"/>
        </div>
      </div>

      {/* PROFILE */}
      <div className={`screen ${screen==='profile'?'active':''}`} style={{overflowY:'auto'}}>
        {profile && (
          <div style={{width:'100%',maxWidth:600}}>
            <p style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'var(--forge-ember)',marginBottom:18}}>Your Profile</p>
            <div style={{height:1,background:'var(--forge-border)',marginBottom:36}} />
            {answers.name && <p style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--forge-muted)',marginBottom:8}}>— {answers.name}</p>}
            <div style={{...S,fontSize:'clamp(30px,5vw,52px)',fontWeight:400,letterSpacing:'.04em',textTransform:'uppercase',color:'var(--forge-white)',lineHeight:1,marginBottom:28}}>{profile.archetype}</div>
            <div style={{...S,fontSize:'clamp(17px,2vw,22px)',fontWeight:300,fontStyle:'italic',color:'var(--forge-muted)',lineHeight:1.55,paddingLeft:20,borderLeft:'2px solid var(--forge-ember)',marginBottom:20}}>
              &ldquo;{profile.reflection}&rdquo;
            </div>
            <p style={{fontSize:14,fontWeight:300,color:'var(--forge-muted)',lineHeight:1.75,marginBottom:36}}>{profile.insight}</p>
            <p style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--forge-muted)',marginBottom:14}}>Your Forge starts with</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
              {profile.modules.map((m,i)=>(
                <div key={m} className="profile-mod">{['①','②','③'][i]||''} {m}</div>
              ))}
            </div>
            <p style={{fontSize:13,fontWeight:300,color:'var(--forge-subtle)',lineHeight:1.65,marginBottom:44}}>{profile.moduleReason}</p>
            <button onClick={()=>router.push('/dashboard')}
                    style={{fontFamily:'var(--font-body)',fontSize:14,fontWeight:500,letterSpacing:'.04em',color:'var(--forge-white)',background:'var(--forge-ember)',border:'none',padding:'14px 36px',borderRadius:2,cursor:'pointer',opacity:1,transition:'opacity .2s'}}
                    onMouseEnter={e=>(e.currentTarget.style.opacity='.82')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
              Enter Forge →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
