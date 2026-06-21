'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const revealRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.1 }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const addReveal = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  return (
    <>
      <style>{`
        .reveal{opacity:0;transform:translateY(20px);transition:opacity .75s ease,transform .75s ease}
        .reveal.in{opacity:1;transform:translateY(0)}
        .ember-glow{position:absolute;width:700px;height:700px;background:radial-gradient(ellipse,rgba(200,96,42,.13) 0%,transparent 68%);top:50%;left:50%;transform:translate(-50%,-52%);animation:pulse 5s ease-in-out infinite;pointer-events:none}
        @keyframes pulse{0%,100%{opacity:.55;transform:translate(-50%,-52%) scale(1)}50%{opacity:1;transform:translate(-50%,-52%) scale(1.08)}}
        .scroll-line{width:1px;height:44px;background:linear-gradient(to bottom,var(--forge-ember),transparent)}
        .module-card{background:var(--forge-surface);padding:48px 40px;transition:background .2s}
        .module-card:hover{background:var(--forge-card)}
        .q-row{display:flex;align-items:flex-start;gap:16px;padding:18px 22px;border:1px solid var(--forge-border);border-bottom:none;transition:background .2s}
        .q-row:hover{background:var(--forge-surface)}
        .nav-link{font-size:13px;letter-spacing:0.04em;color:var(--forge-muted);text-decoration:none;transition:color .2s}
        .nav-link:hover{color:var(--forge-white)}
        .nav-cta{font-size:13px;font-weight:500;letter-spacing:0.04em;color:var(--forge-black);background:var(--forge-white);padding:10px 22px;border-radius:2px;text-decoration:none;transition:all .2s}
        .nav-cta:hover{background:var(--forge-ember);color:var(--forge-white)}
        .btn-primary{display:inline-block;font-size:14px;font-weight:500;letter-spacing:0.04em;color:var(--forge-white);background:var(--forge-ember);padding:14px 34px;border-radius:2px;text-decoration:none;transition:opacity .2s}
        .btn-primary:hover{opacity:.82}
        .btn-ghost{font-size:14px;font-weight:300;letter-spacing:0.04em;color:var(--forge-muted);text-decoration:none;transition:color .2s}
        .btn-ghost:hover{color:var(--forge-white)}
        .contrast-row{display:grid;grid-template-columns:210px 48px 1fr;align-items:center;padding:16px 0;border-bottom:1px solid var(--forge-border)}
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',inset:'0 0 auto 0',zIndex:50,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px 48px',background:'linear-gradient(to bottom,var(--forge-black) 0%,transparent 100%)'}}>
        <span style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:500,letterSpacing:'0.32em',textTransform:'uppercase',color:'var(--forge-white)'}}>Forge</span>
        <div style={{display:'flex',alignItems:'center',gap:32}}>
          <Link href="/dashboard" className="nav-link">Sign in</Link>
          <Link href="/interview" className="nav-cta">Start interview</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'120px 48px 100px',position:'relative',overflow:'hidden'}}>
        <div className="ember-glow" />
        <p style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--forge-ember)',marginBottom:28,position:'relative'}}>Personal Accountability Platform</p>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(58px,10vw,136px)',fontWeight:300,lineHeight:.93,letterSpacing:'-.02em',color:'var(--forge-white)',marginBottom:28,position:'relative'}}>
          Become who<br/>you said <em style={{fontStyle:'italic',color:'var(--forge-ember)'}}>you would.</em>
        </h1>
        <p style={{fontFamily:'var(--font-body)',fontSize:16,fontWeight:300,color:'var(--forge-muted)',maxWidth:460,lineHeight:1.75,marginBottom:48,position:'relative'}}>
          Most people know what they want. Forge is built for the gap between knowing and actually becoming it.
        </p>
        <div style={{display:'flex',alignItems:'center',gap:24,position:'relative'}}>
          <Link href="/interview" className="btn-primary">Start your interview</Link>
          <a href="#what" className="btn-ghost">See how it works →</a>
        </div>
        <div style={{position:'absolute',bottom:44,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--forge-ember)'}}>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="what" style={{maxWidth:1180,margin:'0 auto',padding:'112px 48px',borderTop:'1px solid var(--forge-border)'}}>
        <div ref={addReveal} className="reveal">
          <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:56}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--forge-ember)',whiteSpace:'nowrap'}}>What is Forge</span>
            <div style={{flex:1,height:1,background:'var(--forge-border)'}} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 270px',gap:64,marginBottom:64}}>
            <div>
              <p style={{fontFamily:'var(--font-display)',fontSize:'clamp(20px,2.4vw,28px)',fontWeight:300,color:'var(--forge-muted)',lineHeight:1.3,marginBottom:14}}>Most tools help you plan.</p>
              <p style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,50px)',fontWeight:300,color:'var(--forge-white)',lineHeight:1.15}}>
                Forge helps you understand <em style={{fontStyle:'italic',color:'var(--forge-ember)'}}>why your plans keep breaking.</em>
              </p>
            </div>
            <div style={{background:'var(--forge-surface)',border:'1px solid var(--forge-border)',borderLeft:'2px solid var(--forge-ember)',padding:'28px 24px',marginTop:6}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:60,fontWeight:300,color:'var(--forge-ember)',lineHeight:1,marginBottom:14}}>73%</div>
              <p style={{fontSize:13,fontWeight:300,color:'var(--forge-muted)',lineHeight:1.7}}>of people break commitments to themselves within the first week. Most apps respond with a new streak. Forge asks what actually happened.</p>
            </div>
          </div>
          <div style={{borderTop:'1px solid var(--forge-border)',borderBottom:'1px solid var(--forge-border)',marginBottom:48}}>
            {[['Not a habit tracker','A commitment engine with real weight and real consequences'],['Not a journal','A pattern extractor that learns exactly how you fail'],['Not a productivity suite','An accountability OS built around your actual behavior']].map(([not,is])=>(
              <div key={not} className="contrast-row">
                <span style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.08em',color:'var(--forge-subtle)',textDecoration:'line-through',textDecorationColor:'var(--forge-border)'}}>{not}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:14,color:'var(--forge-ember)',textAlign:'center'}}>→</span>
                <span style={{fontSize:15,fontWeight:300,color:'var(--forge-white)'}}>{is}</span>
              </div>
            ))}
          </div>
          <p style={{fontFamily:'var(--font-display)',fontSize:'clamp(18px,2vw,23px)',fontWeight:300,color:'var(--forge-muted)',lineHeight:1.65,maxWidth:700}}>
            It&apos;s the system serious people use to hold themselves to account, extract real lessons from their own experience, and close the gap between intention and action — permanently.
          </p>
        </div>
      </section>

      {/* MODULES */}
      <section style={{maxWidth:1180,margin:'0 auto',padding:'112px 48px',borderTop:'1px solid var(--forge-border)'}}>
        <div ref={addReveal} className="reveal">
          <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:80,marginBottom:56}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--forge-ember)'}}>The Platform</span>
            <p style={{fontSize:15,fontWeight:300,color:'var(--forge-muted)',lineHeight:1.75}}>Four modules. One loop. You make commitments, track what breaks them, debrief what happens, and stress-test your next move before committing to it.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,background:'var(--forge-border)',border:'1px solid var(--forge-border)'}}>
            {[{n:'01',name:'Commit',tag:'Commitment Ledger',desc:"Make commitments with real structure — what you'll do, what done looks like, and what it costs to break it. Your word to yourself, made concrete."},{n:'02',name:'Track',tag:'Friction Map',desc:'Log friction in seconds whenever something derails your plan. Over time, Forge maps your patterns and shows you exactly where you keep getting stuck.'},{n:'03',name:'Debrief',tag:'Debrief Engine',desc:"After every commitment ends, Forge walks you through a structured reflection. Your lessons accumulate into a personal Playbook built entirely from your own experience."},{n:'04',name:'Challenge',tag:'Idea Stress-Tester',desc:'Bring an idea, a plan, or a decision. Forge challenges it like a rigorous skeptic — so you think five steps ahead before committing to anything.'}].map(m=>(
              <div key={m.n} className="module-card">
                <div style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.16em',color:'var(--forge-ember)',marginBottom:22}}>{m.n}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:34,fontWeight:400,color:'var(--forge-white)',lineHeight:1,marginBottom:14}}>{m.name}</div>
                <p style={{fontSize:14,fontWeight:300,color:'var(--forge-muted)',lineHeight:1.75,marginBottom:24}}>{m.desc}</p>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--forge-subtle)',border:'1px solid var(--forge-border)',padding:'4px 10px',display:'inline-block'}}>{m.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL */}
      <section style={{maxWidth:1180,margin:'0 auto',padding:'112px 48px',borderTop:'1px solid var(--forge-border)'}}>
        <div ref={addReveal} className="reveal" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--forge-ember)',display:'block',marginBottom:20}}>Your Circle</span>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(30px,3.6vw,50px)',fontWeight:300,lineHeight:1.2,color:'var(--forge-white)',marginBottom:20}}>Growth is more honest with witnesses.</h2>
            <p style={{fontSize:15,fontWeight:300,color:'var(--forge-muted)',lineHeight:1.75,marginBottom:14}}>Your Forge Score reflects real integrity — not how many habits you tracked, but how closely your actions actually match your commitments.</p>
            <p style={{fontSize:15,fontWeight:300,color:'var(--forge-muted)',lineHeight:1.75}}>Connect with people working on the same things. The inner work stays private. Only the signal is social.</p>
          </div>
          <div style={{background:'var(--forge-surface)',border:'1px solid var(--forge-border)',padding:36}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,background:'var(--forge-border)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:13,color:'var(--forge-muted)'}}>E</div>
                <div>
                  <div style={{fontSize:14,fontWeight:400,color:'var(--forge-white)',marginBottom:2}}>Emmanuel</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.1em',color:'var(--forge-muted)'}}>Lagos, Nigeria</div>
                </div>
              </div>
              <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.12em',color:'var(--forge-ember)',border:'1px solid var(--forge-ember-dim)',padding:'4px 10px'}}>Active</span>
            </div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--forge-muted)',marginBottom:6}}>Forge Score</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:76,fontWeight:300,color:'var(--forge-white)',lineHeight:1,marginBottom:20}}>74<sup style={{fontSize:24,color:'var(--forge-muted)',verticalAlign:'super'}}>/100</sup></div>
            <div style={{height:2,background:'var(--forge-border)',marginBottom:28,position:'relative'}}>
              <div style={{position:'absolute',inset:'0 auto 0 0',width:'74%',background:'var(--forge-ember)'}} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {[['Commitments','23'],['Follow-through','78%'],['Debriefs','18']].map(([l,v])=>(
                <div key={l}>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.1em',color:'var(--forge-muted)',marginBottom:4}}>{l}</div>
                  <div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:400,color:'var(--forge-white)'}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTERVIEW PREVIEW */}
      <section style={{maxWidth:1180,margin:'0 auto',padding:'112px 48px',borderTop:'1px solid var(--forge-border)'}}>
        <div ref={addReveal} className="reveal" style={{textAlign:'center'}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--forge-ember)',display:'block',marginBottom:16}}>Onboarding</span>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(34px,4.5vw,60px)',fontWeight:300,lineHeight:1.18,color:'var(--forge-white)',marginBottom:18}}>Forge learns who you are first.</h2>
          <p style={{fontSize:15,fontWeight:300,color:'var(--forge-muted)',maxWidth:500,margin:'0 auto 52px',lineHeight:1.75}}>Before you see a single feature, Forge interviews you. Your answers shape your dashboard, your modules, and how Forge speaks to you — permanently.</p>
          <div style={{maxWidth:580,margin:'0 auto 56px',textAlign:'left'}}>
            {[['01','What are you trying to become in the next 12 months?'],['02','Where do your plans most often fall apart?'],['03','When you break a promise to yourself, what usually happens next?'],['04','What does accountability actually mean to you, honestly?']].map(([n,q])=>(
              <div key={n} className="q-row"><span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.12em',color:'var(--forge-ember)',paddingTop:3,minWidth:20}}>{n}</span><span style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:300,fontStyle:'italic',color:'var(--forge-muted)',lineHeight:1.4}}>{q}</span></div>
            ))}
            <div style={{height:1,background:'var(--forge-border)'}} />
          </div>
          <Link href="/interview" className="btn-primary">Begin the interview</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{maxWidth:1180,margin:'0 auto',padding:'112px 48px',borderTop:'1px solid var(--forge-border)'}}>
        <div ref={addReveal} className="reveal" style={{textAlign:'center'}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--forge-ember)',display:'block',marginBottom:16}}>Get started</span>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(48px,8vw,108px)',fontWeight:300,lineHeight:.95,color:'var(--forge-white)',marginBottom:28}}>
            The gap doesn&apos;t<br/>close <em style={{fontStyle:'italic',color:'var(--forge-ember)'}}>by itself.</em>
          </h2>
          <p style={{fontFamily:'var(--font-mono)',fontSize:12,letterSpacing:'0.12em',color:'var(--forge-muted)',marginBottom:44}}>No credit card. No tutorials. Just the interview.</p>
          <Link href="/interview" className="btn-primary">Start your interview</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{maxWidth:1180,margin:'0 auto',padding:'36px 48px',borderTop:'1px solid var(--forge-border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--forge-muted)'}}>Forge</span>
        <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.1em',color:'var(--forge-subtle)'}}>&copy; 2026 Forge. All rights reserved.</span>
      </footer>
    </>
  )
}
