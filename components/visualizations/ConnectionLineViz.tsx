"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Duas formas ligadas por uma linha. variant controla distância e continuidade da linha. */
export default function ConnectionLineViz({ variant = "hero", className = "" }: { variant?: "hero" | "low" | "mid" | "high"; className?: string }) {
  const reduce = useReducedMotion();
  const gap = variant === "low" ? 150 : variant === "mid" ? 110 : 80;
  const left = 160 - gap / 2, right = 160 + gap / 2;
  const dash = variant === "low" ? "4 10" : variant === "mid" ? "18 8" : "0";
  const drift = reduce || variant !== "hero" ? 0 : 8;
  return (
    <svg viewBox="0 0 320 120" className={className} role="img" aria-label="Duas formas ligadas por uma linha, representando a distância entre duas pessoas">
      <motion.line initial={{ x1: left, x2: right }} y1={60} y2={60} stroke="var(--wine-soft)" strokeWidth={1.5} strokeDasharray={dash} strokeLinecap="round"
        animate={drift ? { x1: [left, left - drift, left], x2: [right, right + drift, right] } : { x1: left, x2: right }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle initial={{ cx: left }} cy={60} r={14} fill="var(--wine)" animate={drift ? { cx: [left, left - drift, left] } : { cx: left }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle initial={{ cx: right }} cy={60} r={14} fill="none" stroke="var(--wine)" strokeWidth={1.5} animate={drift ? { cx: [right, right + drift, right] } : { cx: right }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      <circle cx={160} cy={60} r={2} fill="var(--gold-muted)" opacity={variant === "low" ? 0.3 : 0.8} />
    </svg>
  );
}
