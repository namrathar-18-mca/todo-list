/**
 * ZENITH TASKS — Advanced Modern Task Management Application
 * Pure Vanilla JavaScript (ES6+) with LocalStorage, Web Audio API,
 * Confetti Canvas Engine, and Keyboard Shortcuts.
 */

// ==========================================
// 1. DATA MODEL & SAMPLE INITIAL DATA
// ==========================================

const SAMPLE_TASKS = [
  {
    id: "zenith-1",
    title: "Launch redesign of Zenith Tasks product dashboard",
    description: "Finalize high-fidelity glassmorphic UI, verify responsive breakpoints, and run cross-browser accessibility checks.",
    category: "Projects",
    priority: "urgent",
    dueDate: getFormattedOffsetDate(0), // Today
    completed: false,
    completedAt: null,
    starred: true,
    subtasks: [
      { id: "sub-1-1", title: "Review color contrast ratios", completed: true },
      { id: "sub-1-2", title: "Test keyboard shortcuts navigation", completed: true },
      { id: "sub-1-3", title: "Add smooth sound cues & micro-animations", completed: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "zenith-2",
    title: "Weekly high-intensity cardio workout & yoga stretch",
    description: "45 mins zone 2 cardio followed by 15 mins mobility stretching routine.",
    category: "Health",
    priority: "medium",
    dueDate: getFormattedOffsetDate(0), // Today
    completed: false,
    completedAt: null,
    starred: false,
    subtasks: [
      { id: "sub-2-1", title: "Warmup & hydration", completed: true },
      { id: "sub-2-2", title: "Running session (5 km)", completed: false }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "zenith-3",
    title: "Client strategy roadmap & Q4 budget review",
    description: "Align deliverables, team bandwidth, and quarterly milestones before Thursday's presentation.",
    category: "Work",
    priority: "high",
    dueDate: getFormattedOffsetDate(2), // 2 days later
    completed: false,
    completedAt: null,
    starred: true,
    subtasks: [
      { id: "sub-3-1", title: "Compile metrics into slides", completed: false },
      { id: "sub-3-2", title: "Send draft to senior team", completed: false }
    ],
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: "zenith-4",
    title: "Order fresh roasted coffee beans & whole grains",
    description: "Pick up Ethiopian single origin beans and breakfast essentials from farmer's market.",
    category: "Personal",
    priority: "low",
    dueDate: getFormattedOffsetDate(3),
    completed: true,
    completedAt: new Date(Date.now() - 12000000).toISOString(),
    starred: false,
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

function getFormattedOffsetDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ==========================================
// 2. STATE MANAGER
// ==========================================

class AppState {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentView = 'all'; // 'all', 'today', 'upcoming', 'starred', 'completed'
    this.currentCategory = null; // null or 'Work', 'Personal', etc.
    this.statusFilter = 'all'; // 'all', 'pending', 'completed'
    this.priorityFilter = 'all'; // 'all', 'urgent', 'high', 'medium', 'low'
    this.sortOption = 'smart'; // 'smart', 'dueDate', 'priority', 'title', 'createdAt'
    this.searchQuery = '';
    this.soundEnabled = localStorage.getItem('zenith_sound') !== 'false';
    this.theme = localStorage.getItem('zenith_theme') || 'dark';
    this.lastDeletedTask = null;
    this.lastDeletedIndex = -1;
  }

  loadTasks() {
    try {
      const stored = localStorage.getItem('zenith_tasks');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse local tasks:", e);
    }
    return [...SAMPLE_TASKS];
  }

  saveTasks() {
    try {
      localStorage.setItem('zenith_tasks', JSON.stringify(this.tasks));
    } catch (e) {
      console.error("Failed to save tasks:", e);
    }
  }

  savePreferences() {
    localStorage.setItem('zenith_theme', this.theme);
    localStorage.setItem('zenith_sound', this.soundEnabled);
  }
}

const state = new AppState();

// ==========================================
// 3. SYNTHESIZED SOUND EFFECTS (Web Audio API)
// ==========================================

class SoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playComplete() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Pleasant 2-note ascending chime
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  playPop() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playAdd() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playDelete() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }
}

const sounds = new SoundManager();

// ==========================================
// 4. CONFETTI CELEBRATION ENGINE
// ==========================================

class ConfettiEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationFrame = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    const colors = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    if (!this.animationFrame) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.loop());
    } else {
      this.animationFrame = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ==========================================
// 5. DOM ELEMENTS CACHE
// ==========================================

const dom = {
  html: document.documentElement,
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  openSidebarBtn: document.getElementById('open-sidebar-btn'),
  closeSidebarBtn: document.getElementById('close-sidebar-btn'),

  // Navigations
  viewNav: document.getElementById('view-nav'),
  categoryNav: document.getElementById('category-nav'),

  // Counts
  countAll: document.getElementById('count-all'),
  countToday: document.getElementById('count-today'),
  countUpcoming: document.getElementById('count-upcoming'),
  countStarred: document.getElementById('count-starred'),
  countCompleted: document.getElementById('count-completed'),
  countCatWork: document.getElementById('count-cat-work'),
  countCatPersonal: document.getElementById('count-cat-personal'),
  countCatHealth: document.getElementById('count-cat-health'),
  countCatProjects: document.getElementById('count-cat-projects'),

  // Productivity mini widget
  streakCount: document.getElementById('streak-count'),
  todayCompletionRatio: document.getElementById('today-completion-ratio'),
  sidebarProgressFill: document.getElementById('sidebar-progress-fill'),
  prodQuote: document.getElementById('prod-quote'),

  // Theme & Tools
  themeSelect: document.getElementById('theme-select'),
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIcon: document.getElementById('sound-icon'),
  shortcutsBtn: document.getElementById('shortcuts-btn'),
  exportImportBtn: document.getElementById('export-import-btn'),

  // Topbar
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  filterPriority: document.getElementById('filter-priority'),
  sortSelect: document.getElementById('sort-select'),
  topbarAddBtn: document.getElementById('topbar-add-btn'),
  openNewTaskBtn: document.getElementById('open-new-task-btn'),

  // Banner
  currentDateChip: document.getElementById('current-date-chip'),
  dynamicGreeting: document.getElementById('dynamic-greeting'),
  bannerSubtext: document.getElementById('banner-subtext'),
  statActiveCount: document.getElementById('stat-active-count'),
  statCompletedCount: document.getElementById('stat-completed-count'),
  statRate: document.getElementById('stat-rate'),

  // Filter Strip
  currentViewTitle: document.getElementById('current-view-title'),
  viewTaskCount: document.getElementById('view-task-count'),
  statusPillFilter: document.getElementById('status-pill-filter'),
  clearCompletedBtn: document.getElementById('clear-completed-btn'),

  // Inline Adder
  inlineAddForm: document.getElementById('inline-add-form'),
  inlineTaskTitle: document.getElementById('inline-task-title'),
  inlineCategory: document.getElementById('inline-category'),
  inlinePriority: document.getElementById('inline-priority'),
  inlineDate: document.getElementById('inline-date'),
  expandModalAdd: document.getElementById('expand-modal-add'),

  // Task List & Empty
  taskList: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyDesc: document.getElementById('empty-desc'),
  emptyAddBtn: document.getElementById('empty-add-btn'),

  // Modals
  taskModal: document.getElementById('task-modal'),
  taskModalForm: document.getElementById('task-modal-form'),
  modalHeading: document.getElementById('modal-heading'),
  modalTaskId: document.getElementById('modal-task-id'),
  modalTitle: document.getElementById('modal-title'),
  modalDescription: document.getElementById('modal-description'),
  modalCategory: document.getElementById('modal-category'),
  modalPriority: document.getElementById('modal-priority'),
  modalDueDate: document.getElementById('modal-due-date'),
  modalSubtaskInput: document.getElementById('modal-subtask-input'),
  modalAddSubtaskBtn: document.getElementById('modal-add-subtask-btn'),
  modalSubtaskItems: document.getElementById('modal-subtask-items'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  modalCancelBtn: document.getElementById('modal-cancel-btn'),

  // Shortcuts modal
  shortcutsModal: document.getElementById('shortcuts-modal'),
  closeShortcutsBtn: document.getElementById('close-shortcuts-btn'),
  closeShortcutsFooterBtn: document.getElementById('close-shortcuts-footer-btn'),

  // Backup modal
  backupModal: document.getElementById('backup-modal'),
  closeBackupBtn: document.getElementById('close-backup-btn'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  importJsonFile: document.getElementById('import-json-file'),
  resetSampleBtn: document.getElementById('reset-sample-btn'),

  // Toast
  toastContainer: document.getElementById('toast-container'),
  confettiCanvas: document.getElementById('confetti-canvas')
};

const confetti = new ConfettiEngine(dom.confettiCanvas);

// Temporary state for subtasks being edited inside modal
let modalSubtasksCache = [];

// ==========================================
// 6. INITIALIZATION & SETUP
// ==========================================

function initApp() {
  applyTheme(state.theme);
  updateSoundUI();
  updateGreeting();
  dom.inlineDate.value = getFormattedOffsetDate(0);
  renderAll();
  bindEventListeners();
}

function applyTheme(themeName) {
  state.theme = themeName;
  dom.html.setAttribute('data-theme', themeName);
  dom.themeSelect.value = themeName;
  state.savePreferences();
}

function updateSoundUI() {
  if (state.soundEnabled) {
    dom.soundIcon.className = "ph-bold ph-speaker-high";
    dom.soundToggleBtn.setAttribute('title', 'Sound Effects: On (S)');
  } else {
    dom.soundIcon.className = "ph-bold ph-speaker-slash";
    dom.soundToggleBtn.setAttribute('title', 'Sound Effects: Muted (S)');
  }
  state.savePreferences();
}

function updateGreeting() {
  const now = new Date();
  const hours = now.getHours();
  let timeOfDay = "day";
  if (hours < 12) timeOfDay = "morning";
  else if (hours < 18) timeOfDay = "afternoon";
  else timeOfDay = "evening";

  dom.dynamicGreeting.textContent = `Good ${timeOfDay}, Achiever`;

  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  dom.currentDateChip.textContent = now.toLocaleDateString(undefined, options);
}

// ==========================================
// 7. TASK FILTERING & SORTING LOGIC
// ==========================================

function getFilteredTasks() {
  const todayStr = getFormattedOffsetDate(0);

  return state.tasks.filter(task => {
    // 1. View Filter
    if (state.currentCategory) {
      if (task.category !== state.currentCategory) return false;
    } else {
      if (state.currentView === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (state.currentView === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayStr) return false;
      } else if (state.currentView === 'starred') {
        if (!task.starred) return false;
      } else if (state.currentView === 'completed') {
        if (!task.completed) return false;
      }
    }

    // 2. Status Pill Filter (All, Incomplete, Completed)
    if (state.statusFilter === 'pending' && task.completed) return false;
    if (state.statusFilter === 'completed' && !task.completed) return false;

    // 3. Priority Filter
    if (state.priorityFilter !== 'all' && task.priority !== state.priorityFilter) return false;

    // 4. Search Filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(q);
      const descMatch = (task.description || '').toLowerCase().includes(q);
      const catMatch = (task.category || '').toLowerCase().includes(q);
      const subtaskMatch = task.subtasks && task.subtasks.some(s => s.title.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !catMatch && !subtaskMatch) return false;
    }

    return true;
  });
}

function sortTasks(tasks) {
  const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...tasks];

  switch (state.sortOption) {
    case 'smart':
      // Smart: Uncompleted first, then by priority (urgent -> low), then due date
      sorted.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const pDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      break;

    case 'dueDate':
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;

    case 'priority':
      sorted.sort((a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0));
      break;

    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case 'createdAt':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return sorted;
}

// ==========================================
// 8. RENDERING FUNCTIONS
// ==========================================

function renderAll() {
  updateCountsAndStats();
  renderTaskList();
  updateViewHeaders();
}

function updateCountsAndStats() {
  const todayStr = getFormattedOffsetDate(0);

  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const active = total - completed;
  const todayTasks = state.tasks.filter(t => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const upcomingCount = state.tasks.filter(t => t.dueDate && t.dueDate > todayStr && !t.completed).length;
  const starredCount = state.tasks.filter(t => t.starred).length;

  // Sidebar Counts
  dom.countAll.textContent = total;
  dom.countToday.textContent = todayTasks.length;
  dom.countUpcoming.textContent = upcomingCount;
  dom.countStarred.textContent = starredCount;
  dom.countCompleted.textContent = completed;

  // Category counts
  dom.countCatWork.textContent = state.tasks.filter(t => t.category === 'Work').length;
  dom.countCatPersonal.textContent = state.tasks.filter(t => t.category === 'Personal').length;
  dom.countCatHealth.textContent = state.tasks.filter(t => t.category === 'Health').length;
  dom.countCatProjects.textContent = state.tasks.filter(t => t.category === 'Projects').length;

  // Banner Stats
  dom.statActiveCount.textContent = active;
  dom.statCompletedCount.textContent = completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  dom.statRate.textContent = `${rate}%`;

  if (todayTasks.length > 0) {
    dom.bannerSubtext.textContent = `You have ${todayTasks.length} task${todayTasks.length === 1 ? '' : 's'} scheduled for today (${todayCompleted} done). Keep going!`;
  } else {
    dom.bannerSubtext.textContent = `Ready to conquer your goals? Create a task and keep your momentum going!`;
  }

  // Productivity Widget
  dom.todayCompletionRatio.textContent = `${todayCompleted}/${todayTasks.length}`;
  const todayPct = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;
  dom.sidebarProgressFill.style.width = `${todayPct}%`;

  if (todayTasks.length > 0 && todayCompleted === todayTasks.length) {
    dom.prodQuote.textContent = "🔥 Amazing! You completed all tasks for today!";
  } else if (todayPct >= 50) {
    dom.prodQuote.textContent = "⚡ Halfway through today's goals! Almost there.";
  } else {
    dom.prodQuote.textContent = "Focus on one step at a time. You got this!";
  }
}

function updateViewHeaders() {
  let title = "All Tasks";
  if (state.currentCategory) {
    title = `${state.currentCategory} Tasks`;
  } else {
    switch (state.currentView) {
      case 'today': title = "Today's Agenda"; break;
      case 'upcoming': title = "Upcoming Schedule"; break;
      case 'starred': title = "Starred & Priority"; break;
      case 'completed': title = "Completed Archive"; break;
    }
  }

  dom.currentViewTitle.textContent = title;
  const filtered = getFilteredTasks();
  dom.viewTaskCount.textContent = `${filtered.length} task${filtered.length === 1 ? '' : 's'}`;
}

function renderTaskList() {
  const filtered = getFilteredTasks();
  const sorted = sortTasks(filtered);

  dom.taskList.innerHTML = '';

  if (sorted.length === 0) {
    dom.emptyState.classList.remove('hidden');
    if (state.searchQuery.trim()) {
      dom.emptyTitle.textContent = "No matches found";
      dom.emptyDesc.textContent = `No tasks matching "${escapeHTML(state.searchQuery)}". Try searching something else.`;
    } else if (state.currentView === 'completed') {
      dom.emptyTitle.textContent = "No completed tasks yet";
      dom.emptyDesc.textContent = "Tasks you mark as done will appear here in your achievement log.";
    } else {
      dom.emptyTitle.textContent = "All clear!";
      dom.emptyDesc.textContent = "No tasks in this view. Enjoy the moment or add your next milestone.";
    }
    return;
  }

  dom.emptyState.classList.add('hidden');

  const fragment = document.createDocumentFragment();

  sorted.forEach(task => {
    const card = createTaskCardElement(task);
    fragment.appendChild(card);
  });

  dom.taskList.appendChild(fragment);
}

function createTaskCardElement(task) {
  const card = document.createElement('div');
  card.className = `task-card ${task.completed ? 'completed' : ''}`;
  card.setAttribute('data-id', task.id);
  card.setAttribute('role', 'listitem');

  // Priority color accents
  const catColors = {
    Work: 'var(--cat-work)',
    Personal: 'var(--cat-personal)',
    Health: 'var(--cat-health)',
    Projects: 'var(--cat-projects)'
  };
  card.style.setProperty('--card-accent', catColors[task.category] || 'var(--accent-primary)');

  // Due Date Badge Logic
  let dueHtml = '';
  if (task.dueDate) {
    const todayStr = getFormattedOffsetDate(0);
    let dueClass = '';
    let dueLabel = formatDateDisplay(task.dueDate);

    if (task.dueDate === todayStr) {
      dueClass = 'today';
      dueLabel = 'Today';
    } else if (task.dueDate < todayStr && !task.completed) {
      dueClass = 'overdue';
      dueLabel = `Overdue (${dueLabel})`;
    }
    dueHtml = `<span class="badge badge-due ${dueClass}"><i class="ph ph-calendar"></i> ${dueLabel}</span>`;
  }

  // Priority Label
  const priorityLabels = {
    urgent: '🔥 Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  // Subtask Counter & Progress
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
  let subtasksBadgeHtml = '';
  if (totalSubtasks > 0) {
    subtasksBadgeHtml = `
      <button class="subtasks-toggle-btn" data-action="toggle-subtasks" title="Toggle checklist">
        <i class="ph-bold ph-list-checks"></i>
        <span>${completedSubtasks}/${totalSubtasks} steps</span>
        <i class="ph ph-caret-down caret-icon"></i>
      </button>
    `;
  }

  card.innerHTML = `
    <div class="task-main-row">
      <label class="custom-checkbox-wrapper" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
        <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''} data-action="toggle-complete">
        <span class="custom-checkbox">
          <i class="ph-bold ph-check"></i>
        </span>
      </label>

      <div class="task-content">
        <span class="task-title">${escapeHTML(task.title)}</span>
        ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

        <div class="task-meta-row">
          <span class="badge badge-cat"><i class="ph ph-folder"></i> ${escapeHTML(task.category)}</span>
          <span class="badge badge-priority-${task.priority}">${priorityLabels[task.priority] || task.priority}</span>
          ${dueHtml}
          ${subtasksBadgeHtml}
        </div>
      </div>

      <div class="task-actions">
        <button class="action-icon-btn star-btn ${task.starred ? 'starred' : ''}" data-action="toggle-star" title="${task.starred ? 'Unstar task' : 'Star task'}">
          <i class="${task.starred ? 'ph-fill ph-star' : 'ph ph-star'}"></i>
        </button>
        <button class="action-icon-btn edit-btn" data-action="edit-task" title="Edit task">
          <i class="ph ph-pencil-simple"></i>
        </button>
        <button class="action-icon-btn delete-btn" data-action="delete-task" title="Delete task">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    </div>

    ${totalSubtasks > 0 ? `
      <div class="subtasks-container" style="display: none;">
        <div class="subtasks-progress-wrapper">
          <div class="subtasks-progress-bar">
            <div class="subtasks-progress-fill" style="width: ${Math.round((completedSubtasks / totalSubtasks) * 100)}%"></div>
          </div>
          <span class="subtasks-ratio-text">${completedSubtasks}/${totalSubtasks} completed</span>
        </div>
        <ul class="subtask-items-list">
          ${task.subtasks.map(sub => `
            <li class="subtask-item ${sub.completed ? 'completed' : ''}" data-subtask-id="${sub.id}">
              <div class="subtask-check" data-action="toggle-subtask">
                <i class="ph-bold ph-check"></i>
              </div>
              <span>${escapeHTML(sub.title)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
  `;

  return card;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================
// 9. TASK MUTATION ACTIONS
// ==========================================

function toggleTaskComplete(taskId, event) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  state.saveTasks();

  if (task.completed) {
    sounds.playComplete();
    // Confetti trigger
    if (event) {
      const rect = event.target.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      confetti.burst();
    }
    showToast(`Task marked as complete! 🎉`, false);
  } else {
    sounds.playPop();
  }

  renderAll();
}

function toggleTaskStar(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.starred = !task.starred;
  state.saveTasks();
  sounds.playPop();
  renderAll();
}

function deleteTask(taskId) {
  const idx = state.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;

  state.lastDeletedTask = state.tasks[idx];
  state.lastDeletedIndex = idx;
  state.tasks.splice(idx, 1);
  state.saveTasks();

  sounds.playDelete();
  renderAll();

  showToast(`Task deleted`, true, () => {
    // Undo callback
    if (state.lastDeletedTask) {
      state.tasks.splice(state.lastDeletedIndex, 0, state.lastDeletedTask);
      state.saveTasks();
      state.lastDeletedTask = null;
      renderAll();
      sounds.playAdd();
      showToast(`Restored: "${state.lastDeletedTask ? state.lastDeletedTask.title : 'Task'}"`, false);
    }
  });
}

function toggleSubtaskComplete(taskId, subtaskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks) return;

  const sub = task.subtasks.find(s => s.id === subtaskId);
  if (!sub) return;

  sub.completed = !sub.completed;
  state.saveTasks();
  sounds.playPop();
  renderAll();

  // If subtasks are expanded, keep them expanded after re-render
  const card = dom.taskList.querySelector(`[data-id="${taskId}"]`);
  if (card) {
    const subContainer = card.querySelector('.subtasks-container');
    if (subContainer) subContainer.style.display = 'flex';
  }
}

function clearCompletedTasks() {
  const completedTasks = state.tasks.filter(t => t.completed);
  if (completedTasks.length === 0) {
    showToast("No completed tasks to clear.", false);
    return;
  }

  if (confirm(`Are you sure you want to remove ${completedTasks.length} completed task(s)?`)) {
    state.tasks = state.tasks.filter(t => !t.completed);
    state.saveTasks();
    sounds.playDelete();
    renderAll();
    showToast(`Removed ${completedTasks.length} completed tasks.`, false);
  }
}

// ==========================================
// 10. TASK MODAL (ADD / EDIT)
// ==========================================

function openTaskModal(taskId = null) {
  modalSubtasksCache = [];
  dom.modalSubtaskItems.innerHTML = '';
  dom.modalSubtaskInput.value = '';

  if (taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    dom.modalHeading.innerHTML = `<i class="ph-bold ph-pencil-simple"></i> Edit Task`;
    dom.modalTaskId.value = task.id;
    dom.modalTitle.value = task.title;
    dom.modalDescription.value = task.description || '';
    dom.modalCategory.value = task.category || 'Work';
    dom.modalPriority.value = task.priority || 'medium';
    dom.modalDueDate.value = task.dueDate || '';

    if (task.subtasks) {
      modalSubtasksCache = JSON.parse(JSON.stringify(task.subtasks));
      renderModalSubtasks();
    }
  } else {
    dom.modalHeading.innerHTML = `<i class="ph-bold ph-plus-circle"></i> New Task`;
    dom.modalTaskId.value = '';
    dom.modalTitle.value = '';
    dom.modalDescription.value = '';
    dom.modalCategory.value = state.currentCategory || 'Work';
    dom.modalPriority.value = 'medium';
    dom.modalDueDate.value = getFormattedOffsetDate(0);
  }

  dom.taskModal.classList.remove('hidden');
  setTimeout(() => dom.modalTitle.focus(), 50);
}

function closeTaskModal() {
  dom.taskModal.classList.add('hidden');
  dom.taskModalForm.reset();
}

function renderModalSubtasks() {
  dom.modalSubtaskItems.innerHTML = '';
  modalSubtasksCache.forEach((sub, idx) => {
    const li = document.createElement('li');
    li.className = 'modal-subtask-item';
    li.innerHTML = `
      <span>${escapeHTML(sub.title)}</span>
      <button type="button" class="remove-subtask-btn" data-subtask-idx="${idx}" title="Remove subtask">
        <i class="ph-bold ph-x"></i>
      </button>
    `;
    dom.modalSubtaskItems.appendChild(li);
  });
}

function addModalSubtask() {
  const text = dom.modalSubtaskInput.value.trim();
  if (!text) return;

  modalSubtasksCache.push({
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: text,
    completed: false
  });

  dom.modalSubtaskInput.value = '';
  renderModalSubtasks();
  dom.modalSubtaskInput.focus();
}

function handleTaskModalSubmit(e) {
  e.preventDefault();

  const title = dom.modalTitle.value.trim();
  if (!title) return;

  const taskId = dom.modalTaskId.value;
  const description = dom.modalDescription.value.trim();
  const category = dom.modalCategory.value;
  const priority = dom.modalPriority.value;
  const dueDate = dom.modalDueDate.value;

  if (taskId) {
    // Edit existing
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      task.title = title;
      task.description = description;
      task.category = category;
      task.priority = priority;
      task.dueDate = dueDate;
      task.subtasks = [...modalSubtasksCache];
      state.saveTasks();
      showToast("Task updated successfully!", false);
    }
  } else {
    // Create new
    const newTask = {
      id: `zenith-${Date.now()}`,
      title,
      description,
      category,
      priority,
      dueDate,
      completed: false,
      completedAt: null,
      starred: false,
      subtasks: [...modalSubtasksCache],
      createdAt: new Date().toISOString()
    };
    state.tasks.unshift(newTask);
    state.saveTasks();
    sounds.playAdd();
    showToast("Task created!", false);
  }

  closeTaskModal();
  renderAll();
}

// ==========================================
// 11. INLINE TASK ADDER
// ==========================================

function handleInlineAdd(e) {
  e.preventDefault();
  const title = dom.inlineTaskTitle.value.trim();
  if (!title) return;

  const category = dom.inlineCategory.value;
  const priority = dom.inlinePriority.value;
  const dueDate = dom.inlineDate.value;

  const newTask = {
    id: `zenith-${Date.now()}`,
    title,
    description: '',
    category,
    priority,
    dueDate,
    completed: false,
    completedAt: null,
    starred: false,
    subtasks: [],
    createdAt: new Date().toISOString()
  };

  state.tasks.unshift(newTask);
  state.saveTasks();
  sounds.playAdd();

  dom.inlineTaskTitle.value = '';
  showToast("Quick task added! 🚀", false);
  renderAll();
}

// ==========================================
// 12. TOAST NOTIFICATION SYSTEM
// ==========================================

function showToast(message, isUndoable = false, onUndo = null) {
  const toast = document.createElement('div');
  toast.className = `toast ${isUndoable ? 'toast-undo' : ''}`;

  let undoButtonHtml = '';
  if (isUndoable && onUndo) {
    undoButtonHtml = `<button class="toast-undo-btn">Undo</button>`;
  }

  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
    ${undoButtonHtml}
  `;

  if (isUndoable && onUndo) {
    const undoBtn = toast.querySelector('.toast-undo-btn');
    undoBtn.addEventListener('click', () => {
      onUndo();
      toast.remove();
    });
  }

  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ==========================================
// 13. BACKUP, RESTORE & EXPORT
// ==========================================

function exportBackupJSON() {
  const data = {
    app: "Zenith Tasks",
    exportDate: new Date().toISOString(),
    tasks: state.tasks
  };

  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", jsonStr);
  downloadAnchor.setAttribute("download", `zenith_backup_${getFormattedOffsetDate(0)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast("Backup exported as JSON!", false);
}

function importBackupJSON(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && Array.isArray(parsed.tasks)) {
        state.tasks = parsed.tasks;
        state.saveTasks();
        renderAll();
        dom.backupModal.classList.add('hidden');
        showToast(`Successfully imported ${parsed.tasks.length} tasks!`, false);
      } else {
        alert("Invalid backup file structure: missing tasks array.");
      }
    } catch (err) {
      alert("Error reading JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function resetWithSampleData() {
  if (confirm("Reset current task list with default sample data? Existing tasks will be replaced.")) {
    state.tasks = [...SAMPLE_TASKS];
    state.saveTasks();
    dom.backupModal.classList.add('hidden');
    renderAll();
    showToast("Reset to sample data completed.", false);
  }
}

// ==========================================
// 14. EVENT LISTENERS & DELEGATION
// ==========================================

function bindEventListeners() {
  // Mobile Sidebar Toggle
  dom.openSidebarBtn.addEventListener('click', () => {
    dom.sidebar.classList.add('open');
    dom.sidebarOverlay.classList.add('active');
  });

  const closeSidebar = () => {
    dom.sidebar.classList.remove('open');
    dom.sidebarOverlay.classList.remove('active');
  };
  dom.closeSidebarBtn.addEventListener('click', closeSidebar);
  dom.sidebarOverlay.addEventListener('click', closeSidebar);

  // View Navigation
  dom.viewNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;

    dom.viewNav.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    dom.categoryNav.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    btn.classList.add('active');
    state.currentView = btn.dataset.view;
    state.currentCategory = null;

    closeSidebar();
    renderAll();
  });

  // Category Navigation
  dom.categoryNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;

    dom.viewNav.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    dom.categoryNav.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    btn.classList.add('active');
    state.currentCategory = btn.dataset.category;

    closeSidebar();
    renderAll();
  });

  // Theme Select
  dom.themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  // Sound FX Toggle
  dom.soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    updateSoundUI();
    sounds.playPop();
    showToast(state.soundEnabled ? "Sound effects enabled 🔊" : "Sound effects muted 🔇", false);
  });

  // Shortcuts Modal
  dom.shortcutsBtn.addEventListener('click', () => dom.shortcutsModal.classList.remove('hidden'));
  dom.closeShortcutsBtn.addEventListener('click', () => dom.shortcutsModal.classList.add('hidden'));
  dom.closeShortcutsFooterBtn.addEventListener('click', () => dom.shortcutsModal.classList.add('hidden'));

  // Backup Modal
  dom.exportImportBtn.addEventListener('click', () => dom.backupModal.classList.remove('hidden'));
  dom.closeBackupBtn.addEventListener('click', () => dom.backupModal.classList.add('hidden'));
  dom.exportJsonBtn.addEventListener('click', exportBackupJSON);
  dom.importJsonFile.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importBackupJSON(e.target.files[0]);
    }
  });
  dom.resetSampleBtn.addEventListener('click', resetWithSampleData);

  // Search
  dom.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    dom.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderTaskList();
    updateViewHeaders();
  });

  dom.clearSearchBtn.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.searchQuery = '';
    dom.clearSearchBtn.style.display = 'none';
    renderTaskList();
    updateViewHeaders();
  });

  // Priority Filter & Sort
  dom.filterPriority.addEventListener('change', (e) => {
    state.priorityFilter = e.target.value;
    renderTaskList();
    updateViewHeaders();
  });

  dom.sortSelect.addEventListener('change', (e) => {
    state.sortOption = e.target.value;
    renderTaskList();
  });

  // Status Filter Pills
  dom.statusPillFilter.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    dom.statusPillFilter.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.statusFilter = pill.dataset.status;
    renderTaskList();
    updateViewHeaders();
  });

  // Clear completed
  dom.clearCompletedBtn.addEventListener('click', clearCompletedTasks);

  // Add Task Modal Buttons
  dom.topbarAddBtn.addEventListener('click', () => openTaskModal());
  dom.openNewTaskBtn.addEventListener('click', () => openTaskModal());
  dom.emptyAddBtn.addEventListener('click', () => openTaskModal());
  dom.expandModalAdd.addEventListener('click', () => {
    const prefillTitle = dom.inlineTaskTitle.value;
    openTaskModal();
    if (prefillTitle) dom.modalTitle.value = prefillTitle;
  });

  dom.closeModalBtn.addEventListener('click', closeTaskModal);
  dom.modalCancelBtn.addEventListener('click', closeTaskModal);
  dom.taskModalForm.addEventListener('submit', handleTaskModalSubmit);

  // Subtask Builder inside modal
  dom.modalAddSubtaskBtn.addEventListener('click', addModalSubtask);
  dom.modalSubtaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addModalSubtask();
    }
  });

  dom.modalSubtaskItems.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-subtask-btn');
    if (!removeBtn) return;
    const idx = parseInt(removeBtn.dataset.subtaskIdx, 10);
    modalSubtasksCache.splice(idx, 1);
    renderModalSubtasks();
  });

  // Inline Quick Add Form
  dom.inlineAddForm.addEventListener('submit', handleInlineAdd);

  // Task List Delegation (Checkbox, Star, Edit, Delete, Subtasks)
  dom.taskList.addEventListener('click', (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;
    const taskId = card.dataset.id;

    // 1. Toggle Complete Checkbox
    if (e.target.closest('[data-action="toggle-complete"]') || e.target.closest('.custom-checkbox-wrapper')) {
      toggleTaskComplete(taskId, e);
      return;
    }

    // 2. Star Toggle
    const starBtn = e.target.closest('[data-action="toggle-star"]');
    if (starBtn) {
      toggleTaskStar(taskId);
      return;
    }

    // 3. Edit Task
    const editBtn = e.target.closest('[data-action="edit-task"]');
    if (editBtn) {
      openTaskModal(taskId);
      return;
    }

    // 4. Delete Task
    const deleteBtn = e.target.closest('[data-action="delete-task"]');
    if (deleteBtn) {
      deleteTask(taskId);
      return;
    }

    // 5. Toggle Subtasks Accordion
    const subtaskToggle = e.target.closest('[data-action="toggle-subtasks"]');
    if (subtaskToggle) {
      const container = card.querySelector('.subtasks-container');
      if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'flex' : 'none';
        const caret = subtaskToggle.querySelector('.caret-icon');
        if (caret) caret.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0)';
      }
      return;
    }

    // 6. Subtask completion toggle
    const subCheck = e.target.closest('[data-action="toggle-subtask"]');
    if (subCheck) {
      const subItem = subCheck.closest('.subtask-item');
      if (subItem) {
        const subId = subItem.dataset.subtaskId;
        toggleSubtaskComplete(taskId, subId);
      }
      return;
    }
  });

  // Close modals on clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === dom.taskModal) closeTaskModal();
    if (e.target === dom.shortcutsModal) dom.shortcutsModal.classList.add('hidden');
    if (e.target === dom.backupModal) dom.backupModal.classList.add('hidden');
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore keyboard shortcuts when typing in inputs/textareas
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
      closeTaskModal();
      dom.shortcutsModal.classList.add('hidden');
      dom.backupModal.classList.add('hidden');
      closeSidebar();
      return;
    }

    // Ctrl + K or '/' to focus search
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (!isTyping && e.key === '/')) {
      e.preventDefault();
      dom.searchInput.focus();
      return;
    }

    if (!isTyping) {
      // 'N' to open new task modal
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openTaskModal();
        return;
      }
      // 'S' to toggle sound
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        dom.soundToggleBtn.click();
        return;
      }
      // '?' to open shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        dom.shortcutsModal.classList.remove('hidden');
        return;
      }
    }
  });
}

// Kickoff
document.addEventListener('DOMContentLoaded', initApp);
