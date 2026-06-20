import Link from "next/link";

/**
 * Hair-thin dark announcement bar. Tiny centered text + a single link.
 * Honest capability framing — no invented metrics.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-void text-text">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-5 py-2 text-center">
        <p className="font-mono text-[0.68rem] tracking-[0.04em] text-muted">
          <span className="text-text">New</span>
          <span className="mx-2 text-faint">—</span>
          supervise your AI coding agents from your phone.{" "}
          <Link
            href="/setup"
            className="text-signal underline-offset-4 transition-colors hover:underline"
          >
            Get started →
          </Link>
        </p>
      </div>
    </div>
  );
}
