import "reflect-metadata";
import { Hono } from "hono";
import { hc } from "hono/client";
import { container } from "tsyringe";
import { cors } from "hono/cors";
import log from "./utils/logger";
import { AuthController } from "./server/api/controllers/auth.controller";
import { UserController } from "./server/api/controllers/user.controller";
import {
  validateAuthSession,
  verifyOrigin,
} from "./server/api/middleware/auth.middleware";
import "reflect-metadata";

/* -------------------------------------------------------------------------- */
/*                               Client Request                               */
/* ------------------------------------ ▲ ----------------------------------- */
/* ------------------------------------ | ----------------------------------- */
/* ------------------------------------ ▼ ----------------------------------- */
/*                                 Controller                                 */
/* ---------------------------- (Request Routing) --------------------------- */
/* ------------------------------------ ▲ ----------------------------------- */
/* ------------------------------------ | ----------------------------------- */
/* ------------------------------------ ▼ ----------------------------------- */
/*                                   Service                                  */
/* ---------------------------- (Business logic) ---------------------------- */
/* ------------------------------------ ▲ ----------------------------------- */
/* ------------------------------------ | ----------------------------------- */
/* ------------------------------------ ▼ ----------------------------------- */
/*                                 Repository                                 */
/* ----------------------------- (Data storage) ----------------------------- */
/* -------------------------------------------------------------------------- */

/* ----------------------------------- Api ---------------------------------- */
const app = new Hono().basePath("/api");

/* --------------------------- Global Middlewares --------------------------- */

app.use("*", cors({ origin: "*" })); // Allow CORS for all origins
app.use(verifyOrigin).use(validateAuthSession);

/* --------------------------------- Routes --------------------------------- */
const authRoutes = container.resolve(AuthController).routes();
const userRoutes = container.resolve(UserController).routes();

app.route("/auth", authRoutes).route("/users", userRoutes);

app.get("/", (c) => {
  return c.text("--------- app is fine, now worries 🐳 ------------");
});

Bun.serve({
  fetch: app.fetch,
  port: 3000,
});

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */
export { app };
