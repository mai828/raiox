"use client";
import type { ReactNode } from "react";
import type { Insight } from "@/lib/scoring/insights";

export default function InsightScreen({ insight, visual, onContinue }: { insight: Insight; visual?: ReactNode; onContinue: () => void }) {
  return (
    <div className="flex flex-col gap-7">
      {visual ? <div className="mx-auto w-full max-w-[360px]">{visual}</div> : null}
      <div className="flex flex-col gap-4">
        {insight.eyebrow ? <p className="eyebrow">{insight.eyebrow}</p> : null}
        <h1 className="balance font-serif text-[30px] font-medium leading-tight text-ink md:text-[38px]">{insight.headline}</h1>
        <div className="flex flex-col gap-3 text-[17px] leading-relaxed text-ink-soft">
          {insight.body.map((p, i) => <p key={i} className="pretty">{p}</p>)}
        </div>
      </div>
      <div><button type="button" className="btn-primary" onClick={onContinue} data-testid="continue">{insight.cta}</button></div>
    </div>
  );
}
