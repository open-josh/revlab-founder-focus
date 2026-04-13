import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const DB_FILE = path.join(DATA_DIR, 'focus.json')

try { mkdirSync(DATA_DIR, { recursive: true }) } catch {}

function read() {
  try {
    if (!fs.existsSync(DB_FILE)) return { users: [], tasks: [], daily_logs: [] }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
  } catch { return { users: [], tasks: [], daily_logs: [] } }
}

function write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

export default {
  getUserByEmail: (email) => read().users.find(u => u.email === email),
  getUserById: (id) => read().users.find(u => u.id === id),
  createUser: (user) => {
    const db = read()
    db.users.push(user)
    write(db)
    return user
  },

  getTasks: (userId) => read().tasks.filter(t => t.user_id === userId && !t.completed),
  getAllTasks: (userId) => read().tasks.filter(t => t.user_id === userId),

  createTask: (task) => {
    const db = read()
    db.tasks.push(task)
    write(db)
    return task
  },

  updateTask: (id, userId, updates) => {
    const db = read()
    const idx = db.tasks.findIndex(t => t.id === id && t.user_id === userId)
    if (idx >= 0) {
      db.tasks[idx] = { ...db.tasks[idx], ...updates }
      write(db)
      return db.tasks[idx]
    }
    return null
  },

  completeTask: (id, userId) => {
    const db = read()
    const idx = db.tasks.findIndex(t => t.id === id && t.user_id === userId)
    if (idx >= 0) {
      db.tasks[idx].completed = true
      db.tasks[idx].completed_at = Date.now()
      write(db)
    }
  },

  logDaily: (userId, energy) => {
    const db = read()
    const today = new Date().toISOString().slice(0, 10)
    db.daily_logs.push({ id: Date.now().toString(), user_id: userId, date: today, energy, created_at: Date.now() })
    write(db)
  },
}
