import { asyncMap, nullThrows } from 'convex-helpers';
import { crud } from 'convex-helpers/server/crud';
import { getManyVia } from 'convex-helpers/server/relationships';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { query, QueryCtx } from './_generated/server';
import { getCompanyIdsByTechVerticals, techVerticalsFilter } from './model/company';
import schema from './schema';

export const { create, read, update, destroy, paginate } = crud(schema, 'companies');

export const list = query({
  args: {
    techVerticals: v.optional(techVerticalsFilter),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args?.limit ?? 100;
    const bareCompanies = args.techVerticals
      ? await getBareCompanies({
          ctx,
          args: {
            companyIds: getCompanyIdsByTechVerticals({ ctx, args: { limit, techVerticals: args.techVerticals } }),
          },
        })
      : await ctx.db.query('companies').take(limit);

    const companies = asyncMap(bareCompanies, async (company) => {
      const techVerticals = (
        await getManyVia(ctx.db, 'companyTechVerticals', 'techVerticalId', 'companyEntityId', company._id)
      ).filter((tv) => tv !== null);

      // Fetch related lookup docs (stage & sector) if present. These are small single fetches; if perf becomes
      // a concern we can batch or denormalize the name fields.
      const stage = company.stageId ? await ctx.db.get(company.stageId) : null;
      const sector = company.sector;

      return { ...company, techVerticals, stage, sector };
    });
    return companies;
  },
});

async function getBareCompanies({
  ctx,
  args,
}: {
  ctx: QueryCtx;
  args: { companyIds: Iterable<Id<'companies'>> | Promise<Iterable<Id<'companies'>>> };
}) {
  const { companyIds } = args;

  return await asyncMap(companyIds, async (companyId) =>
    nullThrows(
      await ctx.db
        .query('companies')
        .withIndex('by_id', (q) => q.eq('_id', companyId))
        .unique(),
    ),
  );
}
