"use client";

import { motion, useReducedMotion } from "framer-motion";

interface AgentCard {
  readonly name: string;
  readonly status: string;
  readonly meta: string;
  readonly live: boolean;
}

const AGENTS: ReadonlyArray<AgentCard> = [
  { name: "claude-code · api", status: "editing routes/auth.ts", meta: "+128 −12", live: true },
  { name: "claude-code · web", status: "running test suite", meta: "94 passed", live: true },
  { name: "claude-code · infra", status: "idle", meta: "waiting", live: false },
];

const TERMINAL_LINES: ReadonlyArray<{ prompt: string; text: string; tone: string }> = [
  { prompt: "›", text: "applying migration 0042_add_index", tone: "text-muted" },
  { prompt: "✓", text: "3 files changed, 0 conflicts", tone: "text-ok" },
  { prompt: "›", text: "wants to run: npm run deploy", tone: "text-signal" },
];

/**
 * Dark product section — near-black void. A faithful mock of the Founder
 * dashboard built in CSS/JSX from the product's own aesthetic (mono, agent
 * cards, a terminal, breathing amber pulses). The focal element is the
 * remote-approve moment: a Telegram-style Approve / Deny card carrying the
 * single amber glow on the page. This is the emotional peak.
 */
export function ProductSection() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-void text-text">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-faint">
            Remote control
          </p>
          <h2 className="mt-4 font-display text-3xl font-light leading-[1.12] tracking-[-0.02em] text-text sm:text-5xl">
            Drive your agents from your pocket.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            The dashboard runs on your machine. When an agent needs a yes, the
            prompt comes to you — wherever you are.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          {/* ── Mock dashboard frame ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl border border-line bg-[color-mix(in_srgb,var(--panel)_70%,var(--void))]"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--faint)_60%,transparent)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--faint)_60%,transparent)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--faint)_60%,transparent)]" />
              </span>
              <span className="ml-2 font-mono text-[0.7rem] text-faint">
                founder · localhost
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.66rem] text-muted">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="pulse-dot absolute inset-0" aria-hidden />
                  <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
                live
              </span>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {/* Agent cards */}
              <div className="space-y-2.5">
                {AGENTS.map((agent) => (
                  <div
                    key={agent.name}
                    className="rounded-xl border border-line bg-void-2 px-3.5 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        {agent.live && (
                          <span className="agent-pulse absolute inset-0" aria-hidden />
                        )}
                        <span
                          className={`relative inline-block h-1.5 w-1.5 rounded-full ${
                            agent.live ? "bg-signal" : "bg-faint"
                          }`}
                        />
                      </span>
                      <span className="font-mono text-[0.72rem] text-text">
                        {agent.name}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[0.7rem] text-muted">
                        {agent.status}
                      </span>
                      <span className="font-mono text-[0.66rem] text-faint">
                        {agent.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Terminal pane */}
              <div className="rounded-xl border border-line bg-void-2 p-3.5">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-faint">
                  session log
                </p>
                <div className="mt-3 space-y-2">
                  {TERMINAL_LINES.map((line, i) => (
                    <p key={i} className="font-mono text-[0.72rem] leading-relaxed">
                      <span className="mr-2 text-faint">{line.prompt}</span>
                      <span className={line.tone}>{line.text}</span>
                    </p>
                  ))}
                  <p className="font-mono text-[0.72rem] text-muted">
                    <span className="mr-2 text-faint">›</span>
                    <span className="caret" aria-hidden />
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Focal: Telegram-style remote approve card (the amber glow) ─ */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-faint">
              On your phone
            </p>
            <div className="approve-pulse mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--signal)_40%,var(--line))] bg-[color-mix(in_srgb,var(--signal)_7%,var(--panel))] p-5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-signal" aria-hidden />
                <span className="font-mono text-[0.7rem] text-muted">
                  @foundrremotebot
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-text">
                <span className="font-mono text-signal signal-glow-soft">
                  claude-code · infra
                </span>{" "}
                wants to run:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-void-2 px-3 py-2.5 font-mono text-[0.72rem] text-text">
                <code>npm run deploy --prod</code>
              </pre>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  className="signal-glow-box rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-[#1b1206] transition-transform hover:-translate-y-px"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-faint hover:text-text"
                >
                  Deny
                </button>
              </div>
            </div>
            <p className="mt-4 font-mono text-[0.66rem] leading-relaxed text-faint">
              One tap. The agent unblocks and keeps going.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
