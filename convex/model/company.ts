import { WithoutSystemFields } from 'convex/server';
import { Doc, Id } from '../_generated/dataModel';
import { MutationCtx, QueryCtx } from '../_generated/server';
import { createEntity } from '../entity';

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

export async function getCompaniesByTechVertical({
  ctx,
  args,
}: {
  ctx: QueryCtx;
  args: { techVerticalId: Id<'techVerticals'>; limit: number };
}) {
  const { techVerticalId } = args;
  const matchingCompanyTechVerticals = await ctx.db
    .query('companyTechVerticals')
    .withIndex('techVerticalId', (q) => q.eq('techVerticalId', techVerticalId))
    .take(args.limit);
  return matchingCompanyTechVerticals.map((ctv) => ctv.companyEntityId);
}
