import { NextResponse } from 'next/server'
import db from '../../../server/db'
import { getSession } from '../../../server/auth'

function calcPriority(tasks, energy) {
  return tasks
    .filter(t => !t.completed)
    .map(t => {
      let urgency = 5
      if (t.deadline) {
        const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / 86400000)
        urgency = daysLeft <= 0 ? 10 : Math.min(10, Math.round(10 - daysLeft))
      }
      const energyMatch = t.energy_required <= energy ? 1 : 0.3
      const score = ((t.impact * 2 + urgency) / t.effort) * energyMatch
      return { ...t, score: Math.round(score * 10) / 10, urgency }
    })
    .sort((a, b) => b.score - a.score)
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { energy } = await req.json()
  const tasks = db.getTasks(session.userId)
  const prioritized = calcPriority(tasks, energy || 7)

  return NextResponse.json({
    hero: prioritized[0] || null,
    rest: prioritized.slice(1, 8)
  })
}
