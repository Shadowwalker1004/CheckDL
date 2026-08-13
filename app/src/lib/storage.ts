import type { Attempt, QuestionStat } from "../types";

const KEYS = {
  progress: "dieulenh:progress:v1",
  attempts: "dieulenh:attempts:v1",
  currentAttempt: "dieulenh:currentAttempt:v1",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private mode, quota) — fail silently, app still works in-memory for the session
  }
}

// ---- per-question progress ----

export type ProgressMap = Record<string, QuestionStat>;

export function getProgress(): ProgressMap {
  return read<ProgressMap>(KEYS.progress, {});
}

export function recordAnswer(questionId: string, correct: boolean) {
  const progress = getProgress();
  const prev = progress[questionId] ?? {
    seen: 0,
    correct: 0,
    wrong: 0,
    lastResult: null,
    lastAt: 0,
  };
  progress[questionId] = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    lastResult: correct ? "correct" : "wrong",
    lastAt: Date.now(),
  };
  write(KEYS.progress, progress);
}

export function resetProgress() {
  write(KEYS.progress, {});
}

// ---- exam attempt history ----

export function getAttempts(): Attempt[] {
  return read<Attempt[]>(KEYS.attempts, []);
}

export function saveAttempt(attempt: Attempt) {
  const attempts = getAttempts();
  const idx = attempts.findIndex((a) => a.id === attempt.id);
  if (idx >= 0) attempts[idx] = attempt;
  else attempts.unshift(attempt);
  write(KEYS.attempts, attempts.slice(0, 100));
}

export function getAttempt(id: string): Attempt | undefined {
  return getAttempts().find((a) => a.id === id);
}

// ---- in-progress attempt (survives page refresh) ----

export function getCurrentAttempt(): Attempt | null {
  return read<Attempt | null>(KEYS.currentAttempt, null);
}

export function setCurrentAttempt(attempt: Attempt | null) {
  write(KEYS.currentAttempt, attempt);
}
