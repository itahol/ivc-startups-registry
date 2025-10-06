import { asyncMap, nullThrows } from 'convex-helpers';
import { crud } from 'convex-helpers/server/crud';
import { getManyVia } from 'convex-helpers/server/relationships';
import { Infer, v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { query, QueryCtx } from './_generated/server';
import schema from './schema';

export const { create, read, update, destroy, paginate } = crud(schema, 'companies');

const techVerticalsFilter = v.object({
  ids: v.array(v.id('techVerticals')),
  operator: v.union(v.literal('AND'), v.literal('OR')),
});

async function getCompanyIdsForTechVerticals({
  ctx,
  args,
}: {
  ctx: QueryCtx;
  args: { techVerticals: Infer<typeof techVerticalsFilter>; limit: number };
}): Promise<Set<Id<'companies'>>> {
  console.log('Filtering companies by tech verticals', args.techVerticals);
  const companyIds = (
    await asyncMap(args.techVerticals.ids, async (techVerticalId) => {
      const matchingCompanyTechVerticals = await ctx.db
        .query('companyTechVerticals')
        .withIndex('techVerticalId', (q) => q.eq('techVerticalId', techVerticalId))
        .take(args.limit);
      return matchingCompanyTechVerticals.map((ctv) => ctv.companyEntityId);
    })
  ).flat();
  return new Set(companyIds.slice(0, args.limit));
}

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
            companyIds: getCompanyIdsForTechVerticals({ ctx, args: { limit, techVerticals: args.techVerticals } }),
          },
        })
      : await ctx.db.query('companies').take(limit);

    const companies = asyncMap(bareCompanies, async (company) => {
      const techVerticals = (
        await getManyVia(ctx.db, 'companyTechVerticals', 'techVerticalId', 'companyEntityId', company._id)
      ).filter((tv) => tv !== null);
      return { ...company, techVerticals };
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
