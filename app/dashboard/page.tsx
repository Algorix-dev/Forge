'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForgeStore } from '@/lib/store'
import { formatDate, daysUntil } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'

export default function DashboardPage() {
  const router = useRouter()
  const user = useForgeStore((s) => s.user)

  useEffect(() => {
    if (!user?.onboarded) router.replace('/interview')
  }, [user, router])

  if (!user) return null

  const active = user.commitments.filter((c) => c.status === 'active')
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <>
      <style>{`
        .sidebar-link{display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:2px;text-decoration:none;transition:background .15s;color:var(--forge-muted);font-family:var(--font-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase}
        .sidebar-link:hover{background:var(--forge-card);color:var(--forge-white)}
        .sidebar-link.active{background:var(--forge-card);color:var(--forge-white)}
        .commit-card{background:var(--forge-card);border:1px solid var(--forge-border);padding:24px;border-radius:2px;transition:border-color .2s}
        .commit-card:hover{border-color:var(--forge-subtle)}
        .checkin-btn{font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:var(--forge-muted);background:transparent;border:1px solid var(--forge-border);padding:8px 18px;border-radius:2px;cursor:pointer;transition:all .2s}
        .checkin-btn:hover{border-color:var(--forge-ember);color:var(--forge-ember)}
        .module-btn{display:flex;flex-direction:column;gap:8px;background:var(--forge-surface);border:1px solid var(--forge-border);padding:24px;border-radius:2px;text-decoration:none;transition:all .2s;cursor:pointer}
        .module-btn:hover{background:var(--forge-card);border-color:var(--forge-subtle)}
      `}</style>

      <div style={{display:'flex',minHeight:'100vh',background:'var(--forge-black)'}}>

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <main style={{marginLeft:220,flex:1,padding:'48px 56px',maxWidth:900}}>

          {/* HEADER */}
          <div style={{marginBottom:56}}>
            <p style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--forge-ember)',marginBottom:10}}>
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'clamp(32px,4vw,52px)',fontWeight:300,color:'var(--forge-white)',lineHeight:1.1,marginBottom:8}}>
              {greeting}, {user.name}.
            </h1>
            <p style={{fontSize:14,fontWeight:300,color:'var(--forge-muted)',lineHeight:1.6,maxWidth:500}}>
              {user.reflection}
            </p>
          </div>

          {/* DAILY CHECK-IN */}
          <div style={{background:'var(--forge-surface)',border:'1px solid var(--forge-border)',borderLeft:'2px solid var(--forge-ember)',padding:'24px 28px',marginBottom:40,borderRadius:2}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <p style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--forge-ember)',marginBottom:6}}>Daily Check-in</p>
                <p style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:300,color:'var(--forge-white)'}}>
                  How are you showing up today?
                </p>
              </div>
              <div style={{display:'flex',gap:8}}>
                {['Strong','Okay','Struggling'].map(opt=>(
                  <button key={opt} className="checkin-btn">{opt}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE COMMITMENTS */}
          <section style={{marginBottom:48}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:300,color:'var(--forge-white)'}}>Active Commitments</h2>
              <Link href="/commit" style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--forge-ember)',textDecoration:'none'}}>
                + New
              </Link>
            </div>

            {active.length === 0 ? (
              <div style={{background:'var(--forge-surface)',border:'1px solid var(--forge-border)',padding:40,borderRadius:2,textAlign:'center'}}>
                <p style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:300,color:'var(--forge-muted)',marginBottom:8}}>No active commitments.</p>
                <p style={{fontSize:13,fontWeight:300,color:'var(--forge-subtle)',marginBottom:24}}>A commitment gives everything else in Forge context.</p>
                <Link href="/commit" style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'.1em',color:'var(--forge-white)',background:'var(--forge-ember)',padding:'10px 24px',borderRadius:2,textDecoration:'none'}}>
                  Make your first commitment
                </Link>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {active.map((c) => (
                  <div key={c.id} className="commit-card">
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
                      <div>
                        <p style={{fontSize:16,fontWeight:400,color:'var(--forge-white)',marginBottom:4}}>{c.title}</p>
                        <p style={{fontSize:13,fontWeight:300,color:'var(--forge-muted)'}}>{c.why}</p>
                      </div>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.1em',color:daysUntil(c.deadline)<3?'var(--forge-ember)':'var(--forge-muted)',whiteSpace:'nowrap',marginLeft:16}}>
                        {daysUntil(c.deadline)}d left
                      </span>
                    </div>
                    <div style={{height:2,background:'var(--forge-border)',borderRadius:1}}>
                      <div style={{height:'100%',background:'var(--forge-ember)',borderRadius:1,width:`${c.progress}%`,transition:'width .5s ease'}} />
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.08em',color:'var(--forge-subtle)'}}>Due {formatDate(c.deadline)}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.08em',color:'var(--forge-muted)'}}>{c.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* QUICK ACCESS MODULES */}
          <section style={{marginBottom:48}}>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:300,color:'var(--forge-white)',marginBottom:20}}>Your Modules</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
              {[
                { href:'/commit',   n:'01', name:'Commit',   sub:'Make a new commitment' },
                { href:'/track',    n:'02', name:'Track',    sub:'Log a friction point' },
                { href:'/debrief',  n:'03', name:'Debrief',  sub:'Reflect on what happened' },
                { href:'/challenge',n:'04', name:'Challenge',sub:'Stress-test an idea' },
              ].map(m=>(
                <Link key={m.href} href={m.href} className="module-btn">
                  <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.14em',color:'var(--forge-ember)'}}>{m.n}</span>
                  <span style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:300,color:'var(--forge-white)'}}>{m.name}</span>
                  <span style={{fontSize:13,fontWeight:300,color:'var(--forge-muted)'}}>{m.sub}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* RECENT FRICTION */}
          {user.frictionLogs.length > 0 && (
            <section>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:300,color:'var(--forge-white)'}}>Recent Friction</h2>
                <Link href="/track" style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--forge-muted)',textDecoration:'none'}}>View all</Link>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:1,border:'1px solid var(--forge-border)'}}>
                {user.frictionLogs.slice(0,3).map((log) => (
                  <div key={log.id} style={{background:'var(--forge-surface)',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <p style={{fontSize:14,fontWeight:300,color:'var(--forge-white)'}}>{log.description}</p>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.08em',color:'var(--forge-muted)',whiteSpace:'nowrap',marginLeft:16}}>{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      </div>
    </>
  )
}
