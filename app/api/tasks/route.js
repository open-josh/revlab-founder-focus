import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import db from '../../server/db'
import { getSession } from '../../server/auth'

export async function POST(req) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, deadline, effort, impact, energy_required, context } = await req.json()
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const id = nanoid()
  const task = {
    id,
    user_id: session.userId,
    title,
    deadline: deadline || null,
    effort: effort || 3,
    impact: impact || 3,
    energy_required: energy_required || 5,
    context: context || '',
    completed: false,
    created_at: Date.now()
  }

  db.createTask(task)

  // Calculate score
  let urgency = 5
  if (deadline) {
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / 86400000)
    urgency = daysLeft <= 0 ? 10 : Math.min(10, Math.round(10 - daysLeft))
  }
  const score = Math.round(((impact * 2 + urgency) / (effort || 3)) * 10) / 10

  return NextResponse.json({ task: { ...task, score, urgency }, score })
}
