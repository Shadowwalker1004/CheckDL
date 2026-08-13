import { useMemo, useState } from "react";
import { questions, topics } from "../lib/data";
import OptionList from "../components/OptionList";

export default function OnTap() {
  const [topic, setTopic] = useState<string>("Tất cả");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((item) => {
      const topicOk = topic === "Tất cả" || item.topic === topic;
      const queryOk = q === "" || item.stem.toLowerCase().includes(q);
      return topicOk && queryOk;
    });
  }, [topic, query]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Ôn tập</h1>
        <p className="text-ink-soft text-sm mt-1">
          {filtered.length} / {questions.length} câu — đáp án đúng được tô sẵn.
        </p>
      </div>

      <input
        type="search"
        placeholder="Tìm theo nội dung câu hỏi…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-pine"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["Tất cả", ...topics].map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              topic === t
                ? "bg-pine text-white"
                : "bg-pine-soft text-pine hover:bg-pine/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((q) => (
          <div key={q.id} className="rounded-xl border border-line bg-card p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-3">
              <span className="font-mono text-xs text-ink-faint shrink-0 mt-0.5">
                Câu {q.num}
              </span>
              <p className="text-sm font-medium text-ink">{q.stem}</p>
            </div>
            <OptionList options={q.options} correctAnswer={q.answer} revealAlways />
            <div className="mt-3">
              <span className="inline-block font-mono text-[11px] uppercase tracking-wide text-pine bg-pine-soft rounded-full px-2 py-0.5">
                {q.topic}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-ink-faint text-sm py-10">
            Không tìm thấy câu hỏi phù hợp.
          </p>
        )}
      </div>
    </div>
  );
}
