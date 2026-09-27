/**
 * ZENITH TASKS — Smart Task Management & Productivity Hub
 * Pure Vanilla JavaScript (ES6+) with Real-Time NLP Parsing,
 * Kanban Board, Eisenhower Matrix, Pomodoro Focus Mode,
 * Speech Recognition, AI Task Decomposer, Web Audio API,
 * Confetti Canvas Engine, and Productivity Analytics.
 */

// ==========================================
// 1. DATA MODEL & INITIAL SAMPLE DATA
// ==========================================

function getFormattedOffsetDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const SAMPLE_TASKS = [
  {
    id: "zenith-1",
    title: "Launch redesign of Zenith Tasks product dashboard",
    description: "Finalize high-fidelity glassmorphic UI, verify responsive breakpoints, and run cross-browser accessibility checks.",
    category: "Projects",
    priority: "urgent",
    status: "inprogress", // 'todo', 'inprogress', 'done'
    dueDate: getFormattedOffsetDate(0), // Today
    completed: false,
    completedAt: null,
    starred: true,
    estimatedTime: "45m",
    focusSessions: 2,
    subtasks: [
      { id: "sub-1-1", title: "Review color contrast ratios", completed: true },
      { id: "sub-1-2", title: "Test keyboard shortcuts navigation", completed: true },
      { id: "sub-1-3", title: "Add smooth sound cues & micro-animations", completed: false },
      { id: "sub-1-4", title: "Verify mobile responsive layout", completed: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "zenith-2",
    title: "Weekly high-intensity cardio workout & yoga stretch",
    description: "45 mins zone 2 cardio followed by 15 mins mobility stretching routine.",
    category: "Health",
    priority: "medium",
    status: "todo",
    dueDate: getFormattedOffsetDate(0), // Today
    completed: false,
    completedAt: null,
    starred: false,
    estimatedTime: "60m",
    focusSessions: 0,
    subtasks: [
      { id: "sub-2-1", title: "Warmup & hydration", completed: true },
      { id: "sub-2-2", title: "Running session (5 km)", completed: false },
      { id: "sub-2-3", title: "Deep hamstring and hip flexor stretches", completed: false }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "zenith-3",
    title: "Client strategy roadmap & Q4 budget review",
    description: "Align deliverables, team bandwidth, and quarterly milestones before Thursday's presentation.",
    category: "Work",
    priority: "high",
    status: "todo",
    dueDate: getFormattedOffsetDate(2),
    completed: false,
    completedAt: null,
    starred: true,
    estimatedTime: "30m",
    focusSessions: 1,
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
    status: "done",
    dueDate: getFormattedOffsetDate(3),
    completed: true,
    completedAt: new Date(Date.now() - 12000000).toISOString(),
    starred: false,
    estimatedTime: "15m",
    focusSessions: 0,
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

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
    
    // View Mode: 'list', 'kanban', 'matrix'
    this.viewMode = localStorage.getItem('zenith_view_mode') || 'list';
    
    this.soundEnabled = localStorage.getItem('zenith_sound') !== 'false';
    this.theme = localStorage.getItem('zenith_theme') || 'dark';
    this.focusTimeMinutes = parseInt(localStorage.getItem('zenith_focus_time') || '50', 10);
    this.streakDays = parseInt(localStorage.getItem('zenith_streak') || '3', 10);
    
    this.lastDeletedTask = null;
    this.lastDeletedIndex = -1;
  }

  loadTasks() {
    try {
      const stored = localStorage.getItem('zenith_tasks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize status field
          return parsed.map(t => ({
            ...t,
            status: t.status || (t.completed ? 'done' : 'todo')
          }));
        }
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
    localStorage.setItem('zenith_view_mode', this.viewMode);
    localStorage.setItem('zenith_focus_time', this.focusTimeMinutes);
    localStorage.setItem('zenith_streak', this.streakDays);
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
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.36);
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

    gain.gain.setValueAtTime(0.18, now);
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

    gain.gain.setValueAtTime(0.15, now);
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

  playPomoBell() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [587.33, 880, 1174.66].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.12);
      gain.gain.setValueAtTime(0.25, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.25);
    });
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
  viewModeToggle: document.getElementById('view-mode-toggle'),
  modeBtnList: document.getElementById('mode-btn-list'),
  modeBtnKanban: document.getElementById('mode-btn-kanban'),
  modeBtnMatrix: document.getElementById('mode-btn-matrix'),
  openPomodoroBtn: document.getElementById('open-pomodoro-btn'),
  topbarTimerDisplay: document.getElementById('topbar-timer-display'),
  openAnalyticsBtn: document.getElementById('open-analytics-btn'),
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

  // Inline NLP Adder
  inlineAddForm: document.getElementById('inline-add-form'),
  inlineTaskTitle: document.getElementById('inline-task-title'),
  voiceInputBtn: document.getElementById('voice-input-btn'),
  voiceIcon: document.getElementById('voice-icon'),
  smartNlpPreview: document.getElementById('smart-nlp-preview'),
  nlpBadges: document.getElementById('nlp-badges'),
  inlineCategory: document.getElementById('inline-category'),
  inlinePriority: document.getElementById('inline-priority'),
  inlineDate: document.getElementById('inline-date'),
  inlineAiBreakdownBtn: document.getElementById('inline-ai-breakdown-btn'),
  expandModalAdd: document.getElementById('expand-modal-add'),

  // Views Sections
  taskListSection: document.getElementById('task-list-section'),
  taskList: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyDesc: document.getElementById('empty-desc'),
  emptyAddBtn: document.getElementById('empty-add-btn'),

  // Kanban
  kanbanBoardSection: document.getElementById('kanban-board-section'),
  kanbanListTodo: document.getElementById('kanban-list-todo'),
  kanbanListInprogress: document.getElementById('kanban-list-inprogress'),
  kanbanListDone: document.getElementById('kanban-list-done'),
  kanbanCountTodo: document.getElementById('kanban-count-todo'),
  kanbanCountInprogress: document.getElementById('kanban-count-inprogress'),
  kanbanCountDone: document.getElementById('kanban-count-done'),
  kanbanClearDone: document.getElementById('kanban-clear-done'),

  // Matrix
  matrixViewSection: document.getElementById('matrix-view-section'),
  listQ1: document.getElementById('list-q1'),
  listQ2: document.getElementById('list-q2'),
  listQ3: document.getElementById('list-q3'),
  listQ4: document.getElementById('list-q4'),
  countQ1: document.getElementById('count-q1'),
  countQ2: document.getElementById('count-q2'),
  countQ3: document.getElementById('count-q3'),
  countQ4: document.getElementById('count-q4'),

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
  modalStatus: document.getElementById('modal-status'),
  modalAiBreakdownBtn: document.getElementById('modal-ai-breakdown-btn'),
  modalSubtaskInput: document.getElementById('modal-subtask-input'),
  modalAddSubtaskBtn: document.getElementById('modal-add-subtask-btn'),
  modalSubtaskItems: document.getElementById('modal-subtask-items'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  modalCancelBtn: document.getElementById('modal-cancel-btn'),

  // Pomodoro Modal
  pomodoroModal: document.getElementById('pomodoro-modal'),
  closePomodoroBtn: document.getElementById('close-pomodoro-btn'),
  pomodoroTimeDigits: document.getElementById('pomodoro-time-digits'),
  pomodoroStatusText: document.getElementById('pomodoro-status-text'),
  timerProgressCircle: document.getElementById('timer-progress-circle'),
  pomoTaskSelect: document.getElementById('pomo-task-select'),
  pomodoroStartPauseBtn: document.getElementById('pomodoro-start-pause-btn'),
  pomodoroBtnIcon: document.getElementById('pomodoro-btn-icon'),
  pomodoroBtnLabel: document.getElementById('pomodoro-btn-label'),
  pomodoroResetBtn: document.getElementById('pomodoro-reset-btn'),
  pomoTotalFocusStat: document.getElementById('pomo-total-focus-stat'),

  // Analytics Modal
  analyticsModal: document.getElementById('analytics-modal'),
  closeAnalyticsBtn: document.getElementById('close-analytics-btn'),
  analyticsScore: document.getElementById('analytics-score'),
  analyticsCompletedCount: document.getElementById('analytics-completed-count'),
  analyticsStreakVal: document.getElementById('analytics-streak-val'),
  analyticsFocusMin: document.getElementById('analytics-focus-min'),
  velocityBarChart: document.getElementById('velocity-bar-chart'),
  categoryDistributionBars: document.getElementById('category-distribution-bars'),
  priorityDistributionBars: document.getElementById('priority-distribution-bars'),
  aiCoachInsightText: document.getElementById('ai-coach-insight-text'),

  // Shortcuts modal
  shortcutsModal: document.getElementById('shortcuts-modal'),
  closeShortcutsBtn: document.getElementById('close-shortcuts-btn'),
  closeShortcutsFooterBtn: document.getElementById('close-shortcuts-footer-btn'),

  // Backup modal
  backupModal: document.getElementById('backup-modal'),
  closeBackupBtn: document.getElementById('close-backup-btn'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  exportMdBtn: document.getElementById('export-md-btn'),
  exportCsvBtn: document.getElementById('export-csv-btn'),
  importJsonFile: document.getElementById('import-json-file'),
  resetSampleBtn: document.getElementById('reset-sample-btn'),

  // Toast & Confetti
  toastContainer: document.getElementById('toast-container'),
  confettiCanvas: document.getElementById('confetti-canvas')
};

const confetti = new ConfettiEngine(dom.confettiCanvas);
let modalSubtasksCache = [];

// ==========================================
// 6. INITIALIZATION & SETUP
// ==========================================

function initApp() {
  applyTheme(state.theme);
  updateSoundUI();
  updateGreeting();
  dom.inlineDate.value = getFormattedOffsetDate(0);
  switchViewMode(state.viewMode, false);
  renderAll();
  bindEventListeners();
  initPomodoroTimer();
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
// 7. SMART NATURAL LANGUAGE PARSER (NLP)
// ==========================================

function parseTaskNLP(rawText) {
  let text = rawText.trim();
  const result = {
    cleanTitle: text,
    category: null,
    priority: null,
    dueDate: null,
    duration: null,
    detectedTags: []
  };

  if (!text) return result;

  // 1. Detect Category Tags: #work, #personal, #health, #projects
  const catRegex = /#(work|personal|health|projects)\b/i;
  const catMatch = text.match(catRegex);
  if (catMatch) {
    const rawCat = catMatch[1].toLowerCase();
    const map = { work: 'Work', personal: 'Personal', health: 'Health', projects: 'Projects' };
    result.category = map[rawCat] || 'Work';
    result.detectedTags.push({ type: 'category', label: `📁 ${result.category}` });
    text = text.replace(catRegex, '').trim();
  }

  // 2. Detect Priority Tags: !urgent, !high, !med, !medium, !low, !p1, !p2, !p3, !p4
  const priorityRegex = /!(urgent|high|medium|med|low|p1|p2|p3|p4)\b/i;
  const prioMatch = text.match(priorityRegex);
  if (prioMatch) {
    const p = prioMatch[1].toLowerCase();
    if (p === 'urgent' || p === 'p1') result.priority = 'urgent';
    else if (p === 'high' || p === 'p2') result.priority = 'high';
    else if (p === 'medium' || p === 'med' || p === 'p3') result.priority = 'medium';
    else if (p === 'low' || p === 'p4') result.priority = 'low';

    const prioLabels = { urgent: '🔥 Urgent', high: 'High', medium: 'Medium', low: 'Low' };
    result.detectedTags.push({ type: 'priority', label: prioLabels[result.priority] });
    text = text.replace(priorityRegex, '').trim();
  }

  // 3. Detect Duration Estimation: ~30m, ~1h, ~45m, ~2h, ~90m
  const durationRegex = /~(\d+(?:m|h|min|mins|hr|hrs))\b/i;
  const durMatch = text.match(durationRegex);
  if (durMatch) {
    result.duration = durMatch[1].toLowerCase();
    result.detectedTags.push({ type: 'duration', label: `⏱️ ${result.duration}` });
    text = text.replace(durationRegex, '').trim();
  }

  // 4. Detect Due Date Keywords
  const todayMatch = /\b(today|tonight)\b/i;
  const tomorrowMatch = /\b(tomorrow)\b/i;
  const inDaysMatch = /\bin\s+(\d+)\s+days?\b/i;
  const dayOfWeekMatch = /\b(?:on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;

  if (todayMatch.test(text)) {
    result.dueDate = getFormattedOffsetDate(0);
    result.detectedTags.push({ type: 'date', label: '📅 Today' });
    text = text.replace(todayMatch, '').trim();
  } else if (tomorrowMatch.test(text)) {
    result.dueDate = getFormattedOffsetDate(1);
    result.detectedTags.push({ type: 'date', label: '📅 Tomorrow' });
    text = text.replace(tomorrowMatch, '').trim();
  } else if (inDaysMatch.test(text)) {
    const m = text.match(inDaysMatch);
    const count = parseInt(m[1], 10);
    result.dueDate = getFormattedOffsetDate(count);
    result.detectedTags.push({ type: 'date', label: `📅 In ${count}d` });
    text = text.replace(inDaysMatch, '').trim();
  } else if (dayOfWeekMatch.test(text)) {
    const m = text.match(dayOfWeekMatch);
    const targetDay = m[1].toLowerCase();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIdx = new Date().getDay();
    let targetDayIdx = days.indexOf(targetDay);
    let diff = targetDayIdx - currentDayIdx;
    if (diff <= 0) diff += 7; // Next occurrence
    result.dueDate = getFormattedOffsetDate(diff);
    result.detectedTags.push({ type: 'date', label: `📅 Next ${m[1]}` });
    text = text.replace(dayOfWeekMatch, '').trim();
  }

  // Clean remaining double spaces or dangling punctuation
  result.cleanTitle = text.replace(/\s{2,}/g, ' ').trim();
  return result;
}

function updateNlpPreviewUI(inputVal) {
  if (!inputVal.trim()) {
    dom.smartNlpPreview.classList.add('hidden');
    dom.nlpBadges.innerHTML = '';
    return;
  }

  const parsed = parseTaskNLP(inputVal);
  if (parsed.detectedTags.length > 0) {
    dom.smartNlpPreview.classList.remove('hidden');
    dom.nlpBadges.innerHTML = parsed.detectedTags.map(tag => `
      <span class="nlp-badge-item">${escapeHTML(tag.label)}</span>
    `).join('');

    // Pre-sync inline form selectors for immediate visual feedback
    if (parsed.category) dom.inlineCategory.value = parsed.category;
    if (parsed.priority) dom.inlinePriority.value = parsed.priority;
    if (parsed.dueDate) dom.inlineDate.value = parsed.dueDate;
  } else {
    dom.smartNlpPreview.classList.add('hidden');
    dom.nlpBadges.innerHTML = '';
  }
}

// ==========================================
// 8. AI TASK DECOMPOSITION ENGINE
// ==========================================

function generateAISubtasks(taskTitle) {
  const t = (taskTitle || '').toLowerCase();

  // Curated domain rules for instant, high-quality decomposition
  if (t.includes('launch') || t.includes('release') || t.includes('deploy') || t.includes('website') || t.includes('app')) {
    return [
      "Define release scope and checklist",
      "Run regression test suite and QA audit",
      "Verify production environment configuration",
      "Execute staging deployment & smoke test",
      "Announce update to team & monitor error telemetry"
    ];
  }

  if (t.includes('workout') || t.includes('gym') || t.includes('cardio') || t.includes('run') || t.includes('exercise')) {
    return [
      "Dynamic warmup & joint mobility (10 mins)",
      "Primary targeted exercise circuits",
      "High-intensity core conditioning",
      "Cool-down, deep hamstring stretch & hydration"
    ];
  }

  if (t.includes('meeting') || t.includes('presentation') || t.includes('slide') || t.includes('deck') || t.includes('pitch')) {
    return [
      "Outline core narrative and key decisions needed",
      "Draft concise slide deck and supporting visuals",
      "Practice timed presentation walkthrough",
      "Distribute agenda & briefing doc to attendees"
    ];
  }

  if (t.includes('study') || t.includes('exam') || t.includes('learn') || t.includes('read') || t.includes('course')) {
    return [
      "Review chapter summary and key terminology",
      "Create flashcards or interactive practice quiz",
      "Solve 3 difficult test problems without notes",
      "Re-summarize difficult concepts in simple terms"
    ];
  }

  if (t.includes('grocer') || t.includes('shopping') || t.includes('buy') || t.includes('pantry') || t.includes('market')) {
    return [
      "Audit refrigerator and pantry essentials",
      "Categorize shopping list by store aisle",
      "Select fresh produce and protein staples",
      "Unpack, organize containers and meal-prep"
    ];
  }

  if (t.includes('clean') || t.includes('organize') || t.includes('declutter') || t.includes('room') || t.includes('desk')) {
    return [
      "Clear all surface clutter into designated bins",
      "Sort items into keep, donate, and recycle",
      "Dust and wipe down electronic monitors & desk",
      "Tidy cables and vacuum the floor"
    ];
  }

  if (t.includes('budget') || t.includes('tax') || t.includes('invoice') || t.includes('finance')) {
    return [
      "Gather receipts, statements, and transaction records",
      "Categorize recurring expenses and cash inflows",
      "Audit discrepancies and calculate balance totals",
      "Archive finalized spreadsheets and set reminder"
    ];
  }

  // Dynamic context-aware fallback breakdown
  return [
    `Clarify specific objective for "${taskTitle.slice(0, 30)}"`,
    "Gather required reference material and assets",
    "Complete initial draft / implementation milestone",
    "Perform quality review and polish final details"
  ];
}

// ==========================================
// 9. SPEECH-TO-TEXT / VOICE INPUT
// ==========================================

let speechRecognition = null;
let isRecordingVoice = false;

function initVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    dom.voiceInputBtn.style.display = 'none';
    return;
  }

  speechRecognition = new SpeechRec();
  speechRecognition.continuous = false;
  speechRecognition.interimResults = false;
  speechRecognition.lang = 'en-US';

  speechRecognition.onstart = () => {
    isRecordingVoice = true;
    dom.voiceInputBtn.classList.add('listening');
    dom.voiceIcon.className = "ph-bold ph-waveform";
    showToast("Listening... speak your task naturally! 🎙️", false);
  };

  speechRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    dom.inlineTaskTitle.value = transcript;
    updateNlpPreviewUI(transcript);
    sounds.playPop();
    showToast(`Transcribed: "${transcript}"`, false);
  };

  speechRecognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    isRecordingVoice = false;
    dom.voiceInputBtn.classList.remove('listening');
    dom.voiceIcon.className = "ph-bold ph-microphone";
    showToast("Voice input didn't catch that. Please try again.", false);
  };

  speechRecognition.onend = () => {
    isRecordingVoice = false;
    dom.voiceInputBtn.classList.remove('listening');
    dom.voiceIcon.className = "ph-bold ph-microphone";
  };
}

function toggleVoiceInput() {
  if (!speechRecognition) {
    alert("Speech Recognition is not supported by your current browser. Try Google Chrome or Microsoft Edge.");
    return;
  }

  if (isRecordingVoice) {
    speechRecognition.stop();
  } else {
    try {
      speechRecognition.start();
    } catch (e) {
      console.warn("Voice start error:", e);
    }
  }
}

// ==========================================
// 10. FOCUS POMODORO TIMER ENGINE
// ==========================================

const pomodoroState = {
  durationSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  mode: 'pomodoro', // 'pomodoro', 'shortBreak', 'longBreak'
  isRunning: false,
  timerId: null,
  activeTaskId: null
};

function initPomodoroTimer() {
  updatePomodoroDisplay();
  populatePomodoroTaskDropdown();
}

function switchPomodoroMode(mode, minutes) {
  clearInterval(pomodoroState.timerId);
  pomodoroState.isRunning = false;
  pomodoroState.mode = mode;
  pomodoroState.durationSeconds = minutes * 60;
  pomodoroState.remainingSeconds = minutes * 60;

  dom.pomodoroBtnLabel.textContent = "Start Focus";
  dom.pomodoroBtnIcon.className = "ph-bold ph-play";
  dom.pomodoroStatusText.textContent = mode === 'pomodoro' ? 'Ready to Focus' : 'Relax & Recharge';

  document.querySelectorAll('.pomo-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.mode === mode);
  });

  updatePomodoroDisplay();
}

