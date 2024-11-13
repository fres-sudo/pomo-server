import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { HonoTypes } from "../types";
import { Unauthorized } from "../common/errors";
import { verify } from "hono/jwt";
import { config } from "../common/config";

export const verifyOrigin: MiddlewareHandler<HonoTypes> = createMiddleware(
  async (c, next) => {
    if (c.req.method === "GET") {
      return next();
    }
    const originHeader = c.req.header("Origin") ?? null;
    const hostHeader = c.req.header("Host") ?? null;
    if (!originHeader || !hostHeader) {
      return c.body(null, 403);
    }
    return next();
  },
);

export const validateAuthSession: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    c.set("userId", null);
    return next();
  }

  try {
    // Verify the access token
    const payload = await verify(token, config.jwt.accessSecret);
    const userId = payload.sub as string;

    if (!userId) {
      c.set("userId", null);
      return next();
    }

    // Set user id in context
    c.set("userId", userId);
  } catch (error) {
    // If token verification fails, set user to null
    c.set("user", null);
  }

  return next();
};

export const requireAuth: MiddlewareHandler<{
  Variables: {
    userId: string;
  };
}> = createMiddleware(async (c, next) => {
  const user = c.var.userId;
  if (!user)
    throw Unauthorized("You must be logged in to access this resource");
  return next();
});
