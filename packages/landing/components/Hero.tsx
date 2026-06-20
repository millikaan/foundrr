"use client";

import { motion, useReducedMotion } from "framer-motion";

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="transition-transform group-hover:translate-x-0.5"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/**
 * Hero — light off-white canvas. Headline-first: an oversized, thin two-line
 * headline carries the section. A short muted subline + one quiet secondary
 * link. Ambient blob field sits behind at extremely low contrast. A quiet
 * scroll cue hints at what's below. No amber here — the headline is the look.
 */
export function Hero() {
  const reduce = useReducedMotion();

  const lineUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-canvas"
    >
      {/* Ambient blob field — the only texture, extremely low contrast. */}
      <div className="blob-field" aria-hidden>
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 pt-28 pb-24 sm:pt-36 sm:pb-32 text-center">
        <motion.p
          {...lineUp(0)}
          className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink-faint"
        >
          Open-source dev supervision
        </motion.p>

        <h1 className="mt-7 font-display text-[2.6rem] leading-[1.05] tracking-[-0.02em] text-ink sm:text-[4.5rem] sm:leading-[1.02]">
          <motion.span {...lineUp(0.06)} className="block font-light">
            You left the desk.
          </motion.span>
          <motion.span {...lineUp(0.14)} className="block font-light">
            Your agents kept working.
          </motion.span>
        </h1>

        <motion.p
          {...lineUp(0.24)}
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
        >
          Founder is a local command center for your terminal agents. Watch every
          session live, and approve what they ask — from anywhere.
        </motion.p>

        <motion.div {...lineUp(0.32)} className="mt-9">
          <a
            href="#how-it-works"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink underline-offset-4 hover:underline"
          >
            See how it works
            <ArrowRight />
          </a>
        </motion.div>

        {/* Quiet scroll cue. */}
        <div className="mt-24 flex justify-center" aria-hidden>
          <span className="scroll-cue text-ink-faint">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
