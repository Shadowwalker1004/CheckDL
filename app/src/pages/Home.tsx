import { Link } from "react-router-dom";
import { useMemo } from "react";
import { getProgress } from "../lib/storage";
import { questions } from "../lib/data";

export default function Home() {
  const stats = useMemo(() => {
    const progress = getProgress();
    const entries = Object.values(progress);
    const seen = entries.length;
    const correct = entries.reduce((s, e) => s + e.correct, 0);
    const wrong = entries.reduce((s, e) => s + e.wrong, 0);
    const attempts = correct + wrong;
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
    return { seen, accuracy, total: questions.length };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-pine mb-2">
          Ôn tập &amp; mô phỏng thi
        </p>
        <h1 className="font-serif text-3xl font-semibold text-ink text-balance">
          Điều lệnh nội vụ CAND
        </h1>
        <p className="text-ink-soft mt-2">
          190 câu hỏi lý thuyết và 40 đề thi thử, dựa trên bộ câu hỏi có đáp án chính thức.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-card px-5 py-4 flex items-center gap-6 shadow-sm">
        <div>
          <div className="font-mono text-2xl font-semibold text-ink tabular-nums">
            {stats.seen}/{stats.total}
          </div>
          <div className="text-xs text-ink-faint">câu đã luyện</div>
        </div>
        <div className="w-px self-stretch bg-line" />
        <div>
          <div className="font-mono text-2xl font-semibold text-ink tabular-nums">
            {stats.accuracy === null ? "—" : `${stats.accuracy}%`}
          </div>
          <div className="text-xs text-ink-faint">tỷ lệ trả lời đúng</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ModeCard
          to="/on-tap"
          icon="📖"
          title="Ôn tập"
          desc="Đọc toàn bộ 190 câu kèm đáp án đúng, lọc theo chủ đề."
        />
        <ModeCard
          to="/luyen-cau-sai"
          icon="🎯"
          title="Luyện câu sai"
          desc="Ưu tiên ôn lại câu bạn hay chọn sai, có phản hồi ngay khi làm."
        />
        <ModeCard
          to="/thi-thu"
          icon="⏱"
          title="Thi thử"
          desc="Làm 1 trong 40 đề có sẵn hoặc đề ngẫu nhiên, có tính giờ và chấm điểm."
        />
      </div>
    </div>
  );
}

function ModeCard({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-line bg-card p-5 shadow-sm hover:border-pine hover:shadow-md transition-all flex flex-col gap-2"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-ink">{title}</span>
      <span className="text-sm text-ink-soft">{desc}</span>
    </Link>
  );
}
