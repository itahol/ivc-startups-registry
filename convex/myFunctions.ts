import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { createCompany as createCompanyInternal } from './model/company';
import { dealRole, entityType, positionType, sectorValidator } from './schema';

// ===== COMPANIES =====

// Create a company (requires existing entity)
export const createCompany = mutation({
  args: {
    name: v.string(),
    sector: v.optional(sectorValidator),
    websiteUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    yearEstablished: v.optional(v.number()),
    description: v.optional(v.string()),
    stageId: v.optional(v.id('companyStages')),
  },
  returns: v.id('companies'),
  handler: async (ctx, args) => {
    return await createCompanyInternal({ ctx, args: { companyData: args } });
  },
});

// Get company by entity ID
export const getCompanyByEntity = query({
  args: { entityId: v.id('entities') },
  returns: v.union(
    v.object({
      _id: v.id('companies'),
      _creationTime: v.number(),
      entityId: v.id('entities'),
      name: v.string(),
      websiteUrl: v.optional(v.string()),
      linkedinUrl: v.optional(v.string()),
      yearEstablished: v.optional(v.number()),
      description: v.optional(v.string()),
      stageId: v.optional(v.id('companyStages')),
      sector: v.optional(sectorValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('companies')
      .withIndex('by_entity', (q) => q.eq('entityId', args.entityId))
      .unique();
  },
});

// ===== PEOPLE =====

// Create a person (requires existing entity)
export const createPerson = mutation({
  args: {
    entityId: v.id('entities'),
    fullName: v.string(),
    email: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  returns: v.id('people'),
  handler: async (ctx, args) => {
    // Verify the entity exists and is a Person
    const entity = await ctx.db.get(args.entityId);
    if (!entity || entity.entityType !== 'Person') {
      throw new Error('Entity must exist and be of type Person');
    }

    return await ctx.db.insert('people', {
      entityId: args.entityId,
      fullName: args.fullName,
      email: args.email,
      linkedinUrl: args.linkedinUrl,
      bio: args.bio,
    });
  },
});

// ===== DEALS =====

// Create a deal
export const createDeal = mutation({
  args: {
    dealTypeId: v.id('dealTypes'),
    dealDate: v.optional(v.number()),
    amountUsd: v.optional(v.number()),
    valuationUsd: v.optional(v.number()),
    remarks: v.optional(v.string()),
  },
  returns: v.id('deals'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('deals', {
      dealTypeId: args.dealTypeId,
      dealDate: args.dealDate,
      amountUsd: args.amountUsd,
      valuationUsd: args.valuationUsd,
      remarks: args.remarks,
    });
  },
});

// Add participant to deal
export const addDealParticipant = mutation({
  args: {
    dealId: v.id('deals'),
    participantEntityId: v.id('entities'),
    role: dealRole,
    investorAmountUsd: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert('dealParticipants', {
      dealId: args.dealId,
      participantEntityId: args.participantEntityId,
      role: args.role,
      investorAmountUsd: args.investorAmountUsd,
    });
    return null;
  },
});

// Get deal participants
export const getDealParticipants = query({
  args: { dealId: v.id('deals') },
  returns: v.array(
    v.object({
      _id: v.id('dealParticipants'),
      _creationTime: v.number(),
      dealId: v.id('deals'),
      participantEntityId: v.id('entities'),
      role: dealRole,
      investorAmountUsd: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('dealParticipants')
      .withIndex('by_deal', (q) => q.eq('dealId', args.dealId))
      .collect();
  },
});

// ===== POSITIONS =====

// Create a position (person at an organization)
export const createPosition = mutation({
  args: {
    personEntityId: v.id('people'),
    organizationEntityId: v.id('entities'),
    title: v.string(),
    positionType: v.optional(positionType),
    isCurrent: v.boolean(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  returns: v.id('positions'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('positions', {
      personEntityId: args.personEntityId,
      organizationEntityId: args.organizationEntityId,
      title: args.title,
      positionType: args.positionType,
      isCurrent: args.isCurrent,
      startDate: args.startDate,
      endDate: args.endDate,
    });
  },
});

// Get current positions for a person
export const getPersonCurrentPositions = query({
  args: { personEntityId: v.id('people') },
  returns: v.array(
    v.object({
      _id: v.id('positions'),
      _creationTime: v.number(),
      personEntityId: v.id('people'),
      organizationEntityId: v.id('entities'),
      title: v.string(),
      positionType: v.optional(positionType),
      isCurrent: v.boolean(),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('positions')
      .withIndex('by_person_and_current', (q) => q.eq('personEntityId', args.personEntityId).eq('isCurrent', true))
      .collect();
  },
});

// ===== UTILITY FUNCTIONS =====
// Get complete entity information (polymorphic)
export const getCompleteEntity = query({
  args: { entityId: v.id('entities') },
  returns: v.union(
    v.object({
      entity: v.object({
        _id: v.id('entities'),
        _creationTime: v.number(),
        entityType: entityType,
        ivcNumber: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        lastUpdatedAt: v.optional(v.number()),
      }),
      details: v.union(
        v.object({ type: v.literal('Company'), data: v.any() }),
        v.object({ type: v.literal('Person'), data: v.any() }),
        v.object({ type: v.literal('InvestmentFirm'), data: v.any() }),
        v.object({ type: v.literal('ServiceProvider'), data: v.any() }),
        v.object({ type: v.literal('Fund'), data: v.any() }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const entity = await ctx.db.get(args.entityId);
    if (!entity) return null;

    let details = null;
    switch (entity.entityType) {
      case 'Company':
        details = await ctx.db
          .query('companies')
          .withIndex('by_entity', (q) => q.eq('entityId', args.entityId))
          .unique();
        break;
      case 'Person':
        details = await ctx.db
          .query('people')
          .withIndex('by_entity', (q) => q.eq('entityId', args.entityId))
          .unique();
        break;
      case 'InvestmentFirm':
        details = await ctx.db
          .query('investmentFirms')
          .withIndex('by_entity', (q) => q.eq('entityId', args.entityId))
          .unique();
        break;
      case 'ServiceProvider':
        details = await ctx.db
          .query('serviceProviders')
          .withIndex('by_entity', (q) => q.eq('entityId', args.entityId))
          .unique();
        break;
      case 'Fund':
        details = await ctx.db
          .query('funds')
          .withIndex('by_entity', (q) => q.eq('entityId', args.entityId))
          .unique();
        break;
    }

    return {
      entity,
      details: { type: entity.entityType, data: details },
    };
  },
});
