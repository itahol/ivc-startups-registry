import { WithoutSystemFields } from 'convex/server';
import { Doc, Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';
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
