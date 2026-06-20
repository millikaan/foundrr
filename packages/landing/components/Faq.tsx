import { Reveal } from "@/components/Reveal";
import { MeshWhisper } from "@/components/Ambient";

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Does my code ever leave my machine?",
    a: "No. Foundrr runs as a local daemon on your dev box and binds to 127.0.0.1 by default. It watches sessions and serves the dashboard locally — your code, paths, and prompts are never uploaded.",
  },
  {
    q: "What does the telemetry actually share?",
    a: "Only anonymous totals — an install id, the model you picked, and token/cost deltas — to power the public leaderboard. Never code, file paths, or prompt text. Opt out any time with `mc telemetry share off`.",
  },
  {
    q: "How do approvals reach my phone?",
    a: "Through one shared Telegram bot, @foundrremotebot. When an agent hits a permission prompt it buzzes your phone with Approve / Deny. On timeout it falls back to the normal local prompt — it never silently allows.",
  },
  {
    q: "Is it safe to reach remotely?",
    a: "Access is gated by a single per-install token. For from-anywhere access prefer Tailscale (private, no public URL). The optional public tunnel is opt-in and sits behind an explicit warning.",
  },
  {
    q: "Is it open source?",
    a: "Yes — self-hosted and open source. One user, one token, local SQLite. You run the whole thing on your own machine.",
  },
];

/**
 * Security/trust FAQ — light canvas, Aqua restraint. A mono eyebrow + thin
 * headline open it; each Q/A is a hairline-separated row with lots of air. No
 * accordions, no amber — the negative space carries it.
 */
export function Faq() {
  return (
    <section id="faq" className="relative overflow-hidden border-t border-hairline bg-canvas">
      <MeshWhisper />
      <div className="relative mx-auto max-w-4xl px-5 py-24 sm:py-32">
        <Reveal>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink-faint">
            Questions
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-light leading-[1.15] tracking-[-0.02em] text-ink sm:text-5xl">
            Local by default. Yours by design.
          </h2>
        </Reveal>

        <dl className="mt-14">
          {FAQ.map((item, i) => (
            <Reveal
              key={item.q}
              delay={i * 0.06}
              className="grid gap-x-10 gap-y-2 border-t border-hairline py-8 sm:grid-cols-[1fr_1.4fr]"
            >
              <dt className="font-display text-lg font-normal tracking-[-0.01em] text-ink">
                {item.q}
              </dt>
              <dd className="max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
                {item.a}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
