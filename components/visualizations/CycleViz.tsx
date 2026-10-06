"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { CycleNode } from "@/types";

/** Nós dispostos em anel, com setas sutis entre eles. */
export default function CycleViz({ nodes, className = "" }: { nodes: CycleNode[]; className?: string }) {
  const reduce = useReducedMotion();
  const n = nodes.length;
  const cx = 200, cy = 170, r = 118;
  const pts = nodes.map((_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return (
    <svg viewBox="0 0 400 340" className={className} role="img" aria-label={`Sequência: ${nodes.map((x) => x.label).join(", depois ")}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeDasharray="2 6" />
      {pts.map((p, i) => {
        const q = pts[(i + 1) % n];
        const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
        return (
          <motion.line key={i} x1={p.x + (dx / len) * 22} y1={p.y + (dy / len) * 22} x2={q.x - (dx / len) * 22} y2={q.y - (dy / len) * 22}
            stroke="var(--wine-soft)" strokeWidth={1.2} markerEnd="url(#arrow)"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.2 + i * 0.25, duration: 0.5 }} />
        );
      })}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--wine-soft)" />
        </marker>
      </defs>
      {pts.map((p, i) => (
        <motion.g key={i} initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.25, duration: 0.4 }} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
          <circle cx={p.x} cy={p.y} r={5} fill={i === 0 ? "var(--wine)" : "var(--surface)"} stroke="var(--wine)" strokeWidth={1.5} />
          <text x={p.x} y={p.y + (p.y < cy - 10 ? -16 : p.y > cy + 10 ? 24 : 5)} textAnchor={p.x < cx - 20 ? "end" : p.x > cx + 20 ? "start" : "middle"}
            dx={p.x < cx - 20 ? -12 : p.x > cx + 20 ? 12 : 0} fontSize={12.5} fill="var(--ink)" fontFamily="var(--font-sans)" fontWeight={i === 0 ? 600 : 500}>
            {nodes[i].label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
