# Zenith Tasks — Smart To-Do & Task Management Hub

> **Zenith Tasks** is a modern, high-performance task management and productivity web application engineered with Vanilla HTML5, CSS3, and modern JavaScript (ES6+). It blends sleek glassmorphic aesthetics with smart capabilities including **Natural Language Task Parsing (NLP)**, **Speech-to-Text Voice Dictation**, **Kanban Board**, **Eisenhower Priority Matrix**, **Pomodoro Deep Focus Mode**, **AI Task Decomposition**, and **Productivity Analytics**.

---

## ✨ Key Features

### 1. 🧠 Smart Natural Language Processing (NLP) Input
- Type tasks naturally and Zenith auto-detects metadata on the fly:
  - **Due Dates:** `today`, `tomorrow`, `in 3 days`, `on friday`, `next monday`
  - **Categories:** `#work`, `#personal`, `#health`, `#projects`
  - **Priorities:** `!urgent`, `!high`, `!medium`, `!low` (or `!p1`, `!p2`, `!p3`, `!p4`)
  - **Estimated Time:** `~15m`, `~30m`, `~1h`, `~45m`
- **Real-Time Smart Tag Preview Strip:** Visual pills dynamically appear under the input bar as you type to show what has been recognized before saving.

### 2. 🎙️ Voice Dictation (Speech-to-Text)
- Tap the microphone button in the quick task bar to speak your task out loud (e.g. *"Launch product presentation tomorrow afternoon hashtag projects exclamation urgent"*).
- Powered by the native Web Speech API.

### 3. 📋 Multi-View Workspace
Switch seamlessly between 3 specialized views to match your workflow:
- **List View (`L`):** Detailed card layout with subtask checklists, priority badges, category tags, and inline controls.
- **Kanban Board (`B`):** 3-column drag-and-drop workflow (`To Do`, `In Progress`, `Completed`) with column counts, quick add buttons, and card movement controls.
- **Eisenhower Matrix (`M`):** 4-quadrant decision matrix (`Q1: Do First`, `Q2: Schedule`, `Q3: Delegate`, `Q4: Don't Do/Backlog`) for prioritizing high-impact tasks.

### 4. ✨ Smart AI Task Decomposer
- Stuck on where to begin? Click **"AI Steps"** or **"✨ AI Suggest Steps"** to break down any goal into actionable steps.
- Built-in domain-aware rule engine tailored for software development, fitness routines, meetings, exams, errands, decluttering, budgeting, and general goals.

### 5. ⏱️ Focus Pomodoro Timer (`P`)
- Built-in customizable timer with presets: **Focus (25m)**, **Short Break (5m)**, and **Long Break (15m)**.
- Circular SVG progress ring with millisecond-smooth visual feedback.
- Link timer sessions directly to any specific pending task.
- Tracks and persists total daily deep focus time.
- Synthesized Web Audio fanfare bell and celebration confetti upon completion.

### 6. 📊 Productivity Analytics & Insights (`A`)
- Real-time **Productivity Score (0–100)** computed from task velocity, streaks, and focus sessions.
- **7-Day Velocity Chart:** Dynamic Mon–Sun bar chart tracking completion activity.
- **Category & Priority Distributions:** Visual progress meters showing workload balance.
- **AI Productivity Coach:** Tailored advice based on current urgent task load and completion rates.

### 7. 🎨 Rich Themes & Visual Aesthetics
- 5 curated color themes: **Midnight Dark**, **Crisp Light**, **Cyber Neon**, **Sunset Glow**, and **Emerald Forest**.
- Fluid glassmorphic cards, ambient gradient background glow, and responsive mobile drawer navigation.
- Synthesized Web Audio sound effects (pops, chimes, deletions, bells) with a 1-click mute toggle (`S`).
- Particle physics confetti celebrations on milestone completions.

### 8. 💾 Backup & Multi-Format Export
- **JSON Backup:** Full backup and restore with 1-click import.
- **Markdown Checklist (`.md`):** Clean formatted markdown list organized by category.
- **CSV Spreadsheet (`.csv`):** Tabular export compatible with Excel and Google Sheets.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `N` | Open New Task Dialog |
| `T` | Open Workflow Templates |
| `Ctrl + K` or `/` | Focus Search Bar |
| `L` | Switch to List View |
| `B` | Switch to Kanban Board View |
| `M` | Switch to Eisenhower Matrix View |
| `P` | Open Pomodoro Focus Timer |
| `A` | Open Productivity Analytics |
| `S` | Toggle Sound Effects |
| `?` | Show Keyboard Shortcuts Help |
| `Esc` | Close any active modal or drawer |

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari).

Alternatively, serve locally using Python:
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080` in your web browser.

---

## 🛠️ Tech Stack

- **HTML5:** Semantic markup, accessible dialog roles, SVG vector graphics.
- **Vanilla CSS3:** Custom CSS variables, Glassmorphism backdrop-filters, CSS Grid, Flexbox, Keyframe animations.
- **Vanilla JavaScript (ES6+):** Object-oriented state management, Web Audio API, Web Speech API, HTML5 Drag & Drop API, HTML5 Canvas Confetti Engine.
- **Phosphor Icons:** Modern icon set.
