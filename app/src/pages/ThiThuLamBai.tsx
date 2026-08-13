import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Attempt, OptionLetter } from "../types";
import { getCurrentAttempt, setCurrentAttempt, saveAttempt, recordAnswer } from "../lib/storage";
import { gradableQuestions } from "../lib/attempt";
import OptionList from "../components/OptionList";

function remainingSeconds(attempt: Attempt): number {
  const elapsed = (Date.now() - attempt.startedAt) / 1000;
  return Math.max(0, Math.round(attempt.durationSec - elapsed));
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ThiThuLamBai() {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Attempt | null>(() => getCurrentAttempt());
  const [remaining, setRemaining] = useState(() => (attempt ? remainingSeconds(attempt) : 0));
  const attemptRef = useRef(attempt);
  const submittedRef = useRef(false);

  useEffect(() => {
    attemptRef.current = attempt;
    if (attempt && !submittedRef.current) {
      setCurrentAttempt(attempt);
    }
  }, [attempt]);

  useEffect(() => {
    if (!attempt) {
      navigate("/thi-thu", { replace: true });
    }
  }, [attempt, navigate]);

  useEffect(() => {
    if (!attempt) return;
    const id = setInterval(() => {
      setRemaining(remainingSeconds(attempt));
    }, 1000);
    return () => clearInterval(id);
  }, [attempt]);

  useEffect(() => {
    if (attempt && remaining <= 0 && !submittedRef.current) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  if (!attempt) return null;

  function pick(key: string, letter: OptionLetter) {
    setAttempt((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) => (q.key === key ? { ...q, picked: letter } : q)),
          }
        : prev,
    );
  }

  function submit() {
    const base = attemptRef.current;
    if (!base || submittedRef.current) return;
    submittedRef.current = true;
    const finished: Attempt = { ...base, submittedAt: Date.now() };
    for (const q of gradableQuestions(finished)) {
      recordAnswer(q.masterId as string, q.picked === q.correctAnswer);
    }
    saveAttempt(finished);
    setCurrentAttempt(null);
    navigate(`/thi-thu/ket-qua/${finished.id}`, { replace: true });
  }

  const answeredCount = attempt.questions.filter((q) => q.picked !== null).length;
  const low = remaining <= 60;

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[103px] sm:top-[55px] z-10 -mx-4 px-4 py-2 bg-paper/95 backdrop-blur border-b border-line flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-ink">{attempt.title}</span>
          <span className="text-ink-faint font-mono ml-2">
            {answeredCount}/{attempt.questions.length} câu
          </span>
        </div>
        <div
          className={`font-mono text-sm font-semibold tabular-nums rounded-full px-3 py-1 ${
            low ? "bg-danger-bg text-danger" : "bg-pine-soft text-pine"
          }`}
        >
          {formatTime(remaining)}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {attempt.questions.map((q, i) => (
          <div key={q.key} className="rounded-xl border border-line bg-card p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-3">
              <span className="font-mono text-xs text-ink-faint shrink-0 mt-0.5">
                Câu {i + 1}
              </span>
              <p className="text-sm font-medium text-ink">{q.stem}</p>
            </div>
            {q.correctAnswer === null ? (
              <p className="text-xs text-warn bg-warn-bg rounded-lg px-3 py-2">
                Câu này chưa xác định được đáp án từ tài liệu gốc — sẽ không tính điểm, bạn có
                thể tự đối chiếu văn bản chính thức.
              </p>
            ) : null}
            <OptionList
              options={q.options}
              correctAnswer={q.correctAnswer}
              picked={q.picked}
              onPick={(letter) => pick(q.key, letter)}
              showResult={false}
            />
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        className="sticky bottom-4 rounded-lg bg-pine text-white font-medium py-3 shadow-lg hover:opacity-90 transition-opacity"
      >
        Nộp bài
      </button>
    </div>
  );
}
