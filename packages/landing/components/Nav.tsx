"use client";

import { useState } from "react";
import Link from "next/link";

import { GITHUB_URL } from "@/lib/config";

/** Diamond ◆ wordmark used across the site. Root-relative so it works on /setup too. */
function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Foundrr home">
      <span className="inline-block h-2 w-2 rotate-45 bg-ink" aria-hidden />
      <span className="text-[0.95rem] font-medium tracking-tight text-ink">Foundrr</span>
    </Link>
  );
}

interface NavLink {
  readonly href: string;
  readonly label: string;
  readonly external?: boolean;
}

const LINKS: ReadonlyArray<NavLink> = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/setup", label: "Setup" },
  { href: GITHUB_URL, label: "GitHub", external: true },
];

function NavItem({ link, onClick, className }: { link: NavLink; onClick?: () => void; className?: string }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onClick} className={className}>
      {link.label}
    </Link>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-[color-mix(in_srgb,var(--canvas)_82%,transparent)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Wordmark />

        <div className="flex items-center gap-6">
          {/* Desktop links */}
          <div className="hidden items-center gap-6 sm:flex">
            {LINKS.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              />
            ))}
          </div>

          {/* Desktop CTA */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-signal hidden items-center justify-center rounded-full bg-signal px-4 py-1.5 text-sm font-medium text-[#1b1206] sm:inline-flex"
          >
            Get Foundrr
          </a>

          {/* Mobile menu toggle — section links collapse behind this on phones. */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink sm:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown sheet. */}
      {open ? (
        <div className="border-t border-hairline bg-canvas-raised sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {LINKS.map((link) => (
              <NavItem
                key={link.label}
                link={link}
                onClick={() => setOpen(false)}
                className="border-b border-hairline py-3 text-sm text-ink-muted transition-colors last:border-b-0 hover:text-ink"
              />
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="pill-signal mb-1 mt-3 inline-flex items-center justify-center rounded-full bg-signal px-4 py-2 text-sm font-medium text-[#1b1206]"
            >
              Get Foundrr
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
