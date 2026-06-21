'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useForgeStore } from '@/lib/store'
import { calcForgeScore } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const user = useForgeStore((s) => s.user)

  if (!user) return null

  // Calculate real-time Forge Score from user commitments and debriefs
  const score = calcForgeScore(user.commitments || [], user.debriefs || [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
    { href: '/commit', label: 'Commit', icon: '◈' },
    { href: '/track', label: 'Track', icon: '◎' },
    { href: '/debrief', label: 'Debrief', icon: '◇' },
    { href: '/challenge', label: 'Challenge', icon: '◆' },
    { href: '/profile', label: 'Profile', icon: '◈' }, // Expose Profile & Settings
  ]

  return (
    <>
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 2px;
          text-decoration: none;
          transition: all 0.15s;
          color: var(--forge-muted);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .sidebar-link:hover {
          background: var(--forge-card);
          color: var(--forge-white);
        }
        .sidebar-link.active {
          background: var(--forge-card);
          color: var(--forge-white);
          border-left: 2px solid var(--forge-ember);
          padding-left: 14px;
        }
      `}</style>

      <aside
        style={{
          width: 220,
          borderRight: '1px solid var(--forge-border)',
          padding: '32px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          inset: '0 auto 0 0',
          background: 'var(--forge-black)',
          zIndex: 40,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '.32em',
            textTransform: 'uppercase',
            color: 'var(--forge-white)',
            padding: '0 16px',
            marginBottom: 40,
          }}
        >
          Forge
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map((item) => {
            // Match sub-routes (e.g. /commit/[id] should activate /commit)
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Dynamic score widget */}
        <div
          style={{
            padding: 16,
            background: 'var(--forge-surface)',
            border: '1px solid var(--forge-border)',
            borderRadius: 2,
            marginTop: 'auto',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: 'var(--forge-muted)',
              marginBottom: 6,
            }}
          >
            Forge Score
          </p>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 300,
              color: 'var(--forge-white)',
              lineHeight: 1,
              marginBottom: 10,
            }}
          >
            {score}
            <span style={{ fontSize: 16, color: 'var(--forge-muted)' }}>/100</span>
          </div>
          <div style={{ height: 2, background: 'var(--forge-border)', borderRadius: 1 }}>
            <div
              style={{
                height: '100%',
                background: 'var(--forge-ember)',
                borderRadius: 1,
                width: `${score}%`,
                transition: 'width 1s ease',
              }}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
