import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { errorHandler } from "./middleware.js";
import people from "./people.js";
import companies from "./companies.js";
import techVerticals from "./tech-verticals.js";

const app = new Hono();

app.onError(errorHandler);

app.get("/api/ping", (c) => {
  return c.text("pong");
});

app.route("/api/people", people);
app.route("/api/companies", companies);
app.route("/api/tech-verticals", techVerticals);

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.API_PORT) || 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
