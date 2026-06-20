/**
 * Server routes (all token-protected):
 *   GET    /api/servers                       — latest detected listeners
 *   POST   /api/servers/scan                  — force a rescan, return list
 *   POST   /api/servers/:pid/stop             — stop any detected process
 *   POST   /api/servers/:port/expose          — mount a path-based preview proxy
 *   DELETE /api/servers/:port/expose          — stop the preview proxy
 *   ALL    /__preview/:port/*                 — reverse-proxy to the dev server
 *   GET    /api/servers/registered            — list registered servers
 *   POST   /api/servers/registered            — register a server
 *   DELETE /api/servers/registered/:id        — delete a registered server
 *   POST   /api/servers/registered/:id/start  — spawn + record pid
 *   POST   /api/servers/registered/:id/stop   — stop the running pid, clear it
 *   POST   /api/servers/registered/:id/restart— stop existing (if any) + spawn
 *
 * Every handler is wrapped: 400 for bad input, 500 otherwise. Never throws out.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import type {
  ApiError,
  DetectedServer,
  RegisterServerBody,
} from "@mission-control/shared";

import { spawnServer, stopProcess } from "../../servers/control.js";
import {
  createRegistered,
  deleteRegistered,
  getRegistered,
  listRegistered,
  setPid,
} from "../../servers/registered-repo.js";
import type { AppContext } from "../context.js";
import { requireToken } from "../auth.js";

function describe(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function badRequest(reply: FastifyReply, message: string): FastifyReply {
  const body: ApiError = { error: message };
  return reply.code(400).send(body);
}

function serverError(reply: FastifyReply, err: unknown): FastifyReply {
  const body: ApiError = { error: describe(err) };
  return reply.code(500).send(body);
}

/** Parse a positive-integer pid from a route param, or null if invalid. */
function parsePid(raw: unknown): number | null {
  const pid = Number.parseInt(String(raw), 10);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

/** Parse a positive-integer port from a route param, or null if invalid. */
function parsePort(raw: unknown): number | null {
  const port = Number.parseInt(String(raw), 10);
  return Number.isInteger(port) && port > 0 ? port : null;
}

/**
 * Return a new DetectedServer[] with `exposed: true` attached to any server
 * whose port has a path-mounted preview proxy. Inputs are not mutated.
 */
function withExposed(
  servers: readonly DetectedServer[],
  proxies: readonly { targetPort: number }[],
): DetectedServer[] {
  if (proxies.length === 0) {
    return [...servers];
  }
  const exposedPorts = new Set(proxies.map((p) => p.targetPort));
  return servers.map((server): DetectedServer =>
    exposedPorts.has(server.port) ? { ...server, exposed: true } : server,
  );
}

/** Validate a RegisterServerBody: name/cwd/command must be non-empty strings. */
function validateRegisterBody(body: unknown): RegisterServerBody | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const name = record["name"];
  const cwd = record["cwd"];
  const command = record["command"];
  if (
    typeof name !== "string" || name.trim().length === 0 ||
    typeof cwd !== "string" || cwd.trim().length === 0 ||
    typeof command !== "string" || command.trim().length === 0
  ) {
    return null;
  }
  return { name: name.trim(), cwd: cwd.trim(), command: command.trim() };
}

/** Is a pid currently running? (kill(pid,0) probe; EPERM still means alive.) */
function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

