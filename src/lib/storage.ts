import { UserProgress, WrongBookEntry } from '@/types';
import { problems } from '@/data/problems';

const STORAGE_KEY = 'hot100_progress';
const VALID_PROBLEM_IDS = new Set(problems.map((problem) => problem.id));

const defaultProgress: UserProgress = {
  completedProblemIds: [],
  wrongProblemIds: [],
  wrongBook: [],
  unlockedHints: {},
  notes: {},
  postSolveChecks: {},
  lastStudiedProblemId: null,
  studyDays: 0,
  lastStudyDate: null,
};

function isValidProblemId(value: unknown): value is number {
  return Number.isInteger(value) && VALID_PROBLEM_IDS.has(value as number);
}

function normalizeIdList(values: unknown): number[] {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.filter(isValidProblemId)));
}

function normalizeNumberRecord(values: unknown): Record<number, number> {
  if (!values || typeof values !== 'object') return {};
  const normalized: Record<number, number> = {};
  for (const [key, value] of Object.entries(values)) {
    const problemId = Number(key);
    if (!isValidProblemId(problemId)) continue;
    const level = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(level)) continue;
    normalized[problemId] = Math.max(0, Math.min(6, Math.floor(level)));
  }
  return normalized;
}

function normalizeNotes(values: unknown): Record<number, string> {
  if (!values || typeof values !== 'object') return {};
  const normalized: Record<number, string> = {};
  for (const [key, value] of Object.entries(values)) {
    const problemId = Number(key);
    if (!isValidProblemId(problemId) || typeof value !== 'string') continue;
    if (value.trim()) normalized[problemId] = value;
  }
  return normalized;
}

function normalizeWrongBook(values: unknown): WrongBookEntry[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<number>();
  const entries: WrongBookEntry[] = [];

  for (const item of values) {
    if (!item || typeof item !== 'object') continue;
    const raw = item as Partial<WrongBookEntry>;
    if (!isValidProblemId(raw.problemId) || seen.has(raw.problemId)) continue;
    seen.add(raw.problemId);
    entries.push({
      problemId: raw.problemId,
      reason: typeof raw.reason === 'string' ? raw.reason : '',
      addedAt: typeof raw.addedAt === 'string' ? raw.addedAt : new Date().toISOString(),
      lastReviewAt: typeof raw.lastReviewAt === 'string' ? raw.lastReviewAt : null,
      mastered: Boolean(raw.mastered),
    });
  }

  return entries;
}

function normalizeProgress(raw: Partial<UserProgress> | null | undefined): UserProgress {
  const merged = { ...defaultProgress, ...(raw || {}) };
  const completedProblemIds = normalizeIdList(merged.completedProblemIds);
  const wrongBook = normalizeWrongBook(merged.wrongBook);
  const wrongProblemIds = Array.from(new Set([...normalizeIdList(merged.wrongProblemIds), ...wrongBook.map((entry) => entry.problemId)]));
  const lastStudiedProblemId = isValidProblemId(merged.lastStudiedProblemId) ? merged.lastStudiedProblemId : null;

  return {
    completedProblemIds,
    wrongProblemIds,
    wrongBook,
    unlockedHints: normalizeNumberRecord(merged.unlockedHints),
    notes: normalizeNotes(merged.notes),
    postSolveChecks: {},
    lastStudiedProblemId,
    studyDays: Math.max(0, Number.isFinite(merged.studyDays) ? Math.floor(merged.studyDays || 0) : 0),
    lastStudyDate: typeof merged.lastStudyDate === 'string' ? merged.lastStudyDate : null,
  };
}

function touchStudyDay(progress: UserProgress, problemId: number): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastStudyDate !== today) {
    progress.studyDays += 1;
    progress.lastStudyDate = today;
  }
  progress.lastStudiedProblemId = problemId;
  return progress;
}

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return normalizeProgress(defaultProgress);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeProgress(defaultProgress);
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return normalizeProgress(defaultProgress);
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
}

export function toggleComplete(problemId: number): UserProgress {
  const progress = getProgress();
  if (!isValidProblemId(problemId)) return progress;
  const completed = new Set(progress.completedProblemIds);
  if (completed.has(problemId)) {
    completed.delete(problemId);
  } else {
    completed.add(problemId);
    touchStudyDay(progress, problemId);
  }
  progress.completedProblemIds = Array.from(completed);
  saveProgress(progress);
  return progress;
}

export function isCompleted(problemId: number): boolean {
  return getProgress().completedProblemIds.includes(problemId);
}

export function toggleWrongBook(problemId: number, reason: string = ''): UserProgress {
  const progress = getProgress();
  if (!isValidProblemId(problemId)) return progress;
  const wrongIds = new Set(progress.wrongProblemIds);
  if (!wrongIds.has(problemId)) {
    wrongIds.add(problemId);
    const exists = progress.wrongBook.some((entry) => entry.problemId === problemId);
    if (!exists) {
      progress.wrongBook.push({
        problemId,
        reason,
        addedAt: new Date().toISOString(),
        lastReviewAt: null,
        mastered: false,
      });
    }
  } else {
    wrongIds.delete(problemId);
    progress.wrongBook = progress.wrongBook.filter((entry) => entry.problemId !== problemId);
  }
  progress.wrongProblemIds = Array.from(wrongIds);
  saveProgress(progress);
  return progress;
}

export function isInWrongBook(problemId: number): boolean {
  return getProgress().wrongProblemIds.includes(problemId);
}

export function markWrongBookMastered(problemId: number): UserProgress {
  const progress = getProgress();
  if (!isValidProblemId(problemId)) return progress;
  const entry = progress.wrongBook.find((item) => item.problemId === problemId);
  if (entry) {
    entry.mastered = !entry.mastered;
    entry.lastReviewAt = new Date().toISOString();
    saveProgress(progress);
  }
  return progress;
}

export function updateWrongBookReason(problemId: number, reason: string): UserProgress {
  const progress = getProgress();
  if (!isValidProblemId(problemId)) return progress;
  const entry = progress.wrongBook.find((item) => item.problemId === problemId);
  if (entry) {
    entry.reason = reason;
    saveProgress(progress);
  }
  return progress;
}

export function getUnlockedHintLevel(problemId: number): number {
  return isValidProblemId(problemId) ? getProgress().unlockedHints[problemId] || 0 : 0;
}

export function unlockHintLevel(problemId: number, level: number): UserProgress {
  const progress = getProgress();
  if (!isValidProblemId(problemId)) return progress;
  const current = progress.unlockedHints[problemId] || 0;
  if (level > current) {
    progress.unlockedHints[problemId] = Math.min(level, 6);
    touchStudyDay(progress, problemId);
    saveProgress(progress);
  }
  return progress;
}

export function getNote(problemId: number): string {
  return isValidProblemId(problemId) ? getProgress().notes[problemId] || '' : '';
}

export function saveNote(problemId: number, content: string): UserProgress {
  const progress = getProgress();
  if (!isValidProblemId(problemId)) return progress;
  if (content.trim()) {
    progress.notes[problemId] = content;
    touchStudyDay(progress, problemId);
  } else {
    delete progress.notes[problemId];
  }
  saveProgress(progress);
  return progress;
}

export function updateWrongBookEntry(problemId: number, patch: Partial<WrongBookEntry>): UserProgress {
  const progress = getProgress();
  if (!isValidProblemId(problemId)) return progress;
  const entry = progress.wrongBook.find((item) => item.problemId === problemId);
  if (entry) {
    Object.assign(entry, patch);
    saveProgress(progress);
  }
  return progress;
}
