"use client";

import { useCallback, useState } from "react";

interface CodeBlockProps {
  /** The command (or multi-line snippet) shown and copied verbatim. */
  code: string;
  /** Optional leading prompt glyph rendered before the code (not copied). */
  prompt?: string;
  /** Accessible label for the copy button (defaults to "Copy command"). */
  copyLabel?: string;
}

const RESET_MS = 1800;

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * A dark terminal-style code block with a working copy-to-clipboard button.
 *
 * Layout: the command scrolls horizontally inside its own track (mono, no-wrap,
 * `overflow-x-auto`) so even long commands stay fully readable. The copy button
 * lives in a separate, non-shrinking column to the right — it never overlaps
 * the command text. A right-edge fade hints there's more to scroll into view.
 *
 * Client component (clipboard + transient "Copied" state). Falls back silently
 * if the Clipboard API is unavailable so the page never crashes.
 */
export function CodeBlock({
  code,
  prompt = "$",
  copyLabel = "Copy command",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), RESET_MS);
    } catch {
      // Clipboard blocked (insecure context / permissions). Leave UI as-is —
      // the command is fully visible and selectable, so the user can copy by hand.
    }
  }, [code]);

  return (
    <div className="group/code flex items-stretch overflow-hidden rounded-lg border border-line bg-[color-mix(in_srgb,var(--void-2)_92%,transparent)]">
      {/* Scroll track — owns horizontal overflow so the full command is always
          reachable. min-w-0 lets it shrink instead of pushing the button off. */}
      <div className="relative min-w-0 flex-1">
        <pre className="overflow-x-auto px-4 py-3 [scrollbar-width:thin]">
          <code className="block whitespace-nowrap font-mono text-[0.82rem] sm:text-sm leading-relaxed text-text">
            {prompt ? (
              <span className="select-none text-faint">{prompt} </span>
            ) : null}
            {code}
          </code>
        </pre>
        {/* Right-edge fade: cue that the command scrolls under the copy button. */}
        <span
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[color-mix(in_srgb,var(--void-2)_92%,transparent)] to-transparent"
          aria-hidden
        />
      </div>

      {/* Copy button — fixed column, never shrinks, never covers the command. */}
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : copyLabel}
        className="flex shrink-0 items-center gap-1.5 self-stretch border-l border-line bg-[color-mix(in_srgb,var(--panel)_55%,transparent)] px-3 text-xs font-medium text-muted transition-colors hover:bg-panel hover:text-text"
      >
        {copied ? (
          <span className="flex items-center gap-1.5 text-ok">
            <CheckIcon />
            <span className="hidden sm:inline">Copied</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <CopyIcon />
            <span className="hidden sm:inline">Copy</span>
          </span>
        )}
      </button>
    </div>
  );
}
