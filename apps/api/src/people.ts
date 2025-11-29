import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { QUERIES } from "./queries.js";
import { paginationSchema, contactIdSchema } from "./validation.js";

const app = new Hono()
  .get("/", zValidator("query", paginationSchema), async (c) => {
    const query = c.req.valid("query");
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const people = await QUERIES.getPeople({ offset, maxPageSize: limit });

    return c.json({
      data: people,
      pagination: {
        page,
        limit,
      },
    });
  })
  .get("/:contactId", zValidator("param", contactIdSchema), async (c) => {
    const params = c.req.valid("param");
    const personPromise = QUERIES.getPersonDetails(params);
    const positionsPromise = QUERIES.getPersonPositions(params);
    const [person, positions] = await Promise.all([personPromise, positionsPromise]);

    if (!person) {
      return c.json({ error: "Person not found" }, 404);
    }
    return c.json({
      ...person,
      positions,
    });
  });

export default app;
