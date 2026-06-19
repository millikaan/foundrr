/**
 * Config routes — local, non-secret daemon preferences the dashboard reads and
 * writes. Backs the in-header "pick your AI model" picker.
 *
 *   GET  /api/config        → { model: string, telemetryShare: boolean }
 *   POST /api/config/model  → body { model } → { ok: true, model }
 *
 * Token-protected. The model key is validated against the shared MODELS
 * registry (the single source of truth shared with the CLI + leaderboard); an
 * unknown key returns 400 with the full list of valid keys so the fix is
 * obvious. Handlers are wrapped so a db error degrades to a 500 with a plain
 * message rather than throwing out of the route.
 */
import type { FastifyInstance } from "fastify";

import { MODELS, modelByKey } from "@mission-control/shared";

import { getSettings, setModel } from "../../db/settings-repo.js";
import type { AppContext } from "../context.js";
import { requireToken } from "../auth.js";

/** The stable keys the picker may choose from (the leaderboard buckets). */
function validKeys(): string[] {
  return MODELS.map((m) => m.key);
}

export function registerConfigRoutes(
  app: FastifyInstance,
  ctx: AppContext,
): void {
  const guard = { preHandler: requireToken(ctx.config.token) };

  app.get("/api/config", guard, async (req, reply) => {
    try {
      const { model, telemetryShare } = getSettings(ctx.db);
      return reply.send({ model, telemetryShare });
    } catch (err) {
      req.log.error({ err }, "api/config read failed");
      return reply.code(500).send({ error: "failed to read config" });
    }
  });

  app.post("/api/config/model", guard, async (req, reply) => {
    try {
      const body = req.body as { model?: unknown } | undefined;
      const model = body?.model;
      if (typeof model !== "string" || !modelByKey(model)) {
        return reply.code(400).send({
          error: "invalid model key",
          validKeys: validKeys(),
        });
      }
      setModel(ctx.db, model);
      return reply.send({ ok: true, model });
    } catch (err) {
      req.log.error({ err }, "api/config/model write failed");
      return reply.code(500).send({ error: "failed to set model" });
    }
  });
}
