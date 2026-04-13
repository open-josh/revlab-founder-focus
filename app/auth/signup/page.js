'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) router.push('/')
    else {
      const d = await res.json()
      setError(d.error || 'Failed')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>Create account</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Start focusing on what matters</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@startup.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8+ characters" required minLength={8} />
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, padding: '8px 12px', background: '#FEF2F2', borderRadius: 6 }}>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-dim)', fontSize: 13 }}>
          Have an account? <a href="/auth/login">Sign in</a>
        </p>
      </div>
    </main>
  )
}
