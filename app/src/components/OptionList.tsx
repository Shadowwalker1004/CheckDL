import type { Option, OptionLetter } from "../types";

interface OptionListProps {
  options: Option[];
  correctAnswer: OptionLetter | null;
  picked?: OptionLetter | null;
  onPick?: (letter: OptionLetter) => void;
  /** Ôn tập mode: always highlight the correct answer, never clickable. */
  revealAlways?: boolean;
  /**
   * Exam mode: selecting an option just marks it selected, without revealing
   * correct/wrong, and stays clickable so the learner can change their pick
   * before submitting.
   */
  showResult?: boolean;
}

export default function OptionList({
  options,
  correctAnswer,
  picked = null,
  onPick,
  revealAlways = false,
  showResult = true,
}: OptionListProps) {
  const reveal = revealAlways || (showResult && picked !== null);
  const locked = revealAlways || (showResult && picked !== null);

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const isCorrect = correctAnswer === opt.letter;
        const isPicked = picked === opt.letter;
        const showCorrect = reveal && isCorrect;
        const showWrong = reveal && isPicked && !isCorrect;
        const justSelected = !reveal && isPicked;

        let cls =
          "text-left rounded-lg border px-3 py-2 text-sm flex gap-3 transition-colors ";
        if (showCorrect) {
          cls += "border-good bg-good-bg text-good";
        } else if (showWrong) {
          cls += "border-danger bg-danger-bg text-danger";
        } else if (justSelected) {
          cls += "border-pine bg-pine-soft text-ink";
        } else if (reveal) {
          cls += "border-line text-ink-faint";
        } else {
          cls += "border-line text-ink hover:border-pine hover:bg-pine-soft cursor-pointer";
        }

        return (
          <button
            key={opt.letter}
            type="button"
            disabled={locked}
            onClick={() => onPick?.(opt.letter)}
            className={cls}
          >
            <span className="font-mono font-semibold shrink-0">{opt.letter}.</span>
            <span>{opt.text}</span>
            {showCorrect && <span className="ml-auto shrink-0">✓</span>}
            {showWrong && <span className="ml-auto shrink-0">✕</span>}
          </button>
        );
      })}
    </div>
  );
}
