import { asyncMap, nullThrows } from 'convex-helpers';
import { crud } from 'convex-helpers/server/crud';
import { getManyVia } from 'convex-helpers/server/relationships';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { query, QueryCtx } from './_generated/server';
import { getCompanyIdsByTechVerticals, techVerticalsFilter } from './model/company';
import schema, { companyStageValidator, sectorValidator } from './schema';

export const { create, read, update, destroy, paginate } = crud(schema, 'companies');

export const list = query({
  args: {
    techVerticals: v.optional(techVerticalsFilter),
    sectors: v.optional(v.array(sectorValidator)),
    stages: v.optional(v.array(companyStageValidator)),
    yearEstablished: v.optional(
      v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
      }),
    ),
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

    // Ensure no duplicate companies (defensive: OR path could previously duplicate IDs)
    const seen = new Set<string>();
    const deduped = bareCompanies.filter((c) => {
      const key = c._id as unknown as string;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    let companies = await asyncMap(deduped, async (company) => {
      const techVerticals = (
        await getManyVia(ctx.db, 'companyTechVerticals', 'techVerticalId', 'companyEntityId', company._id)
      ).filter((tv) => tv !== null);

      // Fetch related lookup docs (stage & sector) if present. These are small single fetches; if perf becomes
      // a concern we can batch or denormalize the name fields.
      const stage = company.stage;
      const sector = company.sector;

      return { ...company, techVerticals, stage, sector };
    });
    // In-memory filtering for sectors, stages, yearEstablished (optimize later with indexes)
    if (args.sectors && args.sectors.length) {
      companies = companies.filter((c) => c.sector && args.sectors!.includes(c.sector));
    }
    if (args.stages && args.stages.length) {
      companies = companies.filter((c) => c.stage && args.stages!.includes(c.stage));
    }
    if (args.yearEstablished) {
      const { min, max } = args.yearEstablished;
      companies = companies.filter((c) => {
        if (c.yearEstablished === undefined) return false;
        if (min !== undefined && c.yearEstablished < min) return false;
        if (max !== undefined && c.yearEstablished > max) return false;
        return true;
      });
    }

    return companies.slice(0, limit);
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
