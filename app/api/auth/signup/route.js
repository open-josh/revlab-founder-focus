import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import db from '../../../server/db'
import { signToken } from '../../../server/auth'

export async function POST(req) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'required' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'min 8 chars' }, { status: 400 })

  if (db.getUserByEmail(email)) return NextResponse.json({ error: 'already registered' }, { status: 409 })

  const id = nanoid()
  const hash = await bcrypt.hash(password, 10)
  db.createUser({ id, email, password_hash: hash, created_at: Date.now() })

  const token = await signToken({ userId: id, email })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60*60*24*30, path: '/' })
  return res
}
