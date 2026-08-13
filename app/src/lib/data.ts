import questionsRaw from "../data/questions.json";
import examsRaw from "../data/exams.json";
import type { Exam, Question } from "../types";
import type { ProgressMap } from "./storage";

export const questions = questionsRaw as Question[];
export const exams = examsRaw as Exam[];

export const topics = Array.from(new Set(questions.map((q) => q.topic)));

export function questionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function examById(id: string): Exam | undefined {
  return exams.find((e) => e.examId === id);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random N questions from the full bank, with options in original order. */
export function randomQuestions(n: number, topic?: string): Question[] {
  const pool = topic ? questions.filter((q) => q.topic === topic) : questions;
  return shuffle(pool).slice(0, Math.min(n, pool.length));
}

/**
 * Pick N questions prioritising ones the learner has answered wrong most,
 * then ones never seen, then the rest — a simple spaced-repetition heuristic.
 */
export function priorityQuestions(n: number, progress: ProgressMap, topic?: string): Question[] {
  const pool = topic ? questions.filter((q) => q.topic === topic) : questions;
  const scored = pool.map((q) => {
    const stat = progress[q.id];
    if (!stat) return { q, score: 1000 }; // never seen — high priority, but below "seen and wrong"
    const wrongBias = stat.wrong * 10 - stat.correct;
    const recencyPenalty = stat.lastResult === "correct" ? -5 : 0;
    return { q, score: 2000 + wrongBias + recencyPenalty };
  });
  scored.sort((a, b) => b.score - a.score);
  // shuffle within same-score buckets a little so it's not perfectly deterministic
  const top = scored.slice(0, Math.max(n * 3, n));
  return shuffle(top).slice(0, n).map((s) => s.q);
}
