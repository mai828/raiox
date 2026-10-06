"use client";
import { motion, useReducedMotion } from "framer-motion";

export type ConflictMode = "demand_withdraw" | "escalation" | "avoidance" | "repair";

const MOTIONS: Record<ConflictMode, { a: number[]; b: number[]; shake?: boolean; label: string }> = {
  demand_withdraw: { a: [110, 150, 170, 110], b: [210, 236, 256, 210], label: "um avança, o outro recua" },
  escalation: { a: [120, 150, 150, 120], b: [200, 170, 170, 200], shake: true, label: "os dois se aproximam depressa e ficam tensos" },
  avoidance: { a: [140, 100, 100, 140], b: [180, 220, 220, 180], label: "os dois se afastam" },
  repair: { a: [140, 105, 140, 140], b: [180, 215, 180, 180], label: "afastam e voltam" },
};

export default function ConflictMotionViz({ mode, className = "" }: { mode: ConflictMode; className?: string }) {
  const reduce = useReducedMotion();
  const m = MOTIONS[mode];
  const t = { duration: 6, repeat: Infinity, ease: "easeInOut" as const, times: [0, 0.4, 0.7, 1] };
  return (
    <svg viewBox="0 0 320 120" className={className} role="img" aria-label={`Movimento de conflito: ${m.label}`}>
      <line x1={40} y1={60} x2={280} y2={60} stroke="var(--line)" strokeWidth={1} />
      <motion.circle cy={60} r={13} fill="var(--wine)" cx={m.a[0]} animate={reduce ? undefined : { cx: m.a, y: m.shake ? [0, -1.5, 1.5, 0] : 0 }} transition={reduce ? undefined : { ...t, y: { duration: 0.35, repeat: Infinity } }} />
      <motion.circle cy={60} r={13} fill="none" stroke="var(--wine)" strokeWidth={1.5} cx={m.b[0]} animate={reduce ? undefined : { cx: m.b, y: m.shake ? [0, 1.5, -1.5, 0] : 0 }} transition={reduce ? undefined : { ...t, y: { duration: 0.35, repeat: Infinity } }} />
    </svg>
  );
}
