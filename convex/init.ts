import { WithoutSystemFields } from 'convex/server';
import { v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { internalMutation } from './_generated/server';
import { createCompany } from './model/company';

// Seed data sourced from startups-info.json (subset of fields)
// Because Convex server bundles functions, we inline JSON content at build time via import assertion.
// If the JSON grows large consider streaming or chunking.
// @ts-ignore - JSON import without type declaration
import startupsData from '../scratch/startups-info.json';

// Collect all unique tech vertical strings from data
const techVerticals: string[] = Array.from(
  new Set(
    (startupsData as any[])
      .flatMap((c) => c.techVerticals || c.industries || [])
      .filter((s) => typeof s === 'string' && s.trim().length > 0),
  ),
);

// Map JSON to companies schema shape (excluding entityId). Only use fields defined in schema.
const mockCompanies: Omit<WithoutSystemFields<Doc<'companies'>>, 'entityId'>[] = (startupsData as any[]).map((c) => ({
  name: c.name,
  websiteUrl: c.websiteUrl || undefined,
  linkedinUrl: c.linkedinUrl || undefined,
  yearEstablished: typeof c.founded === 'number' ? c.founded : undefined,
  description: c.description || undefined,
  stageId: undefined,
  sectorId: undefined,
}));

export default internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if companies already exist to make this idempotent
    const existingCompanies = await ctx.db.query('companies').take(1);
    if (existingCompanies.length > 0) {
      console.log('Database already seeded, skipping...');
      return null;
    }

    console.log('Seeding database with mock data...');

    // First, create tech verticals
    const techVerticalIds: Id<'techVerticals'>[] = [];
    for (const vertical of techVerticals) {
      const verticalId = await ctx.db.insert('techVerticals', { name: vertical });
      techVerticalIds.push(verticalId);
    }

    // Create companies with entities
    for (let i = 0; i < mockCompanies.length; i++) {
      const company = mockCompanies[i];

      // Create company
      const companyId = await createCompany({ ctx, args: { companyData: { ...company } } });
      // Assign 1-3 random tech verticals to each company
      const numVerticals = Math.floor(Math.random() * 3) + 1;
      const selectedVerticals = new Set<string>();

      for (let j = 0; j < numVerticals; j++) {
        let verticalId;
        do {
          verticalId = techVerticalIds[Math.floor(Math.random() * techVerticalIds.length)];
        } while (selectedVerticals.has(verticalId));

        selectedVerticals.add(verticalId);

        await ctx.db.insert('companyTechVerticals', {
          companyEntityId: companyId,
          techVerticalId: verticalId,
        });
      }
    }

    console.log(`Successfully seeded ${mockCompanies.length} companies with tech verticals`);
    return null;
  },
});