function togglePomodoroTimer() {
  sounds.playPop();
  if (pomodoroState.isRunning) {
    // Pause
    clearInterval(pomodoroState.timerId);
    pomodoroState.isRunning = false;
    dom.pomodoroBtnLabel.textContent = "Resume";
    dom.pomodoroBtnIcon.className = "ph-bold ph-play";
    dom.pomodoroStatusText.textContent = "Paused";
  } else {
    // Start
    pomodoroState.isRunning = true;
    dom.pomodoroBtnLabel.textContent = "Pause";
    dom.pomodoroBtnIcon.className = "ph-bold ph-pause";
    dom.pomodoroStatusText.textContent = pomodoroState.mode === 'pomodoro' ? "Deep Focus Active" : "Break Active";

    pomodoroState.timerId = setInterval(() => {
      pomodoroState.remainingSeconds--;
      updatePomodoroDisplay();

      if (pomodoroState.remainingSeconds <= 0) {
        clearInterval(pomodoroState.timerId);
        pomodoroState.isRunning = false;
        handlePomodoroComplete();
      }
    }, 1000);
  }
}

function resetPomodoroTimer() {
  clearInterval(pomodoroState.timerId);
  pomodoroState.isRunning = false;
  pomodoroState.remainingSeconds = pomodoroState.durationSeconds;
  dom.pomodoroBtnLabel.textContent = "Start Focus";
  dom.pomodoroBtnIcon.className = "ph-bold ph-play";
  dom.pomodoroStatusText.textContent = "Ready to Focus";
  updatePomodoroDisplay();
  sounds.playPop();
}

