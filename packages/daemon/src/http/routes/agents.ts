/**
 * Agents route — what the model picker needs to know before launching a
 * terminal agent:
 *
 *   GET /api/agents → [{ key, name, command, installed, install }]
 *
 * Only the *launchable* models (those with a terminal `command`) are returned;
 * IDE-based agents (Cursor, Copilot, …) are omitted since they can't be booted
 * in a PTY. `installed` is a real PATH check per command, cached briefly so a
 * picker poll never fans out a `which` per request. Token-protected; never
 * throws — a probe failure degrades to `installed:false`.
 */
import { execFile } from "node:child_process";

import { launchableModels } from "@mission-control/shared";
import type { FastifyInstance } from "fastify";

import type { AppContext } from "../context.js";
import { requireToken } from "../auth.js";

/** One launchable agent's availability, as returned by GET /api/agents. */
interface AgentInfo {
  readonly key: string;
  readonly name: string;
  readonly command: string;
  readonly installed: boolean;
  readonly install?: string;
}

/** How long a PATH-detection result stays fresh before we re-probe. */
const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  installed: boolean;
  at: number;
}

const installCache = new Map<string, CacheEntry>();

/**
 * Whether `command` resolves on PATH. Uses `which` (POSIX) / `where` (Windows).
 * Cached for CACHE_TTL_MS. Never throws — any failure resolves to false.
 */
async function isInstalled(command: string): Promise<boolean> {
  const cached = installCache.get(command);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.installed;
  }
  const installed = await probePath(command);
  installCache.set(command, { installed, at: Date.now() });
  return installed;
}

/** One-shot PATH probe via `which`/`where`. Resolves true/false, never throws. */
function probePath(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = process.platform === "win32" ? "where" : "which";
    execFile(probe, [command], (err) => resolve(!err));
  });
}

export function registerAgentsRoute(
  app: FastifyInstance,
  ctx: AppContext,
): void {
  const guard = { preHandler: requireToken(ctx.config.token) };

  app.get("/api/agents", guard, async (req, reply) => {
    try {
      const agents = await Promise.all(
        launchableModels().map(async (m): Promise<AgentInfo> => {
          // launchableModels() guarantees a command; assert for the type.
          const command = m.command as string;
          return {
            key: m.key,
            name: m.name,
            command,
            installed: await isInstalled(command),
            ...(m.install ? { install: m.install } : {}),
          };
        }),
      );
      return reply.send(agents);
    } catch (err) {
      req.log.error({ err }, "api/agents detection failed");
      // Degrade rather than throw: report nothing installed.
      return reply.code(500).send({ error: "failed to detect agents" });
    }
  });
}
