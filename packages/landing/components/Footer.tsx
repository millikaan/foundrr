import Link from "next/link";

import { GITHUB_URL, SITE_URL } from "@/lib/config";

const PRODUCT_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#telemetry", label: "Live telemetry" },
];

export function Footer() {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2 w-2 rotate-45 bg-ink" aria-hidden />
              <p className="text-base font-medium text-ink">Founder</p>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Supervise your AI coding agents from anywhere. Open-source,
              self-hosted dev supervision.
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
              Product
            </p>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
              Resources
            </p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/setup"
                  className="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  Setup
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="#telemetry"
                  className="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  Telemetry disclosure
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-2 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-ink-faint">{host}</p>
          <p className="font-mono text-xs text-ink-faint">
            © {year} Founder · MIT Licensed
          </p>
        </div>
      </div>
    </footer>
  );
}