function updatePomodoroDisplay() {
  const mins = Math.floor(pomodoroState.remainingSeconds / 60);
  const secs = pomodoroState.remainingSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  dom.pomodoroTimeDigits.textContent = timeStr;
  dom.topbarTimerDisplay.textContent = timeStr;

  // SVG ring stroke-dashoffset animation
  // 2 * PI * 88 = 552.92
  const circumference = 552.92;
  const progressRatio = (pomodoroState.durationSeconds - pomodoroState.remainingSeconds) / pomodoroState.durationSeconds;
  const offset = circumference * (1 - progressRatio);
  dom.timerProgressCircle.style.strokeDashoffset = offset;
}

function handlePomodoroComplete() {
  sounds.playPomoBell();
  confetti.burst();

  if (pomodoroState.mode === 'pomodoro') {
    const minsAdded = Math.round(pomodoroState.durationSeconds / 60);
    state.focusTimeMinutes += minsAdded;
    state.savePreferences();

    // If linked to a task, increment its focus sessions
    if (pomodoroState.activeTaskId) {
      const task = state.tasks.find(t => t.id === pomodoroState.activeTaskId);
      if (task) {
        task.focusSessions = (task.focusSessions || 0) + 1;
        state.saveTasks();
        renderAll();
      }
    }

    showToast(`🎉 Focus session complete! Logged +${minsAdded} mins deep focus. Time for a break!`, false);
    switchPomodoroMode('shortBreak', 5);
  } else {
    showToast("Break over! Ready for your next productive burst? 🚀", false);
    switchPomodoroMode('pomodoro', 25);
  }

  dom.pomoTotalFocusStat.textContent = `${state.focusTimeMinutes} mins`;
}

