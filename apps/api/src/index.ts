import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { BASE_PATH } from "./constants.js";
import { errorHandler } from "./middleware.js";
import { registerRoutes } from "./routes.js";

const app = registerRoutes(new Hono().basePath(BASE_PATH)).onError(errorHandler);

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.API_PORT) || 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
