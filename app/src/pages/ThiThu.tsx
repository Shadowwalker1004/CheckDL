import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { exams, randomQuestions } from "../lib/data";
import { buildAttemptFromExam, buildAttemptFromRandom } from "../lib/attempt";
import { setCurrentAttempt } from "../lib/storage";

const bo1 = exams.filter((e) => e.examId.startsWith("bo1-"));
const bo2 = exams.filter((e) => e.examId.startsWith("bo2-"));

export default function ThiThu() {
  const navigate = useNavigate();
  const [randomCount, setRandomCount] = useState(20);

  function startExam(examId: string) {
    const exam = exams.find((e) => e.examId === examId);
    if (!exam) return;
    const attempt = buildAttemptFromExam(exam);
    setCurrentAttempt(attempt);
    navigate("/thi-thu/lam-bai");
  }

  function startRandom() {
    const pool = randomQuestions(randomCount);
    const attempt = buildAttemptFromRandom(pool, `Đề ngẫu nhiên ${randomCount} câu`);
    setCurrentAttempt(attempt);
    navigate("/thi-thu/lam-bai");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Thi thử</h1>
        <p className="text-ink-soft text-sm mt-1">
          Mỗi câu tính 1 phút làm bài. Nộp bài để xem điểm và đáp án đúng ngay lập tức.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-card p-4 shadow-sm flex flex-col gap-3">
        <h2 className="font-semibold text-ink text-sm">Đề ngẫu nhiên</h2>
        <div className="flex gap-2">
          {[10, 20, 40].map((c) => (
            <button
              key={c}
              onClick={() => setRandomCount(c)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-mono transition-colors ${
                randomCount === c
                  ? "border-pine bg-pine text-white"
                  : "border-line text-ink-soft hover:border-pine"
              }`}
            >
              {c} câu
            </button>
          ))}
        </div>
        <button
          onClick={startRandom}
          className="rounded-lg bg-accent text-white font-medium py-2.5 hover:opacity-90 transition-opacity"
        >
          Bắt đầu đề ngẫu nhiên
        </button>
      </div>

      <ExamGroup title="Bộ đề số 1" exams={bo1} onStart={startExam} />
      <ExamGroup title="Bộ đề số 2" exams={bo2} onStart={startExam} />
    </div>
  );
}

function ExamGroup({
  title,
  exams: list,
  onStart,
}: {
  title: string;
  exams: typeof exams;
  onStart: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-semibold text-ink text-sm mb-3">{title}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {list.map((exam) => {
          const flagged = exam.questions.some((q) => q.answer === null);
          const label = exam.title.split("Đề ").pop();
          return (
            <button
              key={exam.examId}
              onClick={() => onStart(exam.examId)}
              title={flagged ? "Có câu chưa xác định đáp án, sẽ không chấm điểm câu đó" : undefined}
              className="relative rounded-lg border border-line bg-card py-2.5 text-sm font-mono text-ink hover:border-pine hover:bg-pine-soft transition-colors"
            >
              {label}
              {flagged && (
                <span className="absolute -top-1 -right-1 text-warn text-xs">⚠</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
