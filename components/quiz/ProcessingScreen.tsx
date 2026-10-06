"use client";
import { useEffect, useState } from "react";
import XRayRing from "@/components/visualizations/XRayRing";

export default function ProcessingScreen({ phrases, onDone, duration = 3200 }: { phrases: string[]; onDone: () => void; duration?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const step = duration / phrases.length;
    const t = setInterval(() => setI((x) => Math.min(x + 1, phrases.length - 1)), step);
    const done = setTimeout(onDone, duration + 200);
    return () => { clearInterval(t); clearTimeout(done); };
  }, [duration, phrases.length, onDone]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center" aria-live="polite" aria-busy="true">
      <XRayRing duration={duration / 1000} className="w-[180px]" />
      <p className="font-serif text-[22px] italic text-ink-soft md:text-[26px]" data-testid="processing-phrase">{phrases[i]}</p>
    </div>
  );
}
