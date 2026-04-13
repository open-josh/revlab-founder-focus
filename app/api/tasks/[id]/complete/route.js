import { NextResponse } from 'next/server'
import db from '../../../../../server/db'
import { getSession } from '../../../../../server/auth'

export async function POST(req, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  db.completeTask(params.id, session.userId)
  return NextResponse.json({ ok: true })
}
