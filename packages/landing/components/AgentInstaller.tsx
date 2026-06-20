"use client";

import { useId, useRef, useState } from "react";

import { CodeBlock } from "@/components/CodeBlock";

/** A single terminal coding agent shown in the tabbed installer. */
interface Agent {
  readonly id: string;
  readonly name: string;
  readonly vendor: string;
  /** One-line install command, or null for agents installed per-platform. */
  readonly command: string | null;
  readonly link: { readonly href: string; readonly label: string };
  /** Short note shown under the command (e.g. for Amazon Q's per-OS install). */
  readonly note?: string;
}

const CLAUDE_CODE_URL = "https://claude.com/claude-code";
const CODEX_URL = "https://github.com/openai/codex";
const GEMINI_CLI_URL = "https://github.com/google-gemini/gemini-cli";
const AIDER_URL = "https://aider.chat";
const AMAZON_Q_DOCS_URL =
  "https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html";

/** Tab order. Claude Code is first and the default selection. */
const AGENTS: readonly Agent[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    vendor: "Anthropic",
    command: "npm install -g @anthropic-ai/claude-code",
    link: { href: CLAUDE_CODE_URL, label: "claude.com/claude-code" },
  },
  {
    id: "openai-codex",
    name: "OpenAI Codex",
    vendor: "OpenAI",
    command: "npm install -g @openai/codex",
    link: { href: CODEX_URL, label: "github.com/openai/codex" },
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    vendor: "Google",
    command: "npm install -g @google/gemini-cli",
    link: { href: GEMINI_CLI_URL, label: "github.com/google-gemini/gemini-cli" },
  },
  {
    id: "aider",
    name: "Aider",
    vendor: "open source",
    command: "pipx install aider-chat",
    link: { href: AIDER_URL, label: "aider.chat" },
  },
  {
    id: "amazon-q",
    name: "Amazon Q",
    vendor: "AWS",
    command: null,
    link: {
      href: AMAZON_Q_DOCS_URL,
      label: "AWS Amazon Q Developer CLI docs",
    },
    note: "The Amazon Q Developer CLI installs per-platform. Follow AWS's official guide for your OS.",
  },
] as const;

function ExternalIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="inline-block"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </svg>
  );
}

/**
 * Accessible tabbed agent picker. A `tablist` of terminal agents sits above a
 * single `tabpanel` that shows only the selected agent's install command + link.
 *
 * Keyboard: Left/Right (and Home/End) move between tabs using roving tabindex,
 * matching the WAI-ARIA tabs pattern. Selection follows focus.
 */
export function AgentInstaller() {
  const [activeId, setActiveId] = useState<string>(AGENTS[0]!.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const activeIndex = AGENTS.findIndex((a) => a.id === activeId);
  const active = AGENTS[activeIndex] ?? AGENTS[0]!;

  const focusTab = (index: number) => {
    const next = ((index % AGENTS.length) + AGENTS.length) % AGENTS.length;
    const agent = AGENTS[next];
    if (!agent) return;
    setActiveId(agent.id);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(AGENTS.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-[color-mix(in_srgb,var(--panel)_55%,transparent)] p-2 sm:p-3">
      {/* ── Tablist ──────────────────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Choose your AI coding agent"
        aria-orientation="horizontal"
        className="flex gap-1 overflow-x-auto rounded-xl bg-[color-mix(in_srgb,var(--void-2)_70%,transparent)] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {AGENTS.map((agent, i) => {
          const selected = agent.id === activeId;
          return (
            <button
              key={agent.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`${baseId}-tab-${agent.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${agent.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(agent.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 font-display text-sm font-medium transition-colors sm:px-4 ${
                selected
                  ? "bg-[color-mix(in_srgb,var(--signal)_14%,var(--panel))] text-text shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--signal)_40%,transparent)]"
                  : "text-muted hover:bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] hover:text-text"
              }`}
            >
              {agent.name}
              {selected ? (
                <span
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-signal"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Quiet IDE note — not a tab. */}
      <p className="mt-2.5 px-1.5 text-xs text-faint leading-relaxed">
        Cursor, GitHub Copilot, Cline, Windsurf, and Continue are IDE-based — they
        run inside your editor, so there&apos;s no terminal agent to install.
      </p>

      {/* ── Panel: only the active agent ─────────────────────────────────── */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.id}`}
        aria-labelledby={`${baseId}-tab-${active.id}`}
        tabIndex={0}
        className="mt-2 rounded-xl border border-line bg-panel p-5 focus-visible:outline-2 focus-visible:outline-cool sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-text">
              {active.name}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-faint">{active.vendor}</p>
          </div>
          <a
            href={active.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-cool"
          >
            {active.link.label}
            <ExternalIcon />
          </a>
        </div>

        {active.command ? (
          <div className="mt-5">
            <CodeBlock code={active.command} prompt="$" />
          </div>
        ) : (
          <>
            {active.note ? (
              <p className="mt-4 text-sm text-muted leading-relaxed">
                {active.note}
              </p>
            ) : null}
            <a
              href={active.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-[color-mix(in_srgb,var(--void-2)_88%,transparent)] px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-[var(--cool)] hover:text-cool"
            >
              {active.link.label}
              <ExternalIcon />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
