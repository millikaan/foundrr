/**
 * SharedApprovalPoller — bridges a remote shared-bot approval back into the
 * LOCAL approval store, so the hook (which only ever polls the LOCAL id) and the
 * dashboard are both resolved by a Telegram tap on the shared bot.
 *
 * Flow (driven from /approvals/evaluate in shared mode):
 *   1. The route mints a LOCAL approval (approvalStore.create) AND calls
 *      sharedBot.approve(...) to push the Telegram message, getting a REMOTE id.
 *   2. It calls track(localId, remoteId) here.
 *   3. We setInterval (~2s) and poll the relay for the remote decision. When the
 *      relay returns allowed/denied we resolve the LOCAL approval with that
 *      decision (decidedBy "telegram"), which broadcasts to the dashboard and
 *      flips the state the hook is polling.
 *   4. On allowed/denied/expired, or when the poll budget elapses, we stop the
 *      timer and forget the mapping. On budget exhaustion we do NOT resolve —
 *      the local approval's own TTL expires it (clean defer to the local prompt).
 *
 * RESILIENCE: poll() swallows its own errors (returns "pending"), and every
 * resolve is best-effort, so a relay hiccup just means another tick or a defer.
 * stopAll() clears every timer (called on daemon close()).
 */
import {
  SHARED_BOT_POLL_BUDGET_MS,
  SHARED_BOT_POLL_INTERVAL_MS,
} from "../constants.js";
import type { ApprovalStore } from "./store.js";
import type { SharedApprovalState, SharedBot } from "../telegram/shared-bot.js";

interface ActivePoll {
  readonly remoteId: string;
  readonly timer: ReturnType<typeof setInterval>;
  readonly deadline: number;
}

export class SharedApprovalPoller {
  /** localApprovalId → its active poll. */
  private readonly polls = new Map<string, ActivePoll>();

  constructor(
    private readonly sharedBot: SharedBot,
    private readonly approvalStore: ApprovalStore,
  ) {}

  /**
   * Start polling the relay for `remoteId` and resolve `localId` when it
   * decides. Idempotent per localId: a second track() for an already-tracked
   * local id is ignored. Never throws.
   */
  track(localId: string, remoteId: string, now: number = Date.now()): void {
    if (this.polls.has(localId)) {
      return;
    }
    const deadline = now + SHARED_BOT_POLL_BUDGET_MS;
    const timer = setInterval(() => {
      void this.tick(localId);
    }, SHARED_BOT_POLL_INTERVAL_MS);
    timer.unref?.();
    this.polls.set(localId, { remoteId, timer, deadline });
  }

  /** One poll tick for a tracked local id. Never throws. */
  private async tick(localId: string, now: number = Date.now()): Promise<void> {
    const active = this.polls.get(localId);
    if (!active) {
      return;
    }

    // Budget exhausted: stop and let the local TTL expire the request (defer).
    if (now >= active.deadline) {
      this.stop(localId);
      return;
    }

    let state: SharedApprovalState;
    try {
      state = await this.sharedBot.poll(active.remoteId);
    } catch {
      return; // try again next tick.
    }

    // The local request may have been resolved meanwhile (dashboard / expiry).
    const local = this.approvalStore.get(localId);
    if (!local || local.state !== "pending") {
      this.stop(localId);
      return;
    }

    if (state === "allowed" || state === "denied") {
      const decision = state === "allowed" ? "allow" : "deny";
      try {
        this.approvalStore.resolve(
          localId,
          decision,
          "telegram",
          state === "allowed" ? "Approved via Telegram" : "Denied via Telegram",
        );
      } catch {
        // best effort — a failed resolve just means another tick will retry.
        return;
      }
      this.stop(localId);
      return;
    }

    if (state === "expired") {
      // The relay gave up on its side; stop and defer to the local TTL.
      this.stop(localId);
    }
    // "pending" → keep polling.
  }

  /** Stop and forget a single poll. Safe if unknown. */
  private stop(localId: string): void {
    const active = this.polls.get(localId);
    if (!active) {
      return;
    }
    clearInterval(active.timer);
    this.polls.delete(localId);
  }

  /** Stop every active poll. Called on daemon close(). */
  stopAll(): void {
    for (const { timer } of this.polls.values()) {
      clearInterval(timer);
    }
    this.polls.clear();
  }
}
