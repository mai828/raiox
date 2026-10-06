"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Anel sendo desenhado durante o processamento. */
export default function XRayRing({ duration = 3, className = "" }: { duration?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Fechando seu Raio-X">
      <circle cx={100} cy={100} r={78} fill="none" stroke="var(--line)" strokeWidth={1} />
      <motion.circle cx={100} cy={100} r={78} fill="none" stroke="var(--wine)" strokeWidth={2} strokeLinecap="round" transform="rotate(-90 100 100)"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration, ease: "easeInOut" }} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        return <motion.line key={i} x1={100} y1={100} x2={100 + 56 * Math.cos(a)} y2={100 + 56 * Math.sin(a)} stroke="var(--wine-soft)" strokeWidth={1.5}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: (duration / 5) * i, duration: 0.6 }} />;
      })}
      <circle cx={100} cy={100} r={5} fill="var(--wine)" />
    </svg>
  );
}
