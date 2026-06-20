"use client";

import { useLiveData, type LiveData } from "@/lib/useLiveData";
import { useCountUp } from "@/lib/useCountUp";
import { formatInt, formatUsd } from "@/lib/format";

/**
 * Big live telemetry numerals — dark canvas. Oversized JetBrains Mono numbers,
 * each over a hairline underline with a tiny caption. Data is real: it reads
 * the live global_totals through useLiveData (server-seeded, client-polled).
 */
function LiveStat({
  value,
  caption,
  ariaLabel,
  live,
}: {
  value: string;
  caption: string;
  ariaLabel: string;
  live: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className="font-mono text-[clamp(2.25rem,9vw,5rem)] font-light leading-none tracking-[-0.03em] tabular-nums text-text"
        aria-label={ariaLabel}
      >
        {value}
      </span>
      <span className="mt-5 border-t border-line pt-3 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-faint">
        <span className="inline-flex items-center gap-2">
          {live && (
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="pulse-dot absolute inset-0" aria-hidden />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
          )}
          {caption}
        </span>
      </span>
    </div>
  );
}

export function Counters({ initial }: { initial: LiveData }) {
  const { totals } = useLiveData(initial);
  const animatedTokens = useCountUp(totals.total_tokens);
  const animatedCost = useCountUp(totals.total_cost_usd);
  const live = totals.events > 0 || totals.installs > 0;

  return (
    <div className="grid gap-12 sm:grid-cols-2">
      <LiveStat
        value={formatInt(animatedTokens)}
        caption="total tokens metered"
        ariaLabel={`${formatInt(totals.total_tokens)} tokens metered`}
        live={live}
      />
      <LiveStat
        value={formatUsd(animatedCost)}
        caption="total spend tracked"
        ariaLabel={`${formatUsd(totals.total_cost_usd)} total spend`}
        live={live}
      />
    </div>
  );
}
