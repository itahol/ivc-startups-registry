import { asyncMap } from 'convex-helpers';
import { literals } from 'convex-helpers/validators';
import { WithoutSystemFields } from 'convex/server';
import { ConvexError, Infer, v } from 'convex/values';
import { Doc, Id } from '../_generated/dataModel';
import { MutationCtx, QueryCtx } from '../_generated/server';
import { createEntity } from '../entity';

export const techVerticalsFilter = v.object({
  ids: v.array(v.id('techVerticals')),
  operator: literals('AND', 'OR'),
});

export async function createCompany({
  ctx,
  args,
}: {
  ctx: MutationCtx;
  args: { companyData: Omit<WithoutSystemFields<Doc<'companies'>>, 'entityId'> };
}): Promise<Id<'companies'>> {
  // Verify the entity exists and is a Company
  const entityId = await createEntity({ args: { entityType: 'Company' }, ctx });
  const companyWithEntity: WithoutSystemFields<Doc<'companies'>> = {
    ...args.companyData,
    entityId,
  };
  return await ctx.db.insert('companies', companyWithEntity);
}

export async function getCompanyIdsByTechVerticals({
  ctx,
  args,
}: {
  ctx: QueryCtx;
  args: { techVerticals: Infer<typeof techVerticalsFilter>; limit: number };
}): Promise<Set<Id<'companies'>>> {
  const { ids: techVerticalsIds, operator } = args.techVerticals;

  console.log('Filtering companies by tech verticals', args.techVerticals);
  if (operator === 'AND') {
    throw new ConvexError("The 'AND' operator is not yet supported for tech verticals filtering");
  }
  const companyIds = (
    await asyncMap(techVerticalsIds, async (techVerticalId) =>
      getCompanyIdsByTechVertical({ ctx, args: { techVerticalId, limit: args.limit } }),
    )
  ).flat();
  return new Set(companyIds.slice(0, args.limit));
}

async function getCompanyIdsByTechVertical({
  ctx,
  args,
}: {
  ctx: QueryCtx;
  args: { techVerticalId: Id<'techVerticals'>; limit: number };
}): Promise<Id<'companies'>[]> {
  const { techVerticalId } = args;
  const matchingCompanyTechVerticals = await ctx.db
    .query('companyTechVerticals')
    .withIndex('techVerticalId', (q) => q.eq('techVerticalId', techVerticalId))
    .take(args.limit);
  return matchingCompanyTechVerticals.map((ctv) => ctv.companyEntityId);
}
