import { v } from 'convex/values';
import { query } from './_generated/server';

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit } = args;
    return ctx.db.query('companyStages').take(limit ?? 100);
  },
});
