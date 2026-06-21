/**
 * CRUD over the singleton `license` table (id pinned to 1 via a CHECK). Holds
 * the locally-cached Pro/Team entitlement: the stored key plus the last verify
 * verdict (plan/status/seats/period_end/active) and the timestamp of the last
 * SUCCESSFUL verify (last_verified_at) that drives the offline grace window.
 *
 * Issuance/billing is the landing app's job; this repo never decides validity —
 * it only persists what the verify endpoint last reported so a restart resumes
 * the entitlement and a brief outage doesn't lock a paying user out.
 */
import type Database from "better-sqlite3";

interface LicenseDbRow {
  license_key: string | null;
  plan: string | null;
  status: string | null;
  seats: number;
  period_end: string | null;
  active: number;
  last_verified_at: number;
  last_error: string | null;
}

/** The locally-cached license state. Mirrors the `license` row, camelCased. */
export interface LicenseRow {
  readonly licenseKey: string | null;
  readonly plan: string | null;
  readonly status: string | null;
  readonly seats: number;
  readonly periodEnd: string | null;
  readonly active: boolean;
  readonly lastVerifiedAt: number;
  readonly lastError: string | null;
}

/** A confirmed verify result, persisted as the new cached entitlement. */
export interface VerifyResult {
  readonly plan: string;
  readonly status: string;
  readonly seats: number;
  readonly periodEnd: string | null;
  readonly active: boolean;
}

const EMPTY: LicenseRow = {
  licenseKey: null,
  plan: null,
  status: null,
  seats: 0,
  periodEnd: null,
  active: false,
  lastVerifiedAt: 0,
  lastError: null,
};

/** Read the singleton license row, or an empty (unlicensed) state. */
export function getLicense(db: Database.Database): LicenseRow {
  const row = db
    .prepare(
      "SELECT license_key, plan, status, seats, period_end, active, last_verified_at, last_error FROM license WHERE id = 1",
    )
    .get() as LicenseDbRow | undefined;
  if (!row) {
    return EMPTY;
  }
  return {
    licenseKey: row.license_key,
    plan: row.plan,
    status: row.status,
    seats: row.seats ?? 0,
    periodEnd: row.period_end,
    active: row.active !== 0,
    lastVerifiedAt: row.last_verified_at ?? 0,
    lastError: row.last_error,
  };
}

/**
 * Store a new key and RESET the cached verdict (it hasn't been verified yet).
 * The caller verifies immediately afterward, which fills the verdict back in.
 */
export function setLicenseKey(db: Database.Database, key: string): void {
  db.prepare(
    `INSERT INTO license (id, license_key, plan, status, seats, period_end, active, last_verified_at, last_error)
     VALUES (1, @key, NULL, NULL, 0, NULL, 0, 0, NULL)
     ON CONFLICT(id) DO UPDATE SET
       license_key = excluded.license_key,
       plan = NULL, status = NULL, seats = 0, period_end = NULL,
       active = 0, last_verified_at = 0, last_error = NULL`,
  ).run({ key });
}

/** Remove the license entirely — the install reverts to the free baseline. */
export function clearLicense(db: Database.Database): void {
  db.prepare("DELETE FROM license WHERE id = 1").run();
}

/**
 * Persist a confirmed verify verdict and advance the grace anchor. Stamps
 * last_verified_at with `now` and clears any prior error. The key itself is
 * preserved (a verify never changes it).
 */
export function recordVerification(
  db: Database.Database,
  result: VerifyResult,
  now: number,
): void {
  db.prepare(
    `UPDATE license SET
       plan = @plan,
       status = @status,
       seats = @seats,
       period_end = @periodEnd,
       active = @active,
       last_verified_at = @now,
       last_error = NULL
     WHERE id = 1`,
  ).run({
    plan: result.plan,
    status: result.status,
    seats: result.seats,
    periodEnd: result.periodEnd,
    active: result.active ? 1 : 0,
    now,
  });
}

/**
 * Record a verify FAILURE (network/authority down). Deliberately leaves the
 * cached verdict and last_verified_at untouched so the grace window keeps the
 * paid plan alive; only the human-readable error is stored for the UI.
 */
export function recordVerifyFailure(db: Database.Database, error: string): void {
  db.prepare("UPDATE license SET last_error = @error WHERE id = 1").run({ error });
}
