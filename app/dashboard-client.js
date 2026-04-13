'use client'

import { useState } from 'react'

export default function Dashboard({ user, hero, rest, energy: initialEnergy, taskCount }) {
  const [energy, setEnergy] = useState(initialEnergy)
  const [tasks, setTasks] = useState(rest)
  const [heroTask, setHeroTask] = useState(hero)
  const [showAdd, setShowAdd] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', deadline: '', effort: 3, impact: 3, energy_required: 5, context: '' })
  const [completing, setCompleting] = useState(null)

  async function updateEnergy(e) {
    setEnergy(parseInt(e.target.value))
    // Recalculate via API
    const res = await fetch('/api/tasks/prioritize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ energy: parseInt(e.target.value) })
    })
    if (res.ok) {
      const data = await res.json()
      setHeroTask(data.hero)
      setTasks(data.rest)
    }
  }

  async function addTask(e) {
    e.preventDefault()
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
    if (res.ok) {
      const data = await res.json()
      const t = data.task
      t.score = data.score
      if (heroTask && t.score > heroTask.score) {
        setHeroTask(t)
      } else {
        setTasks(prev => [...prev, t].sort((a, b) => b.score - a.score))
      }
      setShowAdd(false)
      setNewTask({ title: '', deadline: '', effort: 3, impact: 3, energy_required: 5, context: '' })
    }
  }

  async function completeTask(id) {
    setCompleting(id)
    await fetch(`/api/tasks/${id}/complete`, { method: 'POST' })
    setHeroTask(tasks.find(t => t.id === id) || null)
    setTasks(prev => prev.filter(t => t.id !== id))
    setCompleting(null)
  }

  const energyLabel = energy <= 3 ? 'Exhausted' : energy <= 5 ? 'Low' : energy <= 7 ? 'Moderate' : 'Fired up'

  return (
    <div>
      <nav className="nav">
        <div className="container nav-inner">
          <div className="nav-logo">🎯 Founder Focus</div>
          <div className="nav-links">
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{user.email}</span>
            <a href="/auth/logout"><button className="btn-ghost btn-sm">Logout</button></a>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Morning energy */}
        <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
            How's your brain today?
          </div>
          <div className="energy-scale" style={{ justifyContent: 'center' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                onClick={() => { setEnergy(n); updateEnergy({ target: { value: n } }) }}
                className={`energy-btn ${energy === n ? 'selected' : ''}`}
                style={energy === n ? {} : {}}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>
            {energyLabel} — {energy}/10
          </div>
        </div>

        {/* Hero task */}
        {heroTask ? (
          <div className="hero-task">
            <div className="tag">Start here</div>
            <h2>{heroTask.title}</h2>
            <div className="meta">
              {heroTask.context && <span>{heroTask.context} · </span>}
              <span>Impact {heroTask.impact}/5</span>
              <span> · Effort {heroTask.effort}/5</span>
              <span className="energy-req">⚡ {heroTask.energy_required}+ energy</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button
                className="btn-accent btn-sm"
                onClick={() => completeTask(heroTask.id)}
                disabled={completing === heroTask.id}
              >
                {completing === heroTask.id ? 'Done' : '✓ I did this'}
              </button>
            </div>
          </div>
        ) : (
          <div className="hero-task" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 20 }}>All clear for today.</h2>
            <p style={{ opacity: 0.8, fontSize: 14, marginTop: 6 }}>Add more tasks or come back tomorrow.</p>
          </div>
        )}

        {/* Task list */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              Up next
              <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 13, marginLeft: 6 }}>
                {tasks.length} tasks
              </span>
            </div>
            <button className="btn-sm" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? 'Cancel' : '+ Add task'}
            </button>
          </div>

          {showAdd && (
            <form onSubmit={addTask} style={{ background: 'var(--bg)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="What needs to get done?"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                required
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label>Deadline (optional)</label>
                  <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Impact (1-5)</label>
                  <select value={newTask.impact} onChange={e => setNewTask({...newTask, impact: parseInt(e.target.value)})}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} — {['Minor','Low','Medium','High','Critical'][n-1]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Effort (1-5)</label>
                  <select value={newTask.effort} onChange={e => setNewTask({...newTask, effort: parseInt(e.target.value)})}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} — {['Quick','Short','Medium','Long','Epic'][n-1]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Energy required (1-10)</label>
                <div className="slider-row">
                  <input
                    type="range" min="1" max="10" className="slider"
                    value={newTask.energy_required}
                    onChange={e => setNewTask({...newTask, energy_required: parseInt(e.target.value)})}
                  />
                  <span style={{ fontSize: 13, minWidth: 24, textAlign: 'center' }}>{newTask.energy_required}</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Context (optional — e.g. 'investor call prep', 'bug fix')"
                value={newTask.context}
                onChange={e => setNewTask({...newTask, context: e.target.value})}
              />
              <button type="submit">Add task</button>
            </form>
          )}

          {tasks.length === 0 && !showAdd ? (
            <div className="empty-state">
              <div className="emoji">📋</div>
              <p>No more tasks. Add one above or come back tomorrow.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className={`task-priority priority-${task.urgency >= 7 ? 'high' : task.urgency >= 4 ? 'medium' : 'low'}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {task.context && <span className="tag-pill">{task.context}</span>}
                    <span className="tag-pill">Impact {task.impact}</span>
                    <span className="tag-pill">Effort {task.effort}</span>
                    <span className="tag-pill">⚡ {task.energy_required}+</span>
                    {task.deadline && <span className="tag-pill" style={{ color: task.urgency >= 7 ? 'var(--red)' : 'inherit' }}>📅 {task.deadline}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    className="btn-icon"
                    onClick={() => completeTask(task.id)}
                    disabled={completing === task.id}
                    title="Mark done"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="footer">
          Founder Focus · {taskCount} active tasks · Energy: {energy}/10
        </div>
      </div>
    </div>
  )
}
