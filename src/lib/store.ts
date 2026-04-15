import { format, differenceInCalendarDays, startOfWeek, endOfWeek, isToday, isYesterday, subDays, parseISO } from 'date-fns';

// Types
export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  hoursStudied: number;
  topicsCovered: string;
  phase: string;
  wastedHours: number;
  focusRating: number;
  energyRating: number;
  disciplineRating: number;
  score: number;
  createdAt: string;
}

export interface Phase {
  id: string;
  name: string;
  topics: { name: string; completed: boolean }[];
  status: 'not-started' | 'in-progress' | 'completed';
  order: number;
}

export interface WeeklyReflection {
  id: string;
  weekStart: string;
  whatWentWell: string;
  whatFailed: string;
  improvement: string;
  createdAt: string;
}

export interface DailyGoal {
  hoursTarget: number;
  topicsTarget: number;
}

// Default phases for AI Product Developer roadmap
const DEFAULT_PHASES: Phase[] = [
  {
    id: '1', name: 'Phase 1: Foundations', order: 1, status: 'not-started',
    topics: [
      { name: 'Python Mastery', completed: false },
      { name: 'Mathematics for ML', completed: false },
      { name: 'Statistics & Probability', completed: false },
      { name: 'Data Structures', completed: false },
      { name: 'Git & Version Control', completed: false },
    ]
  },
  {
    id: '2', name: 'Phase 2: Data & ML Basics', order: 2, status: 'not-started',
    topics: [
      { name: 'Pandas & NumPy', completed: false },
      { name: 'Data Visualization', completed: false },
      { name: 'Supervised Learning', completed: false },
      { name: 'Unsupervised Learning', completed: false },
      { name: 'Model Evaluation', completed: false },
    ]
  },
  {
    id: '3', name: 'Phase 3: Deep Learning', order: 3, status: 'not-started',
    topics: [
      { name: 'Neural Networks', completed: false },
      { name: 'CNNs & Computer Vision', completed: false },
      { name: 'RNNs & Sequences', completed: false },
      { name: 'Transfer Learning', completed: false },
      { name: 'PyTorch / TensorFlow', completed: false },
    ]
  },
  {
    id: '4', name: 'Phase 4: NLP & LLMs', order: 4, status: 'not-started',
    topics: [
      { name: 'Text Processing', completed: false },
      { name: 'Transformers', completed: false },
      { name: 'Fine-tuning LLMs', completed: false },
      { name: 'Prompt Engineering', completed: false },
      { name: 'RAG Systems', completed: false },
    ]
  },
  {
    id: '5', name: 'Phase 5: Product Building', order: 5, status: 'not-started',
    topics: [
      { name: 'API Development', completed: false },
      { name: 'Frontend Integration', completed: false },
      { name: 'Deployment & MLOps', completed: false },
      { name: 'User Research', completed: false },
      { name: 'Product Strategy', completed: false },
    ]
  },
  {
    id: '6', name: 'Phase 6: Portfolio & Launch', order: 6, status: 'not-started',
    topics: [
      { name: 'Capstone Project', completed: false },
      { name: 'Portfolio Website', completed: false },
      { name: 'Open Source Contributions', completed: false },
      { name: 'Technical Writing', completed: false },
      { name: 'Job Applications', completed: false },
    ]
  },
];