function populatePomodoroTaskDropdown() {
  dom.pomoTaskSelect.innerHTML = `<option value="">-- General Focus Session --</option>`;
  state.tasks.filter(t => !t.completed).forEach(task => {
    const opt = document.createElement('option');
    opt.value = task.id;
    opt.textContent = `${task.title.slice(0, 45)} (${task.category})`;
    if (task.id === pomodoroState.activeTaskId) opt.selected = true;
    dom.pomoTaskSelect.appendChild(opt);
  });
  dom.pomoTotalFocusStat.textContent = `${state.focusTimeMinutes} mins`;
}

// ==========================================
// 11. TASK FILTERING & SORTING LOGIC
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
// 12. VIEW SWITCHING (LIST / KANBAN / MATRIX)
// ==========================================

function switchViewMode(mode, shouldSave = true) {
  state.viewMode = mode;
  if (shouldSave) state.savePreferences();

  dom.modeBtnList.classList.toggle('active', mode === 'list');
  dom.modeBtnKanban.classList.toggle('active', mode === 'kanban');
  dom.modeBtnMatrix.classList.toggle('active', mode === 'matrix');

  dom.taskListSection.classList.toggle('hidden', mode !== 'list');
  dom.kanbanBoardSection.classList.toggle('hidden', mode !== 'kanban');
  dom.matrixViewSection.classList.toggle('hidden', mode !== 'matrix');

  renderAll();
}

// ==========================================
// 13. MASTER RENDERING
// ==========================================

