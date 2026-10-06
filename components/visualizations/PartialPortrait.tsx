"use client";
import { motion, useReducedMotion } from "framer-motion";
import { DIMENSION_LABELS } from "@/config/questions";
import type { DimensionKey, DimensionScores } from "@/types";

const ORDER: DimensionKey[] = ["connection", "conversation", "partnership", "affection", "respect_future"];
const QUAL = ["pouco acessível", "em tensão", "presente, com oscilações", "preservado"];

/** Barras qualitativas, sem números. */
export default function PartialPortrait({ dims, className = "" }: { dims: DimensionScores; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <ul className={`flex flex-col gap-5 ${className}`} aria-label="Retrato parcial dos cinco eixos">
      {ORDER.map((k, i) => {
        const v = dims[k];
        const band = v === null ? null : v <= 24 ? 0 : v <= 49 ? 1 : v <= 74 ? 2 : 3;
        const width = v === null ? 0 : Math.max(8, v);
        return (
          <li key={k} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4 text-[15px]">
              <span className="font-medium text-ink">{DIMENSION_LABELS[k]}</span>
              <span className="text-[13px] text-muted">{band === null ? "sem dados suficientes" : QUAL[band]}</span>
            </div>
            <div className="h-[6px] w-full overflow-hidden rounded-full bg-surface-strong">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--wine-soft), var(--wine))" }}
                initial={reduce ? { width: `${width}%` } : { width: 0 }} animate={{ width: `${width}%` }} transition={{ delay: 0.2 + i * 0.15, duration: 0.9, ease: "easeOut" }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
