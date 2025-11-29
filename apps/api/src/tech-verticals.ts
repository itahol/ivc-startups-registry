import { Hono } from "hono";
import { QUERIES } from "./queries.js";

const app = new Hono().get("/", async (c) => {
  const techVerticals = await QUERIES.getTechVerticals();
  return c.json(techVerticals);
});

export default app;
