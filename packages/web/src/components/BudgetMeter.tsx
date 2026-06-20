/**
 * BudgetMeter — an optional daily spend budget the user sets locally. Purely a
 * client-side guardrail (persisted to localStorage, never sent anywhere): you
 * set a dollar cap for the day and a bar fills as today's spend climbs, turning
 * amber as it nears the cap and red once it's exceeded.
 */
import { useEffect, useState } from "react";
import { usd } from "../lib/format";

const BUDGET_KEY = "mc.budget.daily";

function readBudget(): number {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    const n = raw ? Number.parseFloat(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

interface BudgetMeterProps {
  /** Today's spend so far (USD). */
  todayUsd: number;
}

export function BudgetMeter({ todayUsd }: BudgetMeterProps) {
  const [budget, setBudget] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setBudget(readBudget());
  }, []);

  const save = (value: number): void => {
    setBudget(value);
    try {
      if (value > 0) localStorage.setItem(BUDGET_KEY, String(value));
      else localStorage.removeItem(BUDGET_KEY);
    } catch {
      // localStorage may be unavailable (private mode) — keep the in-memory value.
    }
  };

  const commit = (): void => {
    const n = Number.parseFloat(draft);
    save(Number.isFinite(n) && n > 0 ? n : 0);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono text-xs" style={{ color: "var(--color-faint)" }}>
          $
        </span>
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={draft}
          placeholder="5.00"
          aria-label="Daily budget in dollars"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="mono w-24 rounded-md px-2 py-1 text-xs outline-none focus-visible:[outline:2px_solid_var(--color-cool)] focus-visible:[outline-offset:1px]"
          style={{
            backgroundColor: "var(--color-inset)",
            color: "var(--color-text)",
            border: "1px solid var(--color-line)",
          }}
        />
        <button type="button" onClick={commit} className="pill pill-primary">
          SET
        </button>
        {budget > 0 ? (
          <button
            type="button"
            onClick={() => {
              save(0);
              setEditing(false);
            }}
            className="pill"
          >
            CLEAR
          </button>
        ) : null}
      </div>
    );
  }

  // No budget set yet → a quiet affordance to set one.
  if (budget <= 0) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft("");
          setEditing(true);
        }}
        className="pill pill-cool self-start"
      >
        + SET DAILY BUDGET
      </button>
    );
  }

  const pct = Math.min(100, (todayUsd / budget) * 100);
  const over = todayUsd > budget;
  const near = !over && pct >= 80;
  const fill = over
    ? "var(--color-alert)"
    : near
      ? "var(--color-signal)"
      : "var(--color-ok)";

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(String(budget));
        setEditing(true);
      }}
      className="flex w-full flex-col gap-1.5 text-left"
      aria-label={`Daily budget ${usd(budget)}, ${usd(todayUsd)} spent. Tap to edit.`}
    >
      <span className="flex items-baseline justify-between">
        <span
          className="mono text-xs tabular-nums"
          style={{ color: over ? "var(--color-alert)" : "var(--color-text)" }}
        >
          {usd(todayUsd)}{" "}
          <span style={{ color: "var(--color-faint)" }}>/ {usd(budget)}</span>
        </span>
        <span className="mono text-[0.625rem] tabular-nums" style={{ color: fill }}>
          {over ? "over budget" : `${Math.round(pct)}%`}
        </span>
      </span>
      <span
        className="block h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--color-inset)" }}
      >
        <span
          className="block h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: fill }}
        />
      </span>
    </button>
  );
}