function renderAll() {
  updateCountsAndStats();
  updateViewHeaders();

  if (state.viewMode === 'list') {
    renderTaskList();
  } else if (state.viewMode === 'kanban') {
    renderKanbanBoard();
  } else if (state.viewMode === 'matrix') {
    renderEisenhowerMatrix();
  }
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
    dom.bannerSubtext.textContent = `You have ${todayTasks.length} task${todayTasks.length === 1 ? '' : 's'} scheduled for today (${todayCompleted} done). Keep your momentum!`;
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
    dom.prodQuote.textContent = "⚡ Halfway through today's goals! Keep pushing.";
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

// ------------------------------------------
// 13A. LIST VIEW RENDERER
// ------------------------------------------

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

  const catColors = {
    Work: 'var(--cat-work)',
    Personal: 'var(--cat-personal)',
    Health: 'var(--cat-health)',
    Projects: 'var(--cat-projects)'
  };
  card.style.setProperty('--card-accent', catColors[task.category] || 'var(--accent-primary)');

  // Due Date Badge
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

  const priorityLabels = {
    urgent: '🔥 Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };

  // Subtasks Counter
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
  } else {
    // If no subtasks, show quick AI decompose button
    subtasksBadgeHtml = `
      <button class="subtasks-toggle-btn ai-magic-btn" data-action="quick-ai-decompose" title="Generate AI Steps for this task">
        <i class="ph-bold ph-sparkle"></i>
        <span>AI Steps</span>
      </button>
    `;
  }

  // Estimated Duration / Focus sessions badge
  let timeBadgeHtml = '';
  if (task.estimatedTime) {
    timeBadgeHtml = `<span class="badge badge-cat"><i class="ph ph-timer"></i> ${escapeHTML(task.estimatedTime)}</span>`;
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
          ${timeBadgeHtml}
          ${subtasksBadgeHtml}
        </div>
      </div>

      <div class="task-actions">
        <button class="action-icon-btn focus-task-btn" data-action="focus-pomodoro" title="Focus on this task in Pomodoro">
          <i class="ph-fill ph-timer"></i>
        </button>
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

// ------------------------------------------
// 13B. KANBAN BOARD RENDERER & DRAG-AND-DROP
// ------------------------------------------

function renderKanbanBoard() {
  const filtered = getFilteredTasks();

  const todoTasks = filtered.filter(t => !t.completed && (t.status === 'todo' || !t.status));
  const inprogressTasks = filtered.filter(t => !t.completed && t.status === 'inprogress');
  const doneTasks = filtered.filter(t => t.completed || t.status === 'done');

  dom.kanbanCountTodo.textContent = todoTasks.length;
  dom.kanbanCountInprogress.textContent = inprogressTasks.length;
  dom.kanbanCountDone.textContent = doneTasks.length;

  dom.kanbanListTodo.innerHTML = '';
  dom.kanbanListInprogress.innerHTML = '';
  dom.kanbanListDone.innerHTML = '';

  todoTasks.forEach(task => dom.kanbanListTodo.appendChild(createKanbanCardElement(task, 'todo')));
  inprogressTasks.forEach(task => dom.kanbanListInprogress.appendChild(createKanbanCardElement(task, 'inprogress')));
  doneTasks.forEach(task => dom.kanbanListDone.appendChild(createKanbanCardElement(task, 'done')));

  setupKanbanDragAndDrop();
}

function createKanbanCardElement(task, colStatus) {
  const card = document.createElement('div');
  card.className = `kanban-card ${colStatus === 'done' ? 'done-card' : ''}`;
  card.setAttribute('draggable', 'true');
  card.setAttribute('data-id', task.id);

  const catColors = { Work: '#38bdf8', Personal: '#f472b6', Health: '#4ade80', Projects: '#a78bfa' };
  card.style.setProperty('--card-accent', catColors[task.category] || 'var(--accent-primary)');

  const totalSub = task.subtasks ? task.subtasks.length : 0;
  const doneSub = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;

  // Move buttons based on column
  let moveButtons = '';
  if (colStatus === 'todo') {
    moveButtons = `<button class="btn-move" data-move-to="inprogress" title="Move to In Progress"><i class="ph-bold ph-arrow-right"></i></button>`;
  } else if (colStatus === 'inprogress') {
    moveButtons = `
      <button class="btn-move" data-move-to="todo" title="Move back to To Do"><i class="ph-bold ph-arrow-left"></i></button>
      <button class="btn-move" data-move-to="done" title="Mark Done"><i class="ph-bold ph-check"></i></button>
    `;
  } else {
    moveButtons = `<button class="btn-move" data-move-to="inprogress" title="Reopen to In Progress"><i class="ph-bold ph-arrow-left"></i></button>`;
  }

  card.innerHTML = `
    <div class="kanban-card-title">${escapeHTML(task.title)}</div>
    <div class="kanban-card-meta">
      <span class="badge badge-priority-${task.priority}">${task.priority}</span>
      <span class="badge badge-cat">${escapeHTML(task.category)}</span>
      ${totalSub > 0 ? `<span class="badge badge-cat">${doneSub}/${totalSub} steps</span>` : ''}
    </div>
    <div class="kanban-card-footer">
      <span class="kanban-date-tag">${task.dueDate ? formatDateDisplay(task.dueDate) : 'No date'}</span>
      <div class="kanban-move-actions">
        ${moveButtons}
      </div>
    </div>
  `;

  return card;
}

function setupKanbanDragAndDrop() {
  const cards = document.querySelectorAll('.kanban-card');
  const columns = document.querySelectorAll('.kanban-column');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      columns.forEach(col => col.classList.remove('drag-over'));
    });
  });

  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStatus = col.dataset.status;
      if (taskId && targetStatus) {
        updateTaskStatus(taskId, targetStatus);
      }
    });
  });
}

function updateTaskStatus(taskId, newStatus) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = newStatus;
  if (newStatus === 'done') {
    task.completed = true;
    task.completedAt = task.completedAt || new Date().toISOString();
    sounds.playComplete();
    confetti.burst();
  } else {
    task.completed = false;
    task.completedAt = null;
    sounds.playPop();
  }

  state.saveTasks();
  renderAll();
}

// ------------------------------------------
// 13C. EISENHOWER MATRIX RENDERER
// ------------------------------------------

function renderEisenhowerMatrix() {
  const filtered = getFilteredTasks();
  const todayStr = getFormattedOffsetDate(0);

  // Clear quadrant lists
  dom.listQ1.innerHTML = '';
  dom.listQ2.innerHTML = '';
  dom.listQ3.innerHTML = '';
  dom.listQ4.innerHTML = '';

  let q1Tasks = [], q2Tasks = [], q3Tasks = [], q4Tasks = [];

  filtered.forEach(task => {
    const isUrgent = task.priority === 'urgent' || (task.dueDate && task.dueDate <= todayStr);
    const isImportant = task.priority === 'urgent' || task.priority === 'high';

    if (isUrgent && isImportant) {
      q1Tasks.push(task);
    } else if (!isUrgent && isImportant) {
      q2Tasks.push(task);
    } else if (isUrgent && !isImportant) {
      q3Tasks.push(task);
    } else {
      q4Tasks.push(task);
    }
  });

  dom.countQ1.textContent = q1Tasks.length;
  dom.countQ2.textContent = q2Tasks.length;
  dom.countQ3.textContent = q3Tasks.length;
  dom.countQ4.textContent = q4Tasks.length;

  q1Tasks.forEach(t => dom.listQ1.appendChild(createMatrixTaskElement(t)));
  q2Tasks.forEach(t => dom.listQ2.appendChild(createMatrixTaskElement(t)));
  q3Tasks.forEach(t => dom.listQ3.appendChild(createMatrixTaskElement(t)));
  q4Tasks.forEach(t => dom.listQ4.appendChild(createMatrixTaskElement(t)));
}

function createMatrixTaskElement(task) {
  const div = document.createElement('div');
  div.className = `matrix-task-item ${task.completed ? 'completed' : ''}`;
  div.setAttribute('data-id', task.id);

  div.innerHTML = `
    <div class="matrix-task-left">
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle-complete">
      <span class="matrix-task-title">${escapeHTML(task.title)}</span>
    </div>
    <div class="matrix-task-right">
      <button class="action-icon-btn edit-btn" data-action="edit-task" title="Edit">
        <i class="ph ph-pencil-simple"></i>
      </button>
    </div>
  `;

  return div;
}

// ==========================================
// 14. PRODUCTIVITY ANALYTICS & INSIGHTS
// ==========================================

