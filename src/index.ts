import "reflect-metadata";
import { Hono } from "hono";
import { container } from "tsyringe";
import { cors } from "hono/cors";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { validateAuthSession } from "./middleware/auth.middleware";
import "reflect-metadata";
import { TaskController } from "./controllers/task.controller";
import { ProjectController } from "./controllers/project.controller";
import { StatsController } from "./controllers/stats.controller";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "./common/config";
import { sentry } from "@hono/sentry";
/* ----------------------------------- Api ---------------------------------- */

const app = new Hono().basePath("/api");

/* --------------------------- Global Middlewares --------------------------- */

app.use("*", cors({ origin: "*" })); // Allow CORS for all origins
app.use(validateAuthSession);
app.use(
  sentry({
    dsn: config.sentry.dsn,
  }),
);

/* --------------------------------- Routes --------------------------------- */

const authRoutes = container.resolve(AuthController).routes();
const userRoutes = container.resolve(UserController).routes();
const taskRoutes = container.resolve(TaskController).routes();
const projectRoutes = container.resolve(ProjectController).routes();
const statsRoutes = container.resolve(StatsController).routes();

app
  .route("/auth", authRoutes)
  .route("/users", userRoutes)
  .route("/tasks", taskRoutes)
  .route("/projects", projectRoutes)
  .route("/stats", statsRoutes);

// Serve the 404 page for any unmatched routes
app.notFound((context) => {
  const htmlPath = join(__dirname, "/ui/404.html");
  const htmlContent = readFileSync(htmlPath, "utf-8");
  return context.html(htmlContent);
});

app.get("/", (c) => {
  return c.text("--------- app is fine, no worries 🐳 --------- ");
});

Bun.serve({
  fetch: app.fetch,
  port: config.api.port,
});
/* -----------------------------------Exports--------------------------------------- */
export { app };
