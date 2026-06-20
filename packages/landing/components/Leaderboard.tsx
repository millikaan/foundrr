"use client";

import { useLiveData, type LiveData } from "@/lib/useLiveData";
import { MODELS, resolveModel } from "@/lib/models";
import { formatCompact, formatUsd, relativeTime } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/supabase";

const EMPTY_ROW: Omit<LeaderboardRow, "agent"> = {
  total_tokens: 0,
  input_tokens: 0,
  output_tokens: 0,
  total_cost_usd: 0,
  installs: 0,
  events: 0,
  last_seen: null,
};

// Merge live rows over the canonical top-10 so every model shows, ranked by
// tokens. Unknown agents from the DB are appended after the canonical set.
function buildRows(live: LeaderboardRow[]): LeaderboardRow[] {
  const byAgent = new Map(live.map((r) => [r.agent, r]));
  const canonical: LeaderboardRow[] = MODELS.map(
    (m) => byAgent.get(m.key) ?? { agent: m.key, ...EMPTY_ROW },
  );
  const extras = live.filter((r) => !MODELS.some((m) => m.key === r.agent));
  return [...canonical, ...extras].sort(
    (a, b) => b.total_tokens - a.total_tokens,
  );
}

/**
 * Restyled minimal leaderboard — hairline rows on the dark canvas, mono
 * numbers, the #1 agent subtly amber. Data is real: it reads the live
 * model_leaderboard via useLiveData. No share bars, no shadows — just rows.
 */
function Row({ row, rank }: { row: LeaderboardRow; rank: number }) {
  const model = resolveModel(row.agent);
  const isLeader = rank === 1 && row.total_tokens > 0;
  const hasData = row.total_tokens > 0 || row.installs > 0;

  return (
    <li className="flex items-center gap-4 border-t border-line py-3.5">
      <span
        className={`w-6 shrink-0 font-mono text-sm tabular-nums ${
          isLeader ? "text-signal" : "text-faint"
        }`}
      >
        {rank.toString().padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <span
          className={`truncate text-sm ${
            isLeader ? "text-signal signal-glow-soft" : "text-text"
          }`}
        >
          {model.name}
        </span>
        <span className="ml-2 text-xs text-faint">{model.vendor}</span>
      </div>
      <span className="hidden w-24 shrink-0 text-right font-mono text-xs text-muted tabular-nums sm:block">
        {hasData ? formatUsd(row.total_cost_usd) : "—"}
      </span>
      <span
        className={`w-20 shrink-0 text-right font-mono text-sm tabular-nums ${
          isLeader ? "text-signal" : "text-text"
        }`}
      >
        {hasData ? formatCompact(row.total_tokens) : "—"}
      </span>
    </li>
  );
}

export function Leaderboard({ initial }: { initial: LiveData }) {
  const { leaderboard } = useLiveData(initial);
  const rows = buildRows(leaderboard);
  const hasAny = rows.some((r) => r.total_tokens > 0);

  const lastSeen =
    leaderboard.length > 0
      ? relativeTime(
          leaderboard
            .map((r) => r.last_seen)
            .filter(Boolean)
            .sort()
            .at(-1) ?? null,
        )
      : "—";

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-faint">
          Model leaderboard
        </p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] text-faint">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="pulse-dot absolute inset-0" aria-hidden />
            <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          updated {lastSeen}
        </span>
      </div>
      <ol className="mt-4" aria-live="polite">
        {rows.slice(0, 10).map((row, i) => (
          <Row key={row.agent} row={row} rank={i + 1} />
        ))}
      </ol>
      {!hasAny && (
        <p className="mt-6 text-center text-sm text-muted">
          No agents reporting yet — the leaderboard fills in as installs come
          online.
        </p>
      )}
    </div>
  );
}
