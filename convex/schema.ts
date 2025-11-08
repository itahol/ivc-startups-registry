import { literals } from 'convex-helpers/validators';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { COMPANY_STAGE_VALUES, SECTOR_VALUES } from '../lib/model';

// Enums
export const entityType = v.union(
  v.literal('Company'),
  v.literal('Person'),
  v.literal('InvestmentFirm'),
  v.literal('ServiceProvider'),
  v.literal('Fund'),
);

export const positionType = v.union(v.literal('Management'), v.literal('Board'), v.literal('Employee'));

export const dealRole = v.union(
  v.literal('Acquirer'),
  v.literal('Target'),
  v.literal('Investor'),
  v.literal('Lead Legal Advisor'),
  v.literal('Co-Lead Legal Advisor'),
);

export const companyStageValidator = literals(...COMPANY_STAGE_VALUES);

export const sectorValidator = literals(...SECTOR_VALUES);

// Lookup Tables
export const techVerticals = defineTable({
  name: v.string(),
}).index('by_name', ['name']);

export const companyStages = defineTable({
  name: v.string(),
}).index('by_name', ['name']);

export const dealTypes = defineTable({
  name: v.string(), // 'Acquisition', 'IPO', 'Seed Round', 'Series A'
}).index('by_name', ['name']);

// Core Entities
export const entities = defineTable({
  entityType: entityType,
  ivcNumber: v.optional(v.string()),
  createdAt: v.optional(v.number()),
  lastUpdatedAt: v.optional(v.number()),
}).index('by_ivc_number', ['ivcNumber']);

export const companies = defineTable({
  entityId: v.id('entities'),
  name: v.string(),
  websiteUrl: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  yearEstablished: v.optional(v.number()),
  description: v.optional(v.string()),
  stage: v.optional(companyStageValidator),
  sector: v.optional(sectorValidator),
})
  .index('by_entity', ['entityId'])
  .index('by_name', ['name'])
  .index('by_stage', ['stage'])
  .index('by_sector', ['sector']);

export const companyTechVerticals = defineTable({
  companyEntityId: v.id('companies'),
  techVerticalId: v.id('techVerticals'),
})
  .index('companyEntityId', ['companyEntityId'])
  .index('techVerticalId', ['techVerticalId']);

export const people = defineTable({
  entityId: v.id('entities'),
  fullName: v.string(),
  email: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  bio: v.optional(v.string()),
})
  .index('by_entity', ['entityId'])
  .index('by_email', ['email'])
  .index('by_name', ['fullName']);

export const investmentFirms = defineTable({
  entityId: v.id('entities'),
  name: v.string(),
  websiteUrl: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  description: v.optional(v.string()),
  managedCapitalUsd: v.optional(v.number()),
})
  .index('by_entity', ['entityId'])
  .index('by_name', ['name']);

export const serviceProviders = defineTable({
  entityId: v.id('entities'),
  name: v.string(),
  websiteUrl: v.optional(v.string()),
  linkedinUrl: v.optional(v.string()),
  description: v.optional(v.string()),
  serviceType: v.string(), // 'Law Firm', 'Accounting Firm'
})
  .index('by_entity', ['entityId'])
  .index('by_name', ['name'])
  .index('by_service_type', ['serviceType']);

export const addresses = defineTable({
  entityId: v.id('entities'),
  isMain: v.boolean(),
  addressLine: v.optional(v.string()),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  zipCode: v.optional(v.string()),
})
  .index('by_entity', ['entityId'])
  .index('by_entity_and_main', ['entityId', 'isMain']);

// Relationships & Events
export const positions = defineTable({
  personEntityId: v.id('people'),
  organizationEntityId: v.id('entities'),
  title: v.string(),
  positionType: v.optional(positionType),
  isCurrent: v.boolean(),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
})
  .index('by_person', ['personEntityId'])
  .index('by_organization', ['organizationEntityId'])
  .index('by_person_and_current', ['personEntityId', 'isCurrent'])
  .index('by_organization_and_current', ['organizationEntityId', 'isCurrent']);

export const deals = defineTable({
  dealTypeId: v.id('dealTypes'),
  dealDate: v.optional(v.number()),
  amountUsd: v.optional(v.number()),
  valuationUsd: v.optional(v.number()),
  remarks: v.optional(v.string()),
})
  .index('by_deal_type', ['dealTypeId'])
  .index('by_date', ['dealDate'])
  .index('by_amount', ['amountUsd']);

// Links entities to deals with specific roles
export const dealParticipants = defineTable({
  dealId: v.id('deals'),
  participantEntityId: v.id('entities'),
  role: dealRole,
  investorAmountUsd: v.optional(v.number()),
})
  .index('by_deal', ['dealId'])
  .index('by_participant', ['participantEntityId'])
  .index('by_deal_and_participant', ['dealId', 'participantEntityId'])
  .index('by_role', ['role']);

export const funds = defineTable({
  entityId: v.id('entities'),
  name: v.string(),
  fundCapital: v.optional(v.number()),
  status: v.optional(v.string()),
  managingFirmId: v.id('investmentFirms'),
})
  .index('by_entity', ['entityId'])
  .index('by_managing_firm', ['managingFirmId'])
  .index('by_status', ['status']);

export default defineSchema({
  techVerticals,
  companyStages,
  dealTypes,
  entities,
  companies,
  companyTechVerticals,
  people,
  investmentFirms,
  serviceProviders,
  addresses,
  positions,
  deals,
  dealParticipants,
  funds,
});
