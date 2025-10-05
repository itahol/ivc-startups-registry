import { asyncMap } from 'convex-helpers';
import { crud } from 'convex-helpers/server/crud';
import { getManyVia } from 'convex-helpers/server/relationships';
import { v } from 'convex/values';
import { query } from './_generated/server';
import schema from './schema';

export const { create, read, update, destroy, paginate } = crud(schema, 'companies');

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const bareCompanies = await ctx.db.query('companies').take(args.limit ?? 100);
    const companies = asyncMap(bareCompanies, async (company) => {
      const techVerticals = (
        await getManyVia(ctx.db, 'companyTechVerticals', 'techVerticalId', 'companyEntityId', company._id)
      ).filter((tv) => tv !== null);
      return { ...company, techVerticals };
    });
    return companies;
  },
});
