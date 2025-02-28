import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { Unauthorized } from "../common/errors";
import { verify } from "hono/jwt";
import { config } from "../common/config";
import { HonoTypes } from "../common/types";

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
	}
);

export const validateAuthSession: MiddlewareHandler = async (c, next) => {
	const authHeader = c.req.header("Authorization") ?? "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

	if (!token) {
		c.set("userId", null);
		return next();
	}

	try {
		const payload = await verify(token, config.jwt.accessSecret);
		const userId = payload.sub as string;

		if (!userId) {
			c.set("userId", null);
			return next();
		}

		c.set("userId", userId);
	} catch (error) {
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
