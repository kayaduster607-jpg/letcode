import { problems } from '@/data/problems';
import type { UserProgress, WrongBookEntry } from '@/types';

export const VALID_PROBLEM_IDS = new Set(problems.map((problem) => problem.id));

export const defaultProgress: UserProgress = {
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

export function isValidProblemId(value: unknown): value is number {
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

function normalizePostSolveChecks(values: unknown): Record<number, Record<number, boolean>> {
  if (!values || typeof values !== 'object') return {};
  const normalized: Record<number, Record<number, boolean>> = {};

  for (const [problemKey, rawChecks] of Object.entries(values)) {
    const problemId = Number(problemKey);
    if (!isValidProblemId(problemId) || !rawChecks || typeof rawChecks !== 'object') continue;

    const checks: Record<number, boolean> = {};
    for (const [indexKey, checked] of Object.entries(rawChecks)) {
      const index = Number(indexKey);
      if (!Number.isInteger(index) || index < 0 || index > 20) continue;
      if (typeof checked === 'boolean') checks[index] = checked;
    }

    if (Object.keys(checks).length > 0) {
      normalized[problemId] = checks;
    }
  }

  return normalized;
}

export function normalizeProgress(raw: Partial<UserProgress> | null | undefined): UserProgress {
  const merged = { ...defaultProgress, ...(raw || {}) };
  const completedProblemIds = normalizeIdList(merged.completedProblemIds);
  const wrongBook = normalizeWrongBook(merged.wrongBook);
  const wrongProblemIds = Array.from(
    new Set([
      ...normalizeIdList(merged.wrongProblemIds),
      ...wrongBook.filter((entry) => !entry.mastered).map((entry) => entry.problemId),
    ])
  );
  const lastStudiedProblemId = isValidProblemId(merged.lastStudiedProblemId) ? merged.lastStudiedProblemId : null;

  return {
    completedProblemIds,
    wrongProblemIds,
    wrongBook,
    unlockedHints: normalizeNumberRecord(merged.unlockedHints),
    notes: normalizeNotes(merged.notes),
    postSolveChecks: normalizePostSolveChecks(merged.postSolveChecks),
    lastStudiedProblemId,
    studyDays: Math.max(0, Number.isFinite(merged.studyDays) ? Math.floor(merged.studyDays || 0) : 0),
    lastStudyDate: typeof merged.lastStudyDate === 'string' ? merged.lastStudyDate : null,
  };
}

export function cloneProgress(progress: UserProgress | null | undefined): UserProgress {
  return normalizeProgress(progress ? JSON.parse(JSON.stringify(progress)) : defaultProgress);
}

export function touchStudyDay(progress: UserProgress, problemId: number): UserProgress {
  if (!isValidProblemId(problemId)) return progress;
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastStudyDate !== today) {
    progress.studyDays += 1;
    progress.lastStudyDate = today;
  }
  progress.lastStudiedProblemId = problemId;
  return progress;
}