export function registerServersRoute(
  app: FastifyInstance,
  ctx: AppContext,
): void {
  const guard = { preHandler: requireToken(ctx.config.token) };

  // ── Detected servers ──────────────────────────────────────────────────────

  app.get("/api/servers", guard, async (_req, reply) => {
    try {
      const servers = ctx.serverMonitor.ready
        ? ctx.serverMonitor.getLatest()
        : await ctx.serverMonitor.scanNow();
      return withExposed(servers, ctx.previewProxy.list());
    } catch (err) {
      return serverError(reply, err);
    }
  });

  app.post("/api/servers/scan", guard, async (_req, reply) => {
    try {
      return await ctx.serverMonitor.scanNow();
    } catch (err) {
      return serverError(reply, err);
    }
  });

  app.post(
    "/api/servers/:pid/stop",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const pid = parsePid((req.params as Record<string, unknown>)["pid"]);
        if (pid === null) {
          return badRequest(reply, "pid must be a positive integer");
        }
        await stopProcess(pid);
        return { ok: true };
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );

  // ── Preview reverse-proxy (path-mounted on the MAIN daemon port) ────────────
  //
  // The dev server is reachable at `/__preview/:port/…` on the SAME origin as
  // the dashboard — over the LAN AND through an https tunnel, no separate port.
  // SECURITY: the proxy entry points sit behind the SAME token gate as the rest
  // of the dashboard (this expose route + the /__preview/* route are guarded,
  // and the WS upgrade authenticates the token), so the preview is not an open
  // relay. Every proxy is torn down on daemon shutdown (server.ts → stopAll()).

  app.post(
    "/api/servers/:port/expose",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const port = parsePort((req.params as Record<string, unknown>)["port"]);
        if (port === null) {
          return badRequest(reply, "port must be a positive integer");
        }
        // Pass the server's actual bind address so the proxy connects to the
        // right family (e.g. Vite on IPv6 ::1, not 127.0.0.1).
        const detected = (
          ctx.serverMonitor.ready ? ctx.serverMonitor.getLatest() : []
        ).find((s) => s.port === port);
        const { prefix } = ctx.previewProxy.expose(port, detected?.address);
        return { exposed: true, prefix };
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );

  app.delete(
    "/api/servers/:port/expose",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const port = parsePort((req.params as Record<string, unknown>)["port"]);
        if (port === null) {
          return badRequest(reply, "port must be a positive integer");
        }
        ctx.previewProxy.unexpose(port);
        return { ok: true };
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );

  // The path-mounted preview proxy itself (`/__preview/:port/*`) is wired as an
  // early onRequest hook in preview/http.ts (it must run before body parsing so
  // it can stream the raw request), not as a route here.

  // ── Registered servers ────────────────────────────────────────────────────

  app.get("/api/servers/registered", guard, async (_req, reply) => {
    try {
      return listRegistered(ctx.db);
    } catch (err) {
      return serverError(reply, err);
    }
  });

  app.post(
    "/api/servers/registered",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const body = validateRegisterBody(req.body);
        if (!body) {
          return badRequest(reply, "name, cwd and command are required");
        }
        return createRegistered(ctx.db, body);
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );

  app.delete(
    "/api/servers/registered/:id",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const id = String((req.params as Record<string, unknown>)["id"] ?? "");
        if (id.length === 0) {
          return badRequest(reply, "id is required");
        }
        deleteRegistered(ctx.db, id);
        return { ok: true };
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );

  app.post(
    "/api/servers/registered/:id/start",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const id = String((req.params as Record<string, unknown>)["id"] ?? "");
        const server = getRegistered(ctx.db, id);
        if (!server) {
          return badRequest(reply, "registered server not found");
        }
        const pid = spawnServer(server.cwd, server.command);
        setPid(ctx.db, id, pid);
        return { ok: true, pid };
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );

  app.post(
    "/api/servers/registered/:id/stop",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const id = String((req.params as Record<string, unknown>)["id"] ?? "");
        const server = getRegistered(ctx.db, id);
        if (!server) {
          return badRequest(reply, "registered server not found");
        }
        if (server.pid !== undefined && isAlive(server.pid)) {
          await stopProcess(server.pid);
        }
        setPid(ctx.db, id, null);
        return { ok: true };
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );

  app.post(
    "/api/servers/registered/:id/restart",
    guard,
    async (req: FastifyRequest, reply) => {
      try {
        const id = String((req.params as Record<string, unknown>)["id"] ?? "");
        const server = getRegistered(ctx.db, id);
        if (!server) {
          return badRequest(reply, "registered server not found");
        }
        if (server.pid !== undefined && isAlive(server.pid)) {
          await stopProcess(server.pid);
        }
        const pid = spawnServer(server.cwd, server.command);
        setPid(ctx.db, id, pid);
        return { ok: true, pid };
      } catch (err) {
        return serverError(reply, err);
      }
    },
  );
}
