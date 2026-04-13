import { getSession } from './server/auth'
import db from './server/db'
import Dashboard from './dashboard-client'

export const dynamic = 'force-dynamic'

function calcPriority(tasks, energy) {
  return tasks
    .filter(t => !t.completed)
    .map(t => {
      let urgency = 5 // default mid
      if (t.deadline) {
        const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / 86400000)
        urgency = daysLeft <= 0 ? 10 : Math.min(10, Math.round(10 - daysLeft))
      }
      const energyMatch = t.energy_required <= energy ? 1 : 0.4
      const score = ((t.impact * 2 + urgency) / t.effort) * energyMatch
      return { ...t, score: Math.round(score * 10) / 10, urgency }
    })
    .sort((a, b) => b.score - a.score)
}

export default async function Home() {
  const session = await getSession()
  if (!session) return <Landing />

  const user = db.getUserById(session.userId)
  if (!user) return <Landing />

  const tasks = db.getAllTasks(session.userId)
  const active = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  // Default energy for new users
  const energy = 7

  const prioritized = calcPriority(active, energy)
  const hero = prioritized[0] || null
  const rest = prioritized.slice(1, 8)

  return (
    <Dashboard
      user={{ id: user.id, email: user.email }}
      hero={hero}
      rest={rest}
      energy={energy}
      taskCount={active.length}
    />
  )
}

function Landing() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Founder Focus
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 17, marginBottom: 32, lineHeight: 1.7 }}>
          You have 47 tasks. It's 9am. Your brain is at 60%.<br />
          What should you actually work on first?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <a href="/auth/signup">
            <button style={{ fontSize: 16, padding: '12px 28px' }}>Start for free</button>
          </a>
          <a href="/auth/login">
            <button className="btn-ghost" style={{ fontSize: 16, padding: '12px 28px' }}>Sign in</button>
          </a>
        </div>
        <div style={{ textAlign: 'left', display: 'grid', gap: 14 }}>
          {[
            ['⚡', 'Energy-aware prioritization', 'Tasks are matched to how much brain power you have right now'],
            ['📋', 'One prioritized list', 'No more staring at a flat to-do list for 20 minutes'],
            ['🚫', 'No account juggling', 'Works with your existing tools — just paste your tasks'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 32, color: 'var(--text-dim)', fontSize: 13 }}>
          Built for solo founders and indie hackers. No integrations required.
        </p>
      </div>
    </main>
  )
}
