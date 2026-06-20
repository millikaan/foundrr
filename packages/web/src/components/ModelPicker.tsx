/**
 * ModelPicker — a compact "pick your AI model" control that lives in the Header.
 * The chosen model tags telemetry and the global leaderboard bucket, AND drives
 * which agent the Founder terminal launches — so it is the user's identity on
 * the board and the terminal's launch target.
 *
 * Controlled by App: it receives the selected `model` key (lifted so the Header
 * picker and the terminal launch button stay in lockstep), the launchable
 * `agents` with install state (for a subtle "· not installed" hint), and an
 * `onModelChange` callback. Choosing a model optimistically calls back, then
 * POSTs to /api/config/model; on failure it reverts and shows an inline error.
 *
 * A real native <select> is used deliberately — it is the most robust,
 * keyboard-accessible, and mobile-friendly option, styled to the telemetry
 * console theme (dark, mono, hairline border).
 */
import { useState } from "react";

import { MODELS, modelByKey } from "@mission-control/shared";

import { ApiError, setModelApi, type LaunchableAgent } from "../lib/api";

interface ModelPickerProps {
  /** The selected model key; null until loaded by the parent. */
  model: string | null;
  /** Launchable agents + install state; null if unknown (hints skipped). */
  agents: LaunchableAgent[] | null;
  /** Called with the new key when the user picks a model. */
  onModelChange: (model: string) => void;
}

/** What the active model should show; falls back to the raw key if unknown. */
function labelFor(key: string | null): string {
  if (!key) return "…";
  return modelByKey(key)?.name ?? key;
}

/**
 * The option label, with a subtle "· not installed" suffix when we know the
 * agent's CLI is missing. Unknown install state (no /api/agents, or an
 * IDE-based model not in the list) shows the plain name.
 */
function optionLabel(key: string, name: string, agents: LaunchableAgent[] | null): string {
  if (!agents) return name;
  const agent = agents.find((a) => a.key === key);
  if (agent && !agent.installed) return `${name} · not installed`;
  return name;
}

export function ModelPicker({ model, agents, onModelChange }: ModelPickerProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSelect = async (next: string): Promise<void> => {
    const previous = model;
    if (next === previous) return;
    // Optimistic: reflect the choice immediately via the parent, then persist.
    onModelChange(next);
    setPending(true);
    setError(null);
    try {
      await setModelApi(next);
    } catch (err: unknown) {
      // Revert to last-known-good and surface a short inline message.
      if (previous) onModelChange(previous);
      const message =
        err instanceof ApiError && err.status === 400
          ? "invalid model"
          : "couldn't save";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const disabled = model === null || pending;

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {/* cpu glyph — the "which AI" affordance. */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: "var(--color-faint)" }}
        className="hidden sm:block"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>

      <div className="relative inline-flex items-center">
        {/* Active accent dot — the chosen model uses --signal (the board's amber). */}
        <span
          className="pointer-events-none absolute left-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            backgroundColor: model ? "var(--color-signal)" : "var(--color-faint)",
          }}
          aria-hidden="true"
        />
        <select
          aria-label="AI model"
          title={`AI: ${labelFor(model)}`}
          value={model ?? ""}
          disabled={disabled}
          onChange={(e) => void onSelect(e.target.value)}
          className="mono cursor-pointer appearance-none rounded-md pl-5 pr-6 text-[0.6875rem] tracking-wider transition-colors disabled:cursor-default disabled:opacity-60"
          style={{
            height: "1.875rem", // ~30px box; gap + touch padding lands near 36px overall
            minWidth: "5.5rem",
            color: "var(--color-text)",
            backgroundColor: "color-mix(in srgb, var(--color-line) 35%, transparent)",
            border: "1px solid var(--color-line)",
          }}
        >
          {model === null ? <option value="">AI…</option> : null}
          {MODELS.map((m) => (
            <option key={m.key} value={m.key}>
              {optionLabel(m.key, m.name, agents)}
            </option>
          ))}
        </select>
        {/* Chevron — purely decorative since we removed the native arrow. */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="pointer-events-none absolute right-2"
          style={{ color: "var(--color-faint)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Inline error — terse, only when a save fails. */}
      {error ? (
        <span
          className="mono text-[0.625rem]"
          style={{ color: "var(--color-alert)" }}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
