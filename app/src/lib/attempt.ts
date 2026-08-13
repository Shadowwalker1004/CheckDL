import type { Attempt, AttemptQuestion, Exam, Question } from "../types";

const SECONDS_PER_QUESTION = 60;

/**
 * Pass mark: correct on more than half of the graded questions — e.g. on a
 * 20-question đề this means > 10 câu đúng (≥ 11/20), matching the threshold
 * requested for this app since the source material has no official cutoff.
 */
const PASS_RATIO = 0.5;

function newId(): string {
  return crypto.randomUUID();
}

export function buildAttemptFromExam(exam: Exam): Attempt {
  const questions: AttemptQuestion[] = exam.questions.map((q, i) => ({
    key: `${exam.examId}-${i}`,
    stem: q.stem,
    options: q.options,
    correctAnswer: q.answer,
    masterId: q.masterId,
    picked: null,
  }));
  return {
    id: newId(),
    title: exam.title,
    source: "exam",
    startedAt: Date.now(),
    durationSec: questions.length * SECONDS_PER_QUESTION,
    submittedAt: null,
    questions,
  };
}

export function buildAttemptFromRandom(pool: Question[], title: string): Attempt {
  const questions: AttemptQuestion[] = pool.map((q, i) => ({
    key: `random-${q.id}-${i}`,
    stem: q.stem,
    options: q.options,
    correctAnswer: q.answer,
    masterId: q.id,
    picked: null,
  }));
  return {
    id: newId(),
    title,
    source: "random",
    startedAt: Date.now(),
    durationSec: questions.length * SECONDS_PER_QUESTION,
    submittedAt: null,
    questions,
  };
}

export function gradableQuestions(attempt: Attempt): AttemptQuestion[] {
  return attempt.questions.filter((q) => q.correctAnswer !== null);
}

export function scoreAttempt(attempt: Attempt) {
  const gradable = gradableQuestions(attempt);
  const correct = gradable.filter((q) => q.picked === q.correctAnswer).length;
  const total = gradable.length;
  const passed = total > 0 ? correct > total * PASS_RATIO : false;
  return { correct, total, ungraded: attempt.questions.length - total, passed };
}
