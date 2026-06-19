/**
 * ErrorBoundary — a containment wall for React render crashes.
 *
 * Without one of these, any thrown error during render unmounts the whole tree
 * and the user is left staring at a black void. This boundary catches the
 * error, logs it to devtools (componentDidCatch), and shows a readable,
 * telemetry-console-styled fallback instead.
 *
 * Two ways it's used in App.tsx:
 *   - Top-level <ErrorBoundary label="Founder"> wraps the entire app, so the
 *     worst case is the user sees the error + a Reload button — never a blank
 *     page.
 *   - <ErrorBoundary label="Terminal"> wraps just the terminal panel, so an
 *     xterm/PTY crash is CONTAINED there and the Agents/Servers panels stay up.
 *
 * When `onReset` is provided, a "Try again" button resets the boundary state so
 * the user can retry the subtree without a full page reload.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Short context label shown in the fallback header, e.g. "Founder" / "Terminal". */
  label?: string;
  /** When provided, renders a "Try again" button that resets boundary state. */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the full error + component stack in devtools so the crash is
    // debuggable even though the UI only shows a friendly summary.
    console.error(
      `[ErrorBoundary${this.props.label ? ` ${this.props.label}` : ""}]`,
      error,
      info.componentStack,
    );
  }

  private handleReset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    const { label, onReset } = this.props;
    const isTerminal = label === "Terminal";

    return (
      <div
        role="alert"
        className="flex h-full min-h-0 w-full items-center justify-center overflow-y-auto p-4"
        style={{ backgroundColor: "var(--color-void)" }}
      >
        <div className="panel w-full max-w-md p-5 text-left">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: "var(--color-alert)" }}
            />
            <h2
              className="mono text-xs font-semibold tracking-[0.16em]"
              style={{ color: "var(--color-text)" }}
            >
              SOMETHING BROKE
            </h2>
          </div>

          {label ? (
            <p className="caption mt-2">{label}</p>
          ) : null}

          <p
            className="mono mt-3 break-words text-sm leading-relaxed"
            style={{ color: "var(--color-alert)" }}
          >
            {error.message || "An unexpected error occurred."}
          </p>

          {isTerminal ? (
            <p
              className="mt-3 text-xs leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Try closing this terminal tab and opening a new one. The rest of
              the dashboard is still running.
            </p>
          ) : null}

          {error.stack ? (
            <details className="mt-3">
              <summary
                className="mono cursor-pointer text-xs"
                style={{ color: "var(--color-faint)" }}
              >
                Stack trace
              </summary>
              <pre
                className="mono mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md p-2 text-[0.6875rem] leading-relaxed"
                style={{
                  backgroundColor: "var(--color-void)",
                  border: "1px solid var(--color-line)",
                  color: "var(--color-muted)",
                }}
              >
                {error.stack}
              </pre>
            </details>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {onReset ? (
              <button
                type="button"
                onClick={this.handleReset}
                className="mono rounded-md px-4 py-2.5 text-xs tracking-wide transition-colors"
                style={{
                  color: "var(--color-text)",
                  backgroundColor: "var(--color-panel)",
                  border: "1px solid var(--color-line)",
                }}
              >
                Try again
              </button>
            ) : null}
            <button
              type="button"
              onClick={this.handleReload}
              className="mono rounded-md px-4 py-2.5 text-xs tracking-wide transition-colors"
              style={{
                color: "var(--color-void)",
                backgroundColor: "var(--color-signal)",
                border: "1px solid var(--color-signal)",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
