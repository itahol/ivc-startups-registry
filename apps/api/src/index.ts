import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { QUERIES } from "./queries.js";
import {
  paginationSchema,
  companiesQuerySchema,
  contactIdSchema,
  companyIdSchema,
} from "./validation.js";

const app = new Hono();

app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/v1/people", zValidator("query", paginationSchema), async (c) => {
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
});

app.get("/api/v1/people/:contactId", zValidator("param", contactIdSchema), async (c) => {
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

app.get("/api/v1/companies", zValidator("query", companiesQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const { page, limit, keyword, sectors, stages, minYear, maxYear } = query;
  const offset = (page - 1) * limit;

  const options = {
    offset,
    maxPageSize: limit,
    keyword,
    sectors,
    stages,
    yearEstablished: {
      min: minYear,
      max: maxYear,
    },
  };

  const companies = await QUERIES.getCompanies(options);

  return c.json({
    data: companies,
    pagination: {
      page,
      limit,
    },
  });
});

app.get("/api/v1/companies/:companyId", zValidator("param", companyIdSchema), async (c) => {
  const params = c.req.valid("param");

  const company = await QUERIES.getCompanyDetails(params);

  if (company === undefined) {
    return c.json({ error: "Company not found" }, 404);
  }

  const [management, board, deals, techVerticals, contactInfo] = await Promise.all([
    QUERIES.getCompanyManagement(params),
    QUERIES.getCompanyBoard(params),
    QUERIES.getCompanyDeals(params),
    QUERIES.getCompanyTechVerticals(params),
    QUERIES.getCompanyContactInfo(params),
  ]);

  return c.json({
    ...company,
    management,
    board,
    deals,
    techVerticals,
    contactInfo,
  });
});

app.get("/api/v1/tech-verticals", async (c) => {
  const techVerticals = await QUERIES.getTechVerticals();
  return c.json(techVerticals);
});

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.API_PORT) || 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