// Storage helpers
const KEYS = {
  logs: 'devstreak_logs',
  phases: 'devstreak_phases',
  reflections: 'devstreak_reflections',
  goals: 'devstreak_goals',
  startDate: 'devstreak_start_date',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Logs
export function getLogs(): DailyLog[] {
  return load<DailyLog[]>(KEYS.logs, []);
}

export function addLog(log: Omit<DailyLog, 'id' | 'score' | 'createdAt'>): DailyLog {
  const logs = getLogs();
  const score = calculateScore(log);
  const newLog: DailyLog = {
    ...log,
    id: crypto.randomUUID(),
    score,
    createdAt: new Date().toISOString(),
  };
  // Replace if same date exists
  const filtered = logs.filter(l => l.date !== log.date);
  filtered.push(newLog);
  filtered.sort((a, b) => a.date.localeCompare(b.date));
  save(KEYS.logs, filtered);
  return newLog;
}

export function calculateScore(log: Pick<DailyLog, 'hoursStudied' | 'wastedHours' | 'focusRating' | 'energyRating' | 'disciplineRating'>): number {
  const productiveRatio = log.hoursStudied > 0 ? log.hoursStudied / (log.hoursStudied + log.wastedHours) : 0;
  const selfScore = ((log.focusRating + log.energyRating + log.disciplineRating) / 15) * 100;
  const hoursScore = Math.min(log.hoursStudied / 6, 1) * 100; // 6 hours = max
  const wastedPenalty = Math.min(log.wastedHours / 4, 1) * 30; // up to 30 point penalty

  const raw = (productiveRatio * 30) + (selfScore * 0.3) + (hoursScore * 0.2) - wastedPenalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function getTodayLog(): DailyLog | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getLogs().find(l => l.date === today) || null;
}

// Streaks
export function getStreak(): { current: number; longest: number; isAtRisk: boolean } {
  const logs = getLogs();
  if (logs.length === 0) return { current: 0, longest: 0, isAtRisk: true };

  const dates = new Set(logs.map(l => l.date));
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  let current = 0;
  let checkDate = dates.has(today) ? new Date() : (dates.has(yesterday) ? subDays(new Date(), 1) : null);

  if (checkDate) {
    while (dates.has(format(checkDate, 'yyyy-MM-dd'))) {
      current++;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Calculate longest
  let longest = 0;
  let tempStreak = 0;
  const sortedDates = Array.from(dates).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { tempStreak = 1; }
    else {
      const diff = differenceInCalendarDays(parseISO(sortedDates[i]), parseISO(sortedDates[i - 1]));
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longest = Math.max(longest, tempStreak);
  }

  const isAtRisk = !dates.has(today);
  return { current, longest, isAtRisk };
}

// Weekly stats
export function getWeeklyAverage(): number {
  const logs = getLogs();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekLogs = logs.filter(l => {
    const d = parseISO(l.date);
    return d >= weekStart && d <= weekEnd;
  });
  if (weekLogs.length === 0) return 0;
  return Math.round(weekLogs.reduce((sum, l) => sum + l.score, 0) / weekLogs.length);
}

export function getScoreTrend(): 'improving' | 'declining' | 'stable' {
  const logs = getLogs().slice(-14);
  if (logs.length < 4) return 'stable';
  const half = Math.floor(logs.length / 2);
  const firstHalf = logs.slice(0, half).reduce((s, l) => s + l.score, 0) / half;
  const secondHalf = logs.slice(half).reduce((s, l) => s + l.score, 0) / (logs.length - half);
  if (secondHalf - firstHalf > 5) return 'improving';
  if (firstHalf - secondHalf > 5) return 'declining';
  return 'stable';
}

// Wasted time analysis
export function getWastedTimeInsights(): string[] {
  const logs = getLogs().slice(-14);
  if (logs.length < 3) return ["Log more days to unlock insights about your wasted time patterns."];
  
  const insights: string[] = [];
  const avgWasted = logs.reduce((s, l) => s + l.wastedHours, 0) / logs.length;
  const recent3 = logs.slice(-3);
  const recentAvg = recent3.reduce((s, l) => s + l.wastedHours, 0) / 3;

  if (recentAvg > avgWasted * 1.2) {
    insights.push("⚠️ Your wasted time is increasing recently. Time to tighten up.");
  } else if (recentAvg < avgWasted * 0.8) {
    insights.push("✅ Your wasted time is decreasing. Great discipline!");
  }

  insights.push(`📊 Average wasted: ${avgWasted.toFixed(1)}h/day over last ${logs.length} days.`);

  if (avgWasted > 2) {
    insights.push("🔴 You're averaging over 2 hours wasted daily. That's a full workday lost per week.");
  }

  return insights;
}

// Nudges
export function getNudges(): string[] {
  const nudges: string[] = [];
  const streak = getStreak();
  const todayLog = getTodayLog();
  const logs = getLogs();
  const trend = getScoreTrend();

  if (!todayLog) {
    nudges.push("📝 You haven't logged today. Don't break your streak!");
  }

  if (streak.isAtRisk && streak.current > 0) {
    nudges.push(`🔥 Your ${streak.current}-day streak is at risk! Log now.`);
  }

  if (trend === 'declining') {
    nudges.push("📉 Your consistency has dropped this week. Refocus.");
  } else if (trend === 'improving') {
    nudges.push("📈 You're on an upward trend. Keep the momentum!");
  }

  if (logs.length > 0) {
    const recent = logs.slice(-3);
    const avgHours = recent.reduce((s, l) => s + l.hoursStudied, 0) / recent.length;
    if (avgHours < 2) {
      nudges.push("⏰ Your recent study hours are low. Try to hit at least 3 hours today.");
    }
  }

  if (nudges.length === 0) {
    nudges.push("💪 You're doing great. Stay consistent and trust the process.");
  }

  return nudges;
}

// Phases
export function getPhases(): Phase[] {
  return load<Phase[]>(KEYS.phases, DEFAULT_PHASES);
}

export function updatePhases(phases: Phase[]): void {
  save(KEYS.phases, phases);
}

export function toggleTopic(phaseId: string, topicIndex: number): Phase[] {
  const phases = getPhases();
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return phases;
  
  phase.topics[topicIndex].completed = !phase.topics[topicIndex].completed;
  const completedCount = phase.topics.filter(t => t.completed).length;
  if (completedCount === phase.topics.length) phase.status = 'completed';
  else if (completedCount > 0) phase.status = 'in-progress';
  else phase.status = 'not-started';
  
  save(KEYS.phases, phases);
  return [...phases];
}

export function getPhaseProgress(phase: Phase): number {
  if (phase.topics.length === 0) return 0;
  return Math.round((phase.topics.filter(t => t.completed).length / phase.topics.length) * 100);
}

export function getOverallProgress(): number {
  const phases = getPhases();
  const total = phases.reduce((s, p) => s + p.topics.length, 0);
  const completed = phases.reduce((s, p) => s + p.topics.filter(t => t.completed).length, 0);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Reflections
export function getReflections(): WeeklyReflection[] {
  return load<WeeklyReflection[]>(KEYS.reflections, []);
}

export function addReflection(reflection: Omit<WeeklyReflection, 'id' | 'createdAt'>): WeeklyReflection {
  const reflections = getReflections();
  const newReflection: WeeklyReflection = {
    ...reflection,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  reflections.push(newReflection);
  save(KEYS.reflections, reflections);
  return newReflection;
}

// Goals
export function getGoals(): DailyGoal {
  return load<DailyGoal>(KEYS.goals, { hoursTarget: 4, topicsTarget: 1 });
}

export function setGoals(goals: DailyGoal): void {
  save(KEYS.goals, goals);
}

// Chart data
export function getChartData(days: number = 14) {
  const logs = getLogs();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const log = logs.find(l => l.date === date);
    result.push({
      date: format(subDays(new Date(), i), 'MMM dd'),
      studied: log?.hoursStudied || 0,
      wasted: log?.wastedHours || 0,
      score: log?.score || 0,
    });
  }
  return result;
}

// Roadmap alignment
export function getRoadmapAlignment() {
  const startDate = load<string | null>(KEYS.startDate, null);
  if (!startDate) return null;
  
  const daysSinceStart = differenceInCalendarDays(new Date(), parseISO(startDate));
  const expectedPhaseWeeks = [8, 8, 10, 8, 10, 8]; // weeks per phase
  const totalWeeks = expectedPhaseWeeks.reduce((s, w) => s + w, 0);
  const currentWeek = Math.floor(daysSinceStart / 7);
  
  let expectedPhase = 0;
  let weekSum = 0;
  for (let i = 0; i < expectedPhaseWeeks.length; i++) {
    weekSum += expectedPhaseWeeks[i];
    if (currentWeek < weekSum) { expectedPhase = i; break; }
    if (i === expectedPhaseWeeks.length - 1) expectedPhase = i;
  }

  const actualProgress = getOverallProgress();
  const expectedProgress = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));

  return {
    daysSinceStart,
    currentWeek,
    expectedPhase: expectedPhase + 1,
    expectedProgress,
    actualProgress,
    behindDays: Math.max(0, Math.round((expectedProgress - actualProgress) / 100 * totalWeeks * 7)),
  };
}

export function setStartDate(date: string) {
  save(KEYS.startDate, date);
}

export function getStartDate(): string | null {
  return load<string | null>(KEYS.startDate, null);
}
