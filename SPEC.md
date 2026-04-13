# Founder Focus — MVP Spec

## What it is
Daily task prioritization tool for founders. Matches tasks to energy level each morning.

## Core loop
1. Founder rates their energy (1-10) each morning
2. App surfaces "start here" task + ranked up-next list
3. Tasks scored by: (impact × 2 + urgency) / effort × energy_match
4. Mark tasks done → next task surfaces

## Tech
- Next.js 15 (App Router)
- JSON file storage (no external DB)
- bcryptjs + jose for auth
- Warm cream/forest-green aesthetic

## MVP features
- [x] Email/password auth
- [x] Energy selector (1-10)
- [x] Hero "do this now" task
- [x] Ranked task list
- [x] Add task form (title, deadline, effort, impact, energy required)
- [x] Mark done → re-prioritizes
- [x] Seeded demo account