function openAnalyticsModal() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Calculate score (0 to 100)
  const score = Math.min(100, Math.round(rate * 0.7 + Math.min(30, state.streakDays * 5) + Math.min(10, state.focusTimeMinutes / 10)));
  
  dom.analyticsScore.textContent = score;
  dom.analyticsCompletedCount.textContent = completed;
  dom.analyticsStreakVal.textContent = `${state.streakDays} days`;
  dom.analyticsFocusMin.textContent = `${state.focusTimeMinutes}m`;

  renderVelocityBarChart();
  renderDistributionBars();
  renderAICoachInsight(rate, completed, total);

  dom.analyticsModal.classList.remove('hidden');
}

function renderVelocityBarChart() {
  dom.velocityBarChart.innerHTML = '';
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();

  // Create an array for the last 7 days ending today
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = daysOfWeek[d.getDay()];
    
    // Count completed tasks on this date
    const count = state.tasks.filter(t => {
      if (!t.completedAt) return false;
      return t.completedAt.startsWith(dayStr);
    }).length + (i === 0 ? 1 : 0); // Include today's sample completion

    last7Days.push({ dayName, count });
  }

  const maxCount = Math.max(1, ...last7Days.map(d => d.count));

  last7Days.forEach(item => {
    const heightPct = Math.round((item.count / maxCount) * 85) + 15;
    const group = document.createElement('div');
    group.className = 'chart-bar-group';
    group.innerHTML = `
      <div class="chart-bar-pillar" style="height: ${heightPct}%">
        <span class="chart-bar-count">${item.count}</span>
      </div>
      <span class="chart-bar-label">${item.dayName}</span>
    `;
    dom.velocityBarChart.appendChild(group);
  });
}

