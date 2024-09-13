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
import { TaskController } from "./server/api/controllers/task.controller";
import { ProjectController } from "./server/api/controllers/project.controller";
import { db } from "./server/api/infrastructure/database";
import { usersTable } from "./tables";

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
app.use(validateAuthSession);

/* --------------------------------- Routes --------------------------------- */
const authRoutes = container.resolve(AuthController).routes();
const userRoutes = container.resolve(UserController).routes();
const taskRoutes = container.resolve(TaskController).routes();
const projectRoutes = container.resolve(ProjectController).routes();

app
  .route("/auth", authRoutes)
  .route("/users", userRoutes)
  .route("/tasks", taskRoutes)
  .route("/projects", projectRoutes);

app.get("/", async (c) => {
  log.info("app logged 💥");
  const users = await db.select().from(usersTable);
  return c.json(users);
  //return c.text("--------- app is fine, no worries 🐳 --------- ");
});

Bun.serve({
  fetch: app.fetch,
  port: 9000,
});

log.info("Bun is running 🐳");

/* -------------------------------------------------------------------------- *
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */
export { app };
