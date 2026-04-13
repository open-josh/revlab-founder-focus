import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '../../../server/db'
import { signToken } from '../../../server/auth'

export async function POST(req) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'required' }, { status: 400 })

  const user = db.getUserByEmail(email)
  if (!user) return NextResponse.json({ error: 'invalid' }, { status: 401 })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return NextResponse.json({ error: 'invalid' }, { status: 401 })

  const token = await signToken({ userId: user.id, email: user.email })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60*60*24*30, path: '/' })
  return res
}
