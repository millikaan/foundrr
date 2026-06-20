/**
 * Path-mounted preview HTTP proxy, wired as an early `onRequest` hook on the
 * Fastify app.
 *
 * Why a hook and not a route: Fastify parses the request body BEFORE the route
 * handler / preHandler runs, which would consume the raw stream we need to hand,
 * untouched, to http-proxy. `onRequest` fires before parsing, so we authenticate
 * and hijack there — http-proxy then streams the pristine `req.raw`.
 *
 * AUTH: the same dashboard token gate as the rest of the API (?token= /
 * x-mc-token / Bearer). An unauthenticated preview request is 401'd, so the
 * proxy is never an open relay. WS upgrades for this path are authenticated and
 * proxied separately (preview/upgrade.ts).
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import type { AppContext } from "../http/context.js";
import { extractToken, isValidToken } from "../http/auth.js";
import { parsePreviewUrl } from "./path.js";

const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;

/**
 * Register the preview HTTP proxy hook. Requests under `/__preview/:port/…` are
 * authenticated, then their `/__preview/:port` prefix is stripped and the raw
 * req/res handed to the per-target proxy (which rewrites HTML so assets resolve
 * under the prefix). All other requests fall through untouched.
 */
export function registerPreviewHttp(app: FastifyInstance, ctx: AppContext): void {
  app.addHook("onRequest", (req: FastifyRequest, reply: FastifyReply, done) => {
    const target = parsePreviewUrl(req.url ?? "");
    if (!target) {
      done();
      return;
    }

    // Same token gate as the dashboard — preview is not an open relay.
    if (!isValidToken(extractToken(req), ctx.config.token)) {
      reply.code(HTTP_UNAUTHORIZED).send({ error: "unauthorized" });
      return;
    }

    if (!ctx.previewProxy.isExposed(target.port)) {
      reply.code(HTTP_NOT_FOUND).send({ error: `port :${target.port} is not exposed` });
      return;
    }

    // Detach from Fastify: http-proxy owns the raw socket from here on (no body
    // parsing, no serialization). The prefix is already stripped into `rest`.
    reply.hijack();
    ctx.previewProxy.handleHttp(target.port, target.rest, req.raw, reply.raw);
  });
}
