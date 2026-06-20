import Link from "next/link";

import { GITHUB_URL } from "@/lib/config";
import { Reveal } from "@/components/Reveal";
import { MeshWhisper } from "@/components/Ambient";

/**
 * Final CTA — light canvas, minimal. A thin headline, the amber "Get Founder"
 * pill (the page's third and final amber moment), and the honest install
 * one-liner. The pill links to GitHub; the install hint links to /setup.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-hairline bg-canvas">
      <MeshWhisper />
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:py-32">
        <Reveal className="flex flex-col items-center">
          <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink-faint">
            Get started
          </p>
          <h2 className="max-w-2xl font-display text-3xl font-light leading-[1.12] tracking-[-0.02em] text-ink sm:text-5xl">
            Keep your agents running while you live your life.
          </h2>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-signal mt-10 inline-flex items-center justify-center rounded-full bg-signal px-6 py-3 text-sm font-medium text-[#1b1206]"
          >
            Get Foundrr
          </a>

          <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-hairline bg-canvas-raised px-4 py-2.5">
            <code className="font-mono text-[0.82rem] text-ink">
              <span className="select-none text-ink-faint">$ </span>
              git clone …/foundrr &amp;&amp; npm install
            </code>
          </div>

          <p className="mt-5 text-sm text-ink-muted">
            Full walkthrough on the{" "}
            <Link
              href="/setup"
              className="text-ink underline underline-offset-4"
            >
              setup page
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
