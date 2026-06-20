/**
 * Path helpers for the `/__preview/:port/<rest>` mount point. Shared by the HTTP
 * route (servers.ts) and the WS upgrade handler (app.ts) so both parse the URL
 * the same way.
 */

/** The mount prefix; a request under it targets an exposed preview port. */
export const PREVIEW_MOUNT = "/__preview/";

/** Parsed preview URL: the target port and the upstream-relative rest path. */
export interface PreviewTarget {
  /** The dev-server port to proxy to. */
  port: number;
  /** Upstream path (always starts with `/`), query string preserved. */
  rest: string;
}

/**
 * Parse a `/__preview/:port/<rest>?<query>` URL into its target port and the
 * upstream-relative path (prefix stripped, query preserved). Returns null when
 * the URL is not a preview path or the port segment isn't a positive integer.
 */
export function parsePreviewUrl(rawUrl: string): PreviewTarget | null {
  if (!rawUrl.startsWith(PREVIEW_MOUNT)) {
    return null;
  }
  // Split off the query so the port segment is clean; re-append it to `rest`.
  const queryAt = rawUrl.indexOf("?");
  const pathOnly = queryAt === -1 ? rawUrl : rawUrl.slice(0, queryAt);
  const query = queryAt === -1 ? "" : rawUrl.slice(queryAt);

  const afterMount = pathOnly.slice(PREVIEW_MOUNT.length); // "<port>/<rest...>"
  const slashAt = afterMount.indexOf("/");
  const portSegment = slashAt === -1 ? afterMount : afterMount.slice(0, slashAt);

  const port = Number.parseInt(portSegment, 10);
  if (!Number.isInteger(port) || port <= 0 || String(port) !== portSegment) {
    return null;
  }

  // Everything after "<port>" is the upstream path; default to "/".
  const restPath = slashAt === -1 ? "/" : afterMount.slice(slashAt);
  const rest = (restPath.length === 0 ? "/" : restPath) + query;
  return { port, rest };
}
