import "dotenv/config";
import { Hono } from "hono";
import people from "./people.js";
import companies from "./companies.js";
import techVerticals from "./tech-verticals.js";
import { BASE_PATH } from "./constants.js";
import type { APIApp } from "./types.js";
import { hc } from "hono/client";

export function registerRoutes(app: APIApp) {
  return (
    app
      // .get("/ping", (c) => {
      //   return c.text("pong");
      // })
      .route("/people", people)
      .route("/companies", companies)
      .route("/tech-verticals", techVerticals)
  );
}

// stand alone router type used for api client
export const router = registerRoutes(new Hono().basePath(BASE_PATH));
export type router = typeof router;
