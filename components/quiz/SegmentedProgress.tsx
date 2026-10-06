"use client";
import { SEGMENTS } from "@/config/questions";

/** Barra com 6 segmentos. Sugere progresso sem contar perguntas. */
export default function SegmentedProgress({ segment, fraction }: { segment: number; fraction: number }) {
  return (
    <div className="flex w-full gap-1.5" role="progressbar" aria-label={`Progresso: ${SEGMENTS[segment]?.label ?? ""}`} aria-valuemin={0} aria-valuemax={6} aria-valuenow={Math.round(segment + fraction)}>
      {SEGMENTS.map((s, i) => {
        const fill = i < segment ? 1 : i === segment ? fraction : 0;
        return (
          <div key={s.key} className="h-[3px] flex-1 overflow-hidden rounded-full bg-surface-strong">
            <div className="h-full rounded-full bg-wine transition-[width] duration-500 ease-out" style={{ width: `${Math.round(fill * 100)}%` }} />
          </div>
        );
      })}
    </div>
  );
}
