"use client";
import { motion, useReducedMotion } from "framer-motion";
import { DIMENSION_LABELS } from "@/config/questions";
import type { DimensionKey, DimensionScores } from "@/types";

const ORDER: DimensionKey[] = ["connection", "conversation", "partnership", "affection", "respect_future"];

export default function DimensionBars({ dims, highlight = [], className = "" }: { dims: DimensionScores; highlight?: DimensionKey[]; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <ul className={`flex flex-col gap-4 ${className}`}>
      {ORDER.map((k, i) => {
        const v = dims[k];
        const hl = highlight.includes(k);
        return (
          <li key={k} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className={`text-[15px] ${hl ? "font-semibold text-wine" : "font-medium text-ink"}`}>{DIMENSION_LABELS[k]}</span>
              <span className="font-sans text-[15px] tabular-nums text-ink-soft">{v === null ? "—" : v}</span>
            </div>
            <div className="h-[6px] w-full overflow-hidden rounded-full bg-surface-strong" aria-hidden>
              <motion.div className="h-full rounded-full" style={{ background: hl ? "var(--wine)" : "var(--wine-soft)" }}
                initial={reduce ? { width: `${v ?? 0}%` } : { width: 0 }} animate={{ width: `${v ?? 0}%` }} transition={{ delay: 0.1 + i * 0.1, duration: 0.8, ease: "easeOut" }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
