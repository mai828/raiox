"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Duas áreas de carga com blocos abstratos. `you` e `partner` em 0–1, derivados das respostas. */
export default function LoadBalanceViz({ you, partner, className = "" }: { you: number; partner: number; className?: string }) {
  const reduce = useReducedMotion();
  const blocks = (v: number) => Math.max(1, Math.round(v * 7));
  const col = (x: number, n: number, filled: boolean, label: string) => (
    <g aria-label={`${label}: ${n} de 7`}>
      {Array.from({ length: n }).map((_, i) => (
        <motion.rect key={i} x={x} width={70} height={10} rx={3} y={112 - i * 14}
          fill={filled ? "var(--wine)" : "var(--surface-strong)"} stroke={filled ? "none" : "var(--wine-soft)"} strokeWidth={filled ? 0 : 1}
          initial={reduce ? false : { opacity: 0, y: 118 - i * 14 }} animate={{ opacity: 1, y: 112 - i * 14 }} transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }} />
      ))}
      <text x={x + 35} y={136} textAnchor="middle" fontSize={11} fill="var(--muted)" fontFamily="var(--font-sans)">{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 320 144" className={className} role="img" aria-label="Comparação abstrata de carga entre você e seu parceiro, pelas suas respostas">
      <line x1={40} y1={124} x2={280} y2={124} stroke="var(--line)" />
      {col(70, blocks(you), true, "você")}
      {col(180, blocks(partner), false, "parceiro")}
    </svg>
  );
}