function renderDistributionBars() {
  const total = state.tasks.length || 1;

  // Category distribution
  const categories = [
    { name: 'Work', color: 'var(--cat-work)' },
    { name: 'Personal', color: 'var(--cat-personal)' },
    { name: 'Health', color: 'var(--cat-health)' },
    { name: 'Projects', color: 'var(--cat-projects)' }
  ];

  dom.categoryDistributionBars.innerHTML = categories.map(cat => {
    const count = state.tasks.filter(t => t.category === cat.name).length;
    const pct = Math.round((count / total) * 100);
    return `
      <div class="dist-bar-item">
        <div class="dist-bar-header">
          <span class="dist-bar-name">${cat.name}</span>
          <span class="dist-bar-val">${count} (${pct}%)</span>
        </div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${pct}%; background: ${cat.color};"></div>
        </div>
      </div>
    `;
  }).join('');

  // Priority distribution
  const priorities = [
    { name: 'Urgent', key: 'urgent', color: '#f87171' },
    { name: 'High', key: 'high', color: '#fb923c' },
    { name: 'Medium', key: 'medium', color: '#facc15' },
    { name: 'Low', key: 'low', color: '#60a5fa' }
  ];

  dom.priorityDistributionBars.innerHTML = priorities.map(prio => {
    const count = state.tasks.filter(t => t.priority === prio.key).length;
    const pct = Math.round((count / total) * 100);
    return `
      <div class="dist-bar-item">
        <div class="dist-bar-header">
          <span class="dist-bar-name">${prio.name}</span>
          <span class="dist-bar-val">${count} (${pct}%)</span>
        </div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${pct}%; background: ${prio.color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAICoachInsight(rate, completed, total) {
  const urgentCount = state.tasks.filter(t => t.priority === 'urgent' && !t.completed).length;

  if (rate >= 80) {
    dom.aiCoachInsightText.textContent = `🌟 Incredible execution! You've achieved an ${rate}% completion rate. You are in peak flow state—consider batching long-term creative goals or scheduling a well-deserved recovery break.`;
  } else if (urgentCount >= 2) {
    dom.aiCoachInsightText.textContent = `⚠️ You currently have ${urgentCount} urgent tasks pending. Recommendation: Start a 25-minute Pomodoro focus block on your top urgent item without multitasking. Single-tasking will unlock rapid velocity.`;
  } else if (completed === 0 && total > 0) {
    dom.aiCoachInsightText.textContent = `💡 Motivation follows action: Pick the smallest subtask on your list and complete it in under 5 minutes. The dopamine hit will kickstart your momentum!`;
  } else {
    dom.aiCoachInsightText.textContent = `⚡ Balanced workflow: You have a healthy distribution across work and personal tasks. Keep using Pomodoro blocks to maintain focus without burnout.`;
  }
}

// ==========================================
// 15. TASK MUTATIONS & ACTIONS
// ==========================================

function toggleTaskComplete(taskId, event) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  task.status = task.completed ? 'done' : 'todo';
  state.saveTasks();

  if (task.completed) {
    sounds.playComplete();
    if (event && event.target) {
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
    if (state.lastDeletedTask) {
      state.tasks.splice(state.lastDeletedIndex, 0, state.lastDeletedTask);
      state.saveTasks();
      state.lastDeletedTask = null;
      renderAll();
      sounds.playAdd();
      showToast(`Restored task!`, false);
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

  // If subtasks accordion was open, keep it open
  const card = dom.taskList.querySelector(`[data-id="${taskId}"]`);
  if (card) {
    const subContainer = card.querySelector('.subtasks-container');
    if (subContainer) subContainer.style.display = 'flex';
  }
}

function clearCompletedTasks() {
  const completedTasks = state.tasks.filter(t => t.completed || t.status === 'done');
  if (completedTasks.length === 0) {
    showToast("No completed tasks to clear.", false);
    return;
  }

  if (confirm(`Are you sure you want to remove ${completedTasks.length} completed task(s)?`)) {
    state.tasks = state.tasks.filter(t => !t.completed && t.status !== 'done');
    state.saveTasks();
    sounds.playDelete();
    renderAll();
    showToast(`Removed ${completedTasks.length} completed tasks.`, false);
  }
}

function quickAIDecompose(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const steps = generateAISubtasks(task.title);
  task.subtasks = steps.map((step, idx) => ({
    id: `sub-${Date.now()}-${idx}`,
    title: step,
    completed: false
  }));

  state.saveTasks();
  sounds.playAdd();
  renderAll();

  // Expand subtasks
  const card = dom.taskList.querySelector(`[data-id="${taskId}"]`);
  if (card) {
    const subContainer = card.querySelector('.subtasks-container');
    if (subContainer) subContainer.style.display = 'flex';
  }
  showToast(`✨ Generated ${steps.length} smart subtasks for "${task.title.slice(0, 25)}..."!`, false);
}

// ==========================================
// 16. TASK MODAL (ADD / EDIT)
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
    dom.modalStatus.value = task.status || (task.completed ? 'done' : 'todo');

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
    dom.modalStatus.value = 'todo';
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

function triggerModalAIBreakdown() {
  const title = dom.modalTitle.value.trim();
  if (!title) {
    showToast("Please enter a task title first so AI can suggest steps!", false);
    dom.modalTitle.focus();
    return;
  }

  const steps = generateAISubtasks(title);
  steps.forEach(step => {
    modalSubtasksCache.push({
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: step,
      completed: false
    });
  });

  renderModalSubtasks();
  sounds.playAdd();
  showToast(`✨ Added ${steps.length} smart subtasks for "${title.slice(0, 25)}..."!`, false);
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
  const status = dom.modalStatus.value;
  const isDone = status === 'done';

  if (taskId) {
    // Update existing
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      task.title = title;
      task.description = description;
      task.category = category;
      task.priority = priority;
      task.dueDate = dueDate;
      task.status = status;
      task.completed = isDone;
      if (isDone && !task.completedAt) task.completedAt = new Date().toISOString();
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
      status,
      dueDate,
      completed: isDone,
      completedAt: isDone ? new Date().toISOString() : null,
      starred: false,
      estimatedTime: '30m',
      focusSessions: 0,
      subtasks: [...modalSubtasksCache],
      createdAt: new Date().toISOString()
    };
    state.tasks.unshift(newTask);
    state.saveTasks();
    sounds.playAdd();
    showToast("Task created! 🚀", false);
  }

  closeTaskModal();
  renderAll();
  populatePomodoroTaskDropdown();
}

// ==========================================
// 17. INLINE TASK ADDER (WITH NLP PARSER)
// ==========================================

function handleInlineAdd(e) {
  e.preventDefault();
  const rawInput = dom.inlineTaskTitle.value.trim();
  if (!rawInput) return;

  // Run NLP extraction
  const nlp = parseTaskNLP(rawInput);
  const title = nlp.cleanTitle || rawInput;
  const category = nlp.category || dom.inlineCategory.value;
  const priority = nlp.priority || dom.inlinePriority.value;
  const dueDate = nlp.dueDate || dom.inlineDate.value;
  const estimatedTime = nlp.duration || '30m';

  const newTask = {
    id: `zenith-${Date.now()}`,
    title,
    description: '',
    category,
    priority,
    status: 'todo',
    dueDate,
    completed: false,
    completedAt: null,
    starred: false,
    estimatedTime,
    focusSessions: 0,
    subtasks: [],
    createdAt: new Date().toISOString()
  };

  state.tasks.unshift(newTask);
  state.saveTasks();
  sounds.playAdd();

  dom.inlineTaskTitle.value = '';
  dom.smartNlpPreview.classList.add('hidden');
  dom.nlpBadges.innerHTML = '';
  showToast("Quick task added with smart tags! 🚀", false);
  renderAll();
  populatePomodoroTaskDropdown();
}

// ==========================================
// 18. BACKUP, RESTORE & EXPORT (JSON / MD / CSV)
// ==========================================

function exportBackupJSON() {
  const data = {
    app: "Zenith Tasks",
    exportDate: new Date().toISOString(),
    tasks: state.tasks
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `zenith_backup_${getFormattedOffsetDate(0)}.json`);
  showToast("Backup exported as JSON!", false);
}

function exportMarkdownChecklist() {
  let md = `# Zenith Tasks — Exported on ${new Date().toLocaleDateString()}\n\n`;
  
  const categories = ['Work', 'Projects', 'Personal', 'Health'];
  categories.forEach(cat => {
    const tasks = state.tasks.filter(t => t.category === cat);
    if (tasks.length > 0) {
      md += `## 📁 ${cat}\n\n`;
      tasks.forEach(t => {
        const check = t.completed ? '[x]' : '[ ]';
        const prio = t.priority ? `[!${t.priority.toUpperCase()}]` : '';
        const due = t.dueDate ? `(Due: ${t.dueDate})` : '';
        md += `- ${check} **${t.title}** ${prio} ${due}\n`;
        if (t.description) md += `  > ${t.description}\n`;
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach(s => {
            md += `  - ${s.completed ? '[x]' : '[ ]'} ${s.title}\n`;
          });
        }
      });
      md += '\n';
    }
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `zenith_tasks_${getFormattedOffsetDate(0)}.md`);
  showToast("Exported as Markdown checklist!", false);
}

function exportCSVSpreadsheet() {
  let csv = "ID,Title,Category,Priority,Status,Due Date,Subtasks Total,Subtasks Done\n";
  state.tasks.forEach(t => {
    const titleEsc = `"${(t.title || '').replace(/"/g, '""')}"`;
    const subTotal = t.subtasks ? t.subtasks.length : 0;
    const subDone = t.subtasks ? t.subtasks.filter(s => s.completed).length : 0;
    csv += `${t.id},${titleEsc},${t.category},${t.priority},${t.status || 'todo'},${t.dueDate || ''},${subTotal},${subDone}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `zenith_tasks_${getFormattedOffsetDate(0)}.csv`);
  showToast("Exported as CSV spreadsheet!", false);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importBackupJSON(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && Array.isArray(parsed.tasks)) {
        state.tasks = parsed.tasks.map(t => ({
          ...t,
          status: t.status || (t.completed ? 'done' : 'todo')
        }));
        state.saveTasks();
        renderAll();
        populatePomodoroTaskDropdown();
        dom.backupModal.classList.add('hidden');
        showToast(`Successfully imported ${parsed.tasks.length} tasks!`, false);
      } else {
        alert("Invalid backup file: missing tasks array.");
      }
    } catch (err) {
      alert("Error reading JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function resetWithSampleData() {
  if (confirm("Reset current task list with default sample data? Existing tasks will be replaced.")) {
    state.tasks = JSON.parse(JSON.stringify(SAMPLE_TASKS));
    state.saveTasks();
    dom.backupModal.classList.add('hidden');
    renderAll();
    populatePomodoroTaskDropdown();
    showToast("Reset to sample data completed.", false);
  }
}

// ==========================================
// 19. TOAST NOTIFICATION SYSTEM
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
// 20. EVENT LISTENERS & DELEGATION
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

  // View Mode Switcher (List / Board / Matrix)
  dom.modeBtnList.addEventListener('click', () => switchViewMode('list'));
  dom.modeBtnKanban.addEventListener('click', () => switchViewMode('kanban'));
  dom.modeBtnMatrix.addEventListener('click', () => switchViewMode('matrix'));

  // Pomodoro Focus Modal Buttons
  dom.openPomodoroBtn.addEventListener('click', () => {
    populatePomodoroTaskDropdown();
    dom.pomodoroModal.classList.remove('hidden');
  });
  dom.closePomodoroBtn.addEventListener('click', () => dom.pomodoroModal.classList.add('hidden'));

  document.querySelectorAll('.pomo-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchPomodoroMode(tab.dataset.mode, parseInt(tab.dataset.minutes, 10));
    });
  });

  dom.pomodoroStartPauseBtn.addEventListener('click', togglePomodoroTimer);
  dom.pomodoroResetBtn.addEventListener('click', resetPomodoroTimer);
  dom.pomoTaskSelect.addEventListener('change', (e) => {
    pomodoroState.activeTaskId = e.target.value || null;
  });

  // Productivity Analytics Modal
  dom.openAnalyticsBtn.addEventListener('click', openAnalyticsModal);
  dom.closeAnalyticsBtn.addEventListener('click', () => dom.analyticsModal.classList.add('hidden'));

  // Shortcuts Modal
  dom.shortcutsBtn.addEventListener('click', () => dom.shortcutsModal.classList.remove('hidden'));
  dom.closeShortcutsBtn.addEventListener('click', () => dom.shortcutsModal.classList.add('hidden'));
  dom.closeShortcutsFooterBtn.addEventListener('click', () => dom.shortcutsModal.classList.add('hidden'));

  // Backup Modal
  dom.exportImportBtn.addEventListener('click', () => dom.backupModal.classList.remove('hidden'));
  dom.closeBackupBtn.addEventListener('click', () => dom.backupModal.classList.add('hidden'));
  dom.exportJsonBtn.addEventListener('click', exportBackupJSON);
  dom.exportMdBtn.addEventListener('click', exportMarkdownChecklist);
  dom.exportCsvBtn.addEventListener('click', exportCSVSpreadsheet);
  dom.importJsonFile.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      importBackupJSON(e.target.files[0]);
    }
  });
  dom.resetSampleBtn.addEventListener('click', resetWithSampleData);

  // Search Input
  dom.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    dom.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderAll();
  });

  dom.clearSearchBtn.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.searchQuery = '';
    dom.clearSearchBtn.style.display = 'none';
    renderAll();
  });

  // Priority Filter & Sort
  dom.filterPriority.addEventListener('change', (e) => {
    state.priorityFilter = e.target.value;
    renderAll();
  });

  dom.sortSelect.addEventListener('change', (e) => {
    state.sortOption = e.target.value;
    renderAll();
  });

  // Status Filter Pills
  dom.statusPillFilter.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    dom.statusPillFilter.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.statusFilter = pill.dataset.status;
    renderAll();
  });

  // Clear completed
  dom.clearCompletedBtn.addEventListener('click', clearCompletedTasks);
  dom.kanbanClearDone.addEventListener('click', clearCompletedTasks);

  // Add Task Modal Triggers
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

  // Modal Subtasks Builder
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

  dom.modalAiBreakdownBtn.addEventListener('click', triggerModalAIBreakdown);

  // Inline Quick Add & Real-time NLP
  dom.inlineAddForm.addEventListener('submit', handleInlineAdd);
  dom.inlineTaskTitle.addEventListener('input', (e) => {
    updateNlpPreviewUI(e.target.value);
  });

  // Inline AI Subtask Breakdown Button
  dom.inlineAiBreakdownBtn.addEventListener('click', () => {
    const title = dom.inlineTaskTitle.value.trim();
    if (!title) {
      showToast("Type a task title first, then click AI Steps! ✨", false);
      dom.inlineTaskTitle.focus();
      return;
    }
    openTaskModal();
    dom.modalTitle.value = title;
    triggerModalAIBreakdown();
  });

  // Voice Input (Speech Recognition)
  initVoiceRecognition();
  dom.voiceInputBtn.addEventListener('click', toggleVoiceInput);

  // Kanban Column Quick Add
  document.querySelectorAll('.kanban-quick-add').forEach(btn => {
    btn.addEventListener('click', () => {
      openTaskModal();
      dom.modalStatus.value = btn.dataset.column;
    });
  });

  // Kanban Move Action buttons delegation
  dom.kanbanBoardSection.addEventListener('click', (e) => {
    const moveBtn = e.target.closest('.btn-move');
    if (!moveBtn) return;
    const card = moveBtn.closest('.kanban-card');
    if (!card) return;
    const targetStatus = moveBtn.dataset.moveTo;
    updateTaskStatus(card.dataset.id, targetStatus);
  });

  // Task List Delegation (Checkbox, Star, Edit, Delete, Subtasks, AI Decompose, Focus)
  dom.taskList.addEventListener('click', (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;
    const taskId = card.dataset.id;

    // Toggle Complete Checkbox
    if (e.target.closest('[data-action="toggle-complete"]') || e.target.closest('.custom-checkbox-wrapper')) {
      toggleTaskComplete(taskId, e);
      return;
    }

    // Pomodoro focus trigger
    if (e.target.closest('[data-action="focus-pomodoro"]')) {
      pomodoroState.activeTaskId = taskId;
      populatePomodoroTaskDropdown();
      dom.pomodoroModal.classList.remove('hidden');
      return;
    }

    // Star Toggle
    if (e.target.closest('[data-action="toggle-star"]')) {
      toggleTaskStar(taskId);
      return;
    }

    // Edit Task
    if (e.target.closest('[data-action="edit-task"]')) {
      openTaskModal(taskId);
      return;
    }

    // Delete Task
    if (e.target.closest('[data-action="delete-task"]')) {
      deleteTask(taskId);
      return;
    }

    // Quick AI Decompose button
    if (e.target.closest('[data-action="quick-ai-decompose"]')) {
      quickAIDecompose(taskId);
      return;
    }

    // Toggle Subtasks Accordion
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

    // Subtask completion toggle
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

  // Matrix View Delegation
  dom.matrixViewSection.addEventListener('click', (e) => {
    const item = e.target.closest('.matrix-task-item');
    if (!item) return;
    const taskId = item.dataset.id;

    if (e.target.closest('[data-action="toggle-complete"]') || e.target.type === 'checkbox') {
      toggleTaskComplete(taskId, e);
      return;
    }

    if (e.target.closest('[data-action="edit-task"]')) {
      openTaskModal(taskId);
      return;
    }
  });

  // Close modals on clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === dom.taskModal) closeTaskModal();
    if (e.target === dom.shortcutsModal) dom.shortcutsModal.classList.add('hidden');
    if (e.target === dom.backupModal) dom.backupModal.classList.add('hidden');
    if (e.target === dom.pomodoroModal) dom.pomodoroModal.classList.add('hidden');
    if (e.target === dom.analyticsModal) dom.analyticsModal.classList.add('hidden');
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
      closeTaskModal();
      dom.shortcutsModal.classList.add('hidden');
      dom.backupModal.classList.add('hidden');
      dom.pomodoroModal.classList.add('hidden');
      dom.analyticsModal.classList.add('hidden');
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
      // 'N' -> New Task Modal
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openTaskModal();
        return;
      }
      // 'L' -> List View
      if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        switchViewMode('list');
        return;
      }
      // 'B' -> Kanban Board View
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        switchViewMode('kanban');
        return;
      }
      // 'M' -> Eisenhower Matrix View
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        switchViewMode('matrix');
        return;
      }
      // 'P' -> Pomodoro Focus Timer
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        populatePomodoroTaskDropdown();
        dom.pomodoroModal.classList.remove('hidden');
        return;
      }
      // 'A' -> Analytics Insights
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openAnalyticsModal();
        return;
      }
      // 'S' -> Toggle Sound
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        dom.soundToggleBtn.click();
        return;
      }
      // '?' -> Shortcuts
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
