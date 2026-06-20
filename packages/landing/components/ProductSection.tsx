"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MeshWhisper, RadialBloom, useParallax } from "@/components/Ambient";

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
  { prompt: "›", text: "applying migration 0042_add_index", tone: "text-ink-muted" },
  { prompt: "✓", text: "3 files changed, 0 conflicts", tone: "text-ink" },
  { prompt: "›", text: "wants to run: npm run deploy", tone: "text-signal-ink" },
];

/**
 * Light product section — off-white canvas. A faithful mock of the Founder
 * dashboard built in CSS/JSX from the product's own aesthetic (mono, agent
 * cards, a terminal, breathing amber pulses), now rendered as a crisp light
 * product mock: light surfaces, 1px hairlines, ink mono text. The focal element
 * is the remote-approve moment: a Telegram-style Approve / Deny card carrying
 * the single amber glow on the page. This is the emotional peak.
 */
export function ProductSection() {
  const reduce = useReducedMotion();
  const frameParallax = useParallax(0.6);

  return (
    <section className="relative overflow-hidden border-t border-hairline bg-canvas text-ink">
      {/* Ambient: a whisper of light-on-light mesh — no dark layers. */}
      <MeshWhisper />

      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink-faint">
            Remote control
          </p>
          <h2 className="mt-4 font-display text-3xl font-light leading-[1.12] tracking-[-0.02em] text-ink sm:text-5xl">
            Drive your agents from your pocket.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            The dashboard runs on your machine. When an agent needs a yes, the
            prompt comes to you — wherever you are.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          {/* ── Mock dashboard frame (gently parallaxed) ─────────────── */}
          <div ref={frameParallax}>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lift-light overflow-hidden rounded-2xl border border-hairline bg-canvas-raised"
          >
            <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
              <span className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--ink-faint)_55%,transparent)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--ink-faint)_55%,transparent)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--ink-faint)_55%,transparent)]" />
              </span>
              <span className="ml-2 font-mono text-[0.7rem] text-ink-faint">
                foundrr · localhost
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.66rem] text-ink-muted">
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
                    className="lift-light rounded-xl border border-hairline bg-canvas px-3.5 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        {agent.live && (
                          <span className="agent-pulse absolute inset-0" aria-hidden />
                        )}
                        <span
                          className={`relative inline-block h-1.5 w-1.5 rounded-full ${
                            agent.live ? "bg-signal" : "bg-ink-faint"
                          }`}
                        />
                      </span>
                      <span className="font-mono text-[0.72rem] text-ink">
                        {agent.name}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[0.7rem] text-ink-muted">
                        {agent.status}
                      </span>
                      <span className="font-mono text-[0.66rem] text-ink-faint">
                        {agent.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Terminal pane */}
              <div className="rounded-xl border border-hairline bg-canvas p-3.5">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                  session log
                </p>
                <div className="mt-3 space-y-2">
                  {TERMINAL_LINES.map((line, i) => (
                    <p key={i} className="font-mono text-[0.72rem] leading-relaxed">
                      <span className="mr-2 text-ink-faint">{line.prompt}</span>
                      <span className={line.tone}>{line.text}</span>
                    </p>
                  ))}
                  <p className="font-mono text-[0.72rem] text-ink-muted">
                    <span className="mr-2 text-ink-faint">›</span>
                    <span className="caret" aria-hidden />
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          </div>

          {/* ── Focal: Telegram-style remote approve card (the amber glow) ─ */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative flex flex-col justify-center"
          >
            {/* Slow amber bloom behind the focal approve card — the page's one glow. */}
            <RadialBloom className="-inset-6 -z-10" />
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
              On your phone
            </p>
            <div className="approve-pulse mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--signal)_45%,var(--hairline))] bg-[color-mix(in_srgb,var(--signal)_6%,var(--canvas-raised))] p-5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-signal" aria-hidden />
                <span className="font-mono text-[0.7rem] text-ink-muted">
                  @foundrremotebot
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink">
                <span className="font-mono font-medium text-signal-ink">
                  claude-code · infra
                </span>{" "}
                wants to run:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-hairline bg-canvas px-3 py-2.5 font-mono text-[0.72rem] text-ink">
                <code>npm run deploy --prod</code>
              </pre>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  className="signal-glow-box pill-signal rounded-xl bg-signal px-4 py-2.5 text-sm font-medium text-[#1b1206]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-hairline bg-canvas-raised px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-ink/25 hover:text-ink"
                >
                  Deny
                </button>
              </div>
            </div>
            <p className="mt-4 font-mono text-[0.66rem] leading-relaxed text-ink-faint">
              One tap. The agent unblocks and keeps going.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
