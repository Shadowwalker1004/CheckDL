import { Link, useParams } from "react-router-dom";
import { getAttempt } from "../lib/storage";
import { scoreAttempt } from "../lib/attempt";
import OptionList from "../components/OptionList";

export default function KetQua() {
  const { id } = useParams<{ id: string }>();
  const attempt = id ? getAttempt(id) : undefined;

  if (!attempt) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft">Không tìm thấy bài làm này.</p>
        <Link to="/thi-thu" className="text-pine underline mt-2 inline-block">
          Quay lại thi thử
        </Link>
      </div>
    );
  }

  const { correct, total, ungraded, passed } = scoreAttempt(attempt);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passMark = Math.floor(total / 2);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Kết quả</h1>
        <p className="text-ink-soft text-sm mt-1">{attempt.title}</p>
      </div>

      <div
        className={`rounded-xl border p-5 shadow-sm flex items-center gap-6 ${
          passed ? "border-good bg-good-bg" : "border-danger bg-danger-bg"
        }`}
      >
        <div
          className={`font-serif text-3xl font-bold shrink-0 ${
            passed ? "text-good" : "text-danger"
          }`}
        >
          {total > 0 ? (passed ? "ĐỖ" : "TRƯỢT") : "—"}
        </div>
        <div className="w-px self-stretch bg-current opacity-20" />
        <div>
          <div className={`font-mono text-2xl font-semibold tabular-nums ${passed ? "text-good" : "text-danger"}`}>
            {correct}/{total}
            <span className="text-base font-normal ml-2">({pct}%)</span>
          </div>
          <div className={`text-xs mt-0.5 ${passed ? "text-good" : "text-danger"}`}>
            Cần đúng trên {passMark} câu để đỗ
          </div>
          {ungraded > 0 && (
            <div className="text-xs text-warn mt-1">
              {ungraded} câu chưa xác định đáp án — không tính vào điểm
            </div>
          )}
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
              <p className="text-xs text-warn bg-warn-bg rounded-lg px-3 py-2 mb-2">
                Chưa xác định được đáp án đúng từ tài liệu gốc.
              </p>
            ) : null}
            <OptionList
              options={q.options}
              correctAnswer={q.correctAnswer}
              picked={q.picked}
              revealAlways
            />
          </div>
        ))}
      </div>

      <Link
        to="/thi-thu"
        className="rounded-lg border border-pine text-pine font-medium py-2.5 text-center hover:bg-pine-soft transition-colors"
      >
        Làm đề khác
      </Link>
    </div>
  );
}
