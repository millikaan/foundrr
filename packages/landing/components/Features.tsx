import { Reveal } from "@/components/Reveal";
import type { ReactNode } from "react";

const STROKE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function AgentsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...STROKE}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M7 9l3 2.5L7 14M13 14h4M8 21h8" />
    </svg>
  );
}

function ServersIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...STROKE}>
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  );
}

function LeashIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden {...STROKE}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

interface Feature {
  readonly icon: ReactNode;
  readonly label: string;
  readonly body: string;
}

const FEATURES: ReadonlyArray<Feature> = [
  {
    icon: <AgentsIcon />,
    label: "Live agents",
    body: "See every Claude Code session as it runs — files touched, commands fired, tokens spent.",
  },
  {
    icon: <ServersIcon />,
    label: "Dev servers",
    body: "Every listening port on your machine, surfaced and reachable with one tap.",
  },
  {
    icon: <LeashIcon />,
    label: "The leash",
    body: "Approve and drive your agents from your pocket. The permission prompt comes to you.",
  },
];

/**
 * Light feature triple. Thin 1px line icons, a near-bold label, one muted
 * line each. Separated by hairlines, lots of negative space.
 */
export function Features() {
  return (
    <section id="features" className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-5xl px-5 py-24 sm:py-32">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.label}
              delay={i * 0.08}
              className="flex flex-col bg-canvas p-8 sm:p-10"
            >
              <span className="text-ink">{feature.icon}</span>
              <h3 className="mt-6 text-lg font-medium text-ink">
                {feature.label}
              </h3>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-muted">
                {feature.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
