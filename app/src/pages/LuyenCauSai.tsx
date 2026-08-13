import { useState } from "react";
import { priorityQuestions, topics } from "../lib/data";
import { getProgress, recordAnswer } from "../lib/storage";
import OptionList from "../components/OptionList";
import type { Question, OptionLetter } from "../types";

type Phase = "setup" | "quiz" | "summary";

interface Answered {
  question: Question;
  picked: OptionLetter;
  correct: boolean;
}

const COUNTS = [10, 20, 40];

export default function LuyenCauSai() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [topic, setTopic] = useState("Tất cả");
  const [count, setCount] = useState(20);

  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<OptionLetter | null>(null);
  const [answers, setAnswers] = useState<Answered[]>([]);

  function start() {
    const progress = getProgress();
    const list = priorityQuestions(count, progress, topic === "Tất cả" ? undefined : topic);
    setQueue(list);
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setPhase("quiz");
  }

  function pick(letter: OptionLetter) {
    const question = queue[index];
    const correct = letter === question.answer;
    setPicked(letter);
    recordAnswer(question.id, correct);
    setAnswers((prev) => [...prev, { question, picked: letter, correct }]);
  }

  function next() {
    if (index + 1 >= queue.length) {
      setPhase("summary");
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  }

  if (phase === "setup") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Luyện câu sai</h1>
          <p className="text-ink-soft text-sm mt-1">
            Ưu tiên đưa lại câu bạn hay chọn sai, xen kẽ câu chưa từng làm.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-card p-4 shadow-sm flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink-faint">
              Chủ đề
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:outline-none focus:border-pine"
            >
              {["Tất cả", ...topics].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-ink-faint">
              Số câu
            </label>
            <div className="mt-1 flex gap-2">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-mono transition-colors ${
                    count === c
                      ? "border-pine bg-pine text-white"
                      : "border-line text-ink-soft hover:border-pine"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={start}
            className="mt-2 rounded-lg bg-pine text-white font-medium py-2.5 hover:opacity-90 transition-opacity"
          >
            Bắt đầu luyện tập
          </button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const question = queue[index];
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-ink-faint">
            Câu {index + 1}/{queue.length}
          </span>
          <span className="font-mono text-pine">{question.topic}</span>
        </div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden">
          <div
            className="h-full bg-pine transition-all"
            style={{ width: `${((index + (picked ? 1 : 0)) / queue.length) * 100}%` }}
          />
        </div>

        <div className="rounded-xl border border-line bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-ink mb-3">{question.stem}</p>
          <OptionList
            options={question.options}
            correctAnswer={question.answer}
            picked={picked}
            onPick={pick}
          />
        </div>

        {picked && (
          <button
            onClick={next}
            className="rounded-lg bg-pine text-white font-medium py-2.5 hover:opacity-90 transition-opacity"
          >
            {index + 1 >= queue.length ? "Xem kết quả" : "Câu tiếp theo"}
          </button>
        )}
      </div>
    );
  }

  const correctCount = answers.filter((a) => a.correct).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Kết quả luyện tập</h1>
        <p className="text-ink-soft text-sm mt-1">
          Đúng {correctCount}/{answers.length} câu (
          {Math.round((correctCount / answers.length) * 100)}%)
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {answers.map((a, i) => (
          <div key={i} className="rounded-xl border border-line bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-ink mb-3">{a.question.stem}</p>
            <OptionList
              options={a.question.options}
              correctAnswer={a.question.answer}
              picked={a.picked}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => setPhase("setup")}
        className="rounded-lg border border-pine text-pine font-medium py-2.5 hover:bg-pine-soft transition-colors"
      >
        Luyện lượt khác
      </button>
    </div>
  );
}
