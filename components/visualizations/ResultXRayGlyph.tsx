"use client";
import { motion, useReducedMotion } from "framer-motion";
import { DIMENSION_LABELS } from "@/config/questions";
import type { DimensionKey, DimensionScores } from "@/types";

const ORDER: DimensionKey[] = ["connection", "conversation", "partnership", "affection", "respect_future"];
const SHORT: Record<DimensionKey, string> = { connection: "Conexão", conversation: "Conversa", partnership: "Parceria", affection: "Afeto", respect_future: "Futuro" };

/** Glifo: um núcleo (o vínculo) com cinco raios cujo alcance e opacidade seguem o score. */
export default function ResultXRayGlyph({ dims, className = "" }: { dims: DimensionScores; className?: string }) {
  const reduce = useReducedMotion();
  const cx = 200, cy = 200, rMin = 46, rMax = 150;
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label={`Mapa visual da relação. ${ORDER.map((k) => `${DIMENSION_LABELS[k]}: ${dims[k] ?? "sem dados"}`).join("; ")}`}>
      {[0.33, 0.66, 1].map((f) => <circle key={f} cx={cx} cy={cy} r={rMin + (rMax - rMin) * f} fill="none" stroke="var(--line)" strokeWidth={0.8} strokeDasharray={f === 1 ? "0" : "2 6"} />)}
      <circle cx={cx} cy={cy} r={rMin} fill="var(--surface)" stroke="var(--wine)" strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={6} fill="var(--wine)" />
      {ORDER.map((k, i) => {
        const v = dims[k];
        const a = -Math.PI / 2 + (i / ORDER.length) * Math.PI * 2;
        const len = v === null ? rMin + 6 : rMin + ((rMax - rMin) * v) / 100;
        const x2 = cx + len * Math.cos(a), y2 = cy + len * Math.sin(a);
        const lx = cx + (rMax + 26) * Math.cos(a), ly = cy + (rMax + 26) * Math.sin(a);
        const op = v === null ? 0.25 : 0.35 + 0.65 * (v / 100);
        return (
          <g key={k}>
            <motion.line x1={cx + rMin * Math.cos(a)} y1={cy + rMin * Math.sin(a)} x2={x2} y2={y2} stroke="var(--wine)" strokeWidth={v === null ? 1 : 2.5} strokeLinecap="round" opacity={op}
              initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }} />
            <motion.circle cx={x2} cy={y2} r={v === null ? 2.5 : 4.5} fill={v === null ? "var(--line)" : "var(--wine)"} opacity={op}
              initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.15 }} style={{ transformOrigin: `${x2}px ${y2}px` }} />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize={12} fill="var(--ink-soft)" fontFamily="var(--font-sans)" fontWeight={600} letterSpacing="0.04em">{SHORT[k].toUpperCase()}</text>
            {v !== null && <text x={lx} y={ly + 20} textAnchor="middle" fontSize={13} fill="var(--muted)" fontFamily="var(--font-sans)">{v}</text>}
          </g>
        );
      })}
      <circle cx={cx + 24} cy={cy - 30} r={1.5} fill="var(--gold-muted)" />
      <circle cx={cx - 34} cy={cy + 18} r={1.5} fill="var(--gold-muted)" />
    </svg>
  );
}
