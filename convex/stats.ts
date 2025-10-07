import { query } from './_generated/server';

// NOTE: These naive count queries iterate through full collections.
// For large datasets consider maintaining a denormalized counter.

export const companiesCount = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query('companies').collect()).length,
});

export const investmentFirmsCount = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query('investmentFirms').collect()).length,
});

export const peopleCount = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query('people').collect()).length,
});

export const fundsCount = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query('funds').collect()).length,
});
