/**
 * HTML rewriting for the path-mounted preview proxy.
 *
 * The dev server is proxied under `/__preview/:port/`, but it emits HTML that
 * assumes it lives at the site root: `<script src="/main.js">`, `href="/app.css"`,
 * Vite's `/@vite/client`, etc. Served verbatim under the prefix those root-
 * absolute URLs resolve against the dashboard origin (`/main.js`) and 404.
 *
 * Two cheap, robust rewrites make the common SPA/Vite case load:
 *   1. Inject `<base href="/__preview/:port/">` into <head> so RELATIVE URLs and
 *      runtime-built URLs (import.meta, fetch('foo')) resolve under the prefix.
 *   2. Rewrite ROOT-ABSOLUTE `src="/…"` / `href="/…"` attributes to
 *      `/__preview/:port/…` (a <base> tag does NOT affect root-absolute URLs, so
 *      these must be rewritten explicitly).
 *
 * This is intentionally a string rewrite, not a full HTML parser — it covers the
 * overwhelmingly common cases without the weight/latency of a DOM. Apps that
 * build absolute URLs in JS from `location.origin` may still need their dev
 * server's own `base` set; that caveat is documented for the user.
 */

/** Build the path prefix a given target port is mounted under (with trailing /). */
export function previewPrefix(port: number): string {
  return `/__preview/${port}/`;
}

/**
 * Rewrite a proxied HTML document so its assets resolve under the preview prefix.
 * Never throws: on any unexpected input it returns the original HTML unchanged.
 */
export function rewriteHtml(html: string, port: number): string {
  try {
    const prefix = previewPrefix(port);
    const withBase = injectBase(html, prefix);
    return rewriteRootAbsoluteUrls(withBase, prefix);
  } catch {
    // A rewrite must never break the page — fall back to the original bytes.
    return html;
  }
}

/**
 * Insert `<base href="<prefix>">` as the FIRST child of <head> (so it precedes
 * any relative asset reference). Idempotent: if a <base> is already present we
 * leave the document alone rather than risk a conflicting double-base. If there
 * is no <head>, we inject one right after <html>, else prepend to the document.
 */
function injectBase(html: string, prefix: string): string {
  if (/<base\b/i.test(html)) {
    return html;
  }
  const baseTag = `<base href="${prefix}">`;

  const headOpen = /<head\b[^>]*>/i.exec(html);
  if (headOpen) {
    const at = headOpen.index + headOpen[0].length;
    return html.slice(0, at) + baseTag + html.slice(at);
  }

  const htmlOpen = /<html\b[^>]*>/i.exec(html);
  if (htmlOpen) {
    const at = htmlOpen.index + htmlOpen[0].length;
    return `${html.slice(0, at)}<head>${baseTag}</head>${html.slice(at)}`;
  }

  return baseTag + html;
}

/**
 * Rewrite root-absolute `src`/`href` attribute values (`"/foo"`, `'/foo'`) to
 * sit under the prefix. Skips protocol-relative (`//cdn…`) and absolute
 * (`/__preview/…` already, or `http://…`) URLs:
 *   - We only match a leading single `/` NOT followed by another `/`.
 *   - We skip values that already start with the prefix (idempotent).
 */
function rewriteRootAbsoluteUrls(html: string, prefix: string): string {
  // Matches: (src|href) = " or ' then a single leading slash (not //) then rest.
  // Group 1: attribute name + `=` + opening quote. Group 2: the path after `/`.
  const attrUrl = /\b(src|href)\s*=\s*(["'])\/(?!\/)/gi;

  return html.replace(attrUrl, (match, _attr, _quote, offset: number) => {
    // If the value already starts with the prefix, leave it (idempotent).
    const after = html.slice(offset + match.length - 1); // includes the leading '/'
    if (after.startsWith(prefix)) {
      return match;
    }
    // match ends with the opening quote + a `/`; splice the prefix in place of
    // that single slash (prefix already begins with `/` and ends with `/`).
    return match.slice(0, -1) + prefix;
  });
}
