/**
 * Cost routes — export the persisted daily spend ledger.
 *
 *   GET /api/cost/export.csv → text/csv of every cost_daily row (token-gated).
 *
 * The live cost meter is a WS broadcast; this is the durable history users can
 * pull out for their own records. Rows are sorted oldest→newest by parsed date
 * (the `day` column is a non-sortable Date.toDateString() label).
 */
import type { FastifyInstance } from "fastify";

import type { AppContext } from "../context.js";
import { requireToken } from "../auth.js";

interface CostRow {
  day: string;
  usd: number;
  tokens: number;
}

/** RFC-4180-ish escape: quote fields containing a comma, quote, or newline. */
function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function registerCostRoutes(app: FastifyInstance, ctx: AppContext): void {
  const guard = { preHandler: requireToken(ctx.config.token) };

  app.get("/api/cost/export.csv", guard, async (req, reply) => {
    try {
      const rows = ctx.db
        .prepare("SELECT day, usd, tokens FROM cost_daily")
        .all() as CostRow[];
      rows.sort((a, b) => Date.parse(a.day) - Date.parse(b.day));

      const lines = ["day,usd,tokens"];
      for (const r of rows) {
        lines.push(`${csvField(r.day)},${r.usd},${r.tokens}`);
      }
      const csv = `${lines.join("\n")}\n`;

      return reply
        .header("content-type", "text/csv; charset=utf-8")
        .header("content-disposition", 'attachment; filename="foundrr-cost.csv"')
        .send(csv);
    } catch (err) {
      req.log.error({ err }, "cost export failed");
      return reply.code(500).send({ error: "internal error" });
    }
  });
}
