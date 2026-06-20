import { Reveal } from "@/components/Reveal";

const WITHOUT: ReadonlyArray<string> = [
  "An agent stalls on a permission prompt",
  "It sits idle, waiting on you",
  "You're away from the keyboard",
];

const WITH: ReadonlyArray<string> = [
  "The prompt lands on your phone",
  "One tap approves it",
  "The agent keeps moving",
];

function Dot({ tone }: { tone: "muted" | "signal" }) {
  return (
    <span
      className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
        tone === "signal" ? "bg-ink" : "bg-ink-faint"
      }`}
      aria-hidden
    />
  );
}

/**
 * Light, centered. A confident one-line claim + a small pill, then a
 * two-column Without / With Founder comparison built from hairline cards.
 */
export function ClaimSection() {
  return (
    <section className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-4xl px-5 py-24 sm:py-32">
        <Reveal className="flex flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-hairline bg-canvas-raised px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-muted">
            One screen
          </span>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-light leading-[1.15] tracking-[-0.02em] text-ink sm:text-5xl">
            Everything your machine is doing. On one screen.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Reveal
            delay={0.05}
            className="rounded-2xl border border-hairline bg-canvas-raised p-7"
          >
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
              Without Founder
            </p>
            <ul className="mt-5 space-y-3">
              {WITHOUT.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-muted"
                >
                  <Dot tone="muted" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={0.12}
            className="rounded-2xl border border-ink/15 bg-canvas-raised p-7"
          >
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink">
              With Founder
            </p>
            <ul className="mt-5 space-y-3">
              {WITH.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[0.95rem] leading-relaxed text-ink"
                >
                  <Dot tone="signal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
