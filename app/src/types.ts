export type OptionLetter = "A" | "B" | "C";

export interface Option {
  letter: OptionLetter;
  text: string;
}

export interface Question {
  id: string;
  num: number;
  stem: string;
  options: Option[];
  answer: OptionLetter;
  topic: string;
}

export interface ExamQuestion {
  masterId: string | null;
  stem: string;
  options: Option[];
  answer: OptionLetter | null;
  needsReview: boolean;
}

export interface Exam {
  examId: string;
  title: string;
  questions: ExamQuestion[];
}

/** A flattened question used inside an in-progress or completed attempt. */
export interface AttemptQuestion {
  key: string;
  stem: string;
  options: Option[];
  correctAnswer: OptionLetter | null;
  masterId: string | null;
  picked: OptionLetter | null;
}

export interface Attempt {
  id: string;
  title: string;
  source: "exam" | "random";
  startedAt: number;
  durationSec: number;
  submittedAt: number | null;
  questions: AttemptQuestion[];
}

export interface QuestionStat {
  seen: number;
  correct: number;
  wrong: number;
  lastResult: "correct" | "wrong" | null;
  lastAt: number;
}
