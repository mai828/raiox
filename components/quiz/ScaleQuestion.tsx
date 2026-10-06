"use client";
import type { QuestionConfig } from "@/types";

export default function ScaleQuestion({ question, value, onChange, onConfirm }: { question: QuestionConfig; value: number | undefined; onChange: (v: number) => void; onConfirm: () => void }) {
  const s = question.scale!;
  const nums = Array.from({ length: s.max - s.min + 1 }, (_, i) => s.min + i);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11" role="radiogroup" aria-label={question.text}>
        {nums.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} data-option={n} onClick={() => onChange(n)}
            className={`min-h-[48px] rounded-xl border text-[16px] font-semibold tabular-nums transition-colors ${value === n ? "border-wine bg-wine text-surface" : "border-line bg-surface text-ink hover:border-wine-soft"}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-4 text-[13px] text-muted"><span>{s.minLabel}</span><span className="text-right">{s.maxLabel}</span></div>
      <div className="flex justify-end">
        <button type="button" className="btn-primary" disabled={value === undefined} onClick={onConfirm} data-testid="confirm">Continuar</button>
      </div>
    </div>
  );
}
