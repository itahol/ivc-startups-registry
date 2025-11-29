import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { QUERIES } from "./queries.js";
import { companiesQuerySchema, companyIdSchema } from "./validation.js";

const app = new Hono()
  .get("/", zValidator("query", companiesQuerySchema), async (c) => {
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
  })
  .get("/:companyId", zValidator("param", companyIdSchema), async (c) => {
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

export default app;
