/**
 * SharedBot — client for the Founder shared Telegram bot cloud relay (tg-api).
 *
 * One bot (@<bot_username>) serves many installs; the anonymous install id is
 * this install's identity to the relay. The relay is a Supabase edge function
 * reached at `${base}/functions/v1/tg-api`, where the base + publishable key are
 * the SAME constants the telemetry reporter uses (TELEMETRY_DEFAULT_URL /
 * TELEMETRY_DEFAULT_KEY), overridable via MC_SHARE_URL / MC_SHARE_KEY.
 *
 * RESILIENCE (critical): a relay failure must NEVER break the daemon. Every call
 * has a short AbortController timeout and swallows ALL errors:
 *   - link()     → undefined on failure.
 *   - isLinked() → false on failure (cached ~30s on success).
 *   - approve()  → { gated: false } on failure, so the gate fails OPEN to the
 *                  local permission prompt (the at-keyboard path still works).
 *   - poll()     → "pending" on failure, so the poller simply tries again.
 *   - notify()   → false on failure.
 *
 * Relay actions (all POST JSON, all return JSON):
 *   {action:"link",   install_id}                    → { link_code, bot_username }
 *   {action:"status", install_id}                    → { linked: boolean }
 *   {action:"approve",install_id, tool, summary, detail} → { gated, requestId? }
 *   {action:"poll",   request_id}                    → { state }
 *   {action:"notify", install_id, text}              → { ok: true }
 */
import {
  SHARED_BOT_API_PATH,
  SHARED_BOT_LINK_CACHE_MS,
  SHARED_BOT_REQUEST_TIMEOUT_MS,
  TELEMETRY_DEFAULT_KEY,
  TELEMETRY_DEFAULT_URL,
} from "../constants.js";

/** Remote-decision states the relay can report for a polled request. */
export type SharedApprovalState = "pending" | "allowed" | "denied" | "expired";

/** Result of link(): the code to send the bot, plus which bot to message. */
export interface SharedLinkResult {
  readonly linkCode: string;
  readonly botUsername: string;
}

/** Result of approve(): whether the relay gated, and (if so) the remote id. */
export interface SharedApproveResult {
  readonly gated: boolean;
  readonly requestId?: string;
}

/** What approve() pushes to the relay (the human-readable approval payload). */
export interface SharedApproveInput {
  readonly tool: string;
  readonly summary: string;
  readonly detail: string;
}

/** Optional config overrides (env wins if both unset). */
export interface SharedBotConfig {
  /** Supabase base URL. Defaults to env MC_SHARE_URL → TELEMETRY_DEFAULT_URL. */
  readonly url?: string;
  /** Publishable key. Defaults to env MC_SHARE_KEY → TELEMETRY_DEFAULT_KEY. */
  readonly key?: string;
}

/** Resolve the relay base URL (explicit → env → default). */
function resolveBase(explicit: string | undefined): string {
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }
  const fromEnv = process.env["MC_SHARE_URL"];
  return fromEnv && fromEnv.trim().length > 0
    ? fromEnv.trim()
    : TELEMETRY_DEFAULT_URL;
}

/** Resolve the relay publishable key (explicit → env → default). */
function resolveKey(explicit: string | undefined): string {
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }
  const fromEnv = process.env["MC_SHARE_KEY"];
  return fromEnv && fromEnv.trim().length > 0
    ? fromEnv.trim()
    : TELEMETRY_DEFAULT_KEY;
}

/** Coerce an unknown to a non-empty trimmed string, else undefined. */
function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

export class SharedBot {
  private readonly endpoint: string;
  private readonly key: string;

  /** Cached isLinked() result + the wall-clock time it expires. */
  private linkedCache: { value: boolean; expiresAt: number } | undefined;

  constructor(
    private readonly installId: string,
    config: SharedBotConfig = {},
  ) {
    this.endpoint = `${resolveBase(config.url)}${SHARED_BOT_API_PATH}`;
    this.key = resolveKey(config.key);
  }

  /**
   * Request a fresh link code from the relay. Returns the code + bot username to
   * show the user, or undefined if the relay is unreachable / malformed.
   */
  async link(): Promise<SharedLinkResult | undefined> {
    const body = await this.post({ action: "link", install_id: this.installId });
    if (!body) {
      return undefined;
    }
    const linkCode = str(body["link_code"]);
    const botUsername = str(body["bot_username"]);
    if (!linkCode || !botUsername) {
      return undefined;
    }
    return { linkCode, botUsername };
  }

  /**
   * Whether this install is linked to a Telegram chat through the relay. Cached
   * ~30s so the hot approval path doesn't hammer the network. Returns false (and
   * does NOT cache) on any failure, so a transient blip never falsely caches
   * "linked" — and on the hot path a missed gate just defers to the local prompt.
   */
  async isLinked(now: number = Date.now()): Promise<boolean> {
    if (this.linkedCache && now < this.linkedCache.expiresAt) {
      return this.linkedCache.value;
    }
    const body = await this.post({
      action: "status",
      install_id: this.installId,
    });
    if (!body) {
      return false;
    }
    const value = body["linked"] === true;
    this.linkedCache = { value, expiresAt: now + SHARED_BOT_LINK_CACHE_MS };
    return value;
  }

  /**
   * Push an approval request to the relay (which messages the linked chat).
   * Returns the relay's gate decision + remote request id. On ANY failure
   * returns { gated: false } so the caller fails OPEN to the local prompt.
   */
  async approve(input: SharedApproveInput): Promise<SharedApproveResult> {
    const body = await this.post({
      action: "approve",
      install_id: this.installId,
      tool: input.tool,
      summary: input.summary,
      detail: input.detail,
    });
    if (!body || body["gated"] !== true) {
      return { gated: false };
    }
    const requestId = str(body["requestId"]);
    return requestId ? { gated: true, requestId } : { gated: false };
  }

  /**
   * Poll the relay for a remote request's decision. Returns "pending" on any
   * failure so the caller's poll loop simply retries on its next tick.
   */
  async poll(requestId: string): Promise<SharedApprovalState> {
    const body = await this.post({ action: "poll", request_id: requestId });
    const state = body ? str(body["state"]) : undefined;
    if (
      state === "allowed" ||
      state === "denied" ||
      state === "expired" ||
      state === "pending"
    ) {
      return state;
    }
    return "pending";
  }

  /**
   * Send a one-line notification to the linked chat via the relay. Returns true
   * on success; swallows all errors (returns false).
   */
  async notify(text: string): Promise<boolean> {
    const body = await this.post({
      action: "notify",
      install_id: this.installId,
      text,
    });
    return body?.["ok"] === true;
  }

  /**
   * POST a JSON action to the relay with a short timeout. Returns the parsed
   * JSON object on a 2xx response, else undefined. NEVER throws.
   */
  private async post(
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown> | undefined> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      SHARED_BOT_REQUEST_TIMEOUT_MS,
    );
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          apikey: this.key,
          Authorization: `Bearer ${this.key}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) {
        return undefined;
      }
      const json: unknown = await res.json();
      return typeof json === "object" && json !== null
        ? (json as Record<string, unknown>)
        : undefined;
    } catch {
      // The relay must never affect the daemon.
      return undefined;
    } finally {
      clearTimeout(timeout);
    }
  }
}
