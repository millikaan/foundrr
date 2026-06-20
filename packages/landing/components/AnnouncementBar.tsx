import Link from "next/link";

/**
 * Hair-thin light announcement bar. Tiny centered text + a single link, on the
 * off-white canvas with a 1px hairline bottom so there's no dark strip at the
 * very top. Honest capability framing — no invented metrics.
 */
export function AnnouncementBar() {
  return (
    <div className="border-b border-hairline bg-canvas-raised text-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5 py-2 text-center">
        <p className="font-mono text-[0.68rem] tracking-[0.04em] text-ink-muted">
          <span className="text-ink">New</span>
          <span className="mx-2 text-ink-faint">—</span>
          supervise your AI coding agents from your phone.{" "}
          <Link
            href="/setup"
            className="font-medium text-ink underline-offset-4 transition-colors hover:underline"
          >
            Get started →
          </Link>
        </p>
      </div>
    </div>
  );
}
