import { Infer, v } from 'convex/values';
import { internalQuery, MutationCtx } from './_generated/server';
import { entityType } from './schema';

// ============================================
// IVC-Online CRUD Functions
// ============================================
// ===== ENTITIES =====
// Create a new entity

export async function createEntity({
  ctx,
  args,
}: {
  ctx: MutationCtx;
  args: { entityType: Infer<typeof entityType>; ivcNumber?: string };
}) {
  const now = Date.now();
  return await ctx.db.insert('entities', {
    entityType: args.entityType,
    ivcNumber: args.ivcNumber,
    createdAt: now,
    lastUpdatedAt: now,
  });
}

// Get entity by ID
export const getEntity = internalQuery({
  args: { id: v.id('entities') },
  returns: v.union(
    v.object({
      _id: v.id('entities'),
      _creationTime: v.number(),
      entityType: entityType,
      ivcNumber: v.optional(v.string()),
      createdAt: v.optional(v.number()),
      lastUpdatedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List entities with optional filtering
export const listEntities = internalQuery({
  args: {
    entityType: v.optional(entityType),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id('entities'),
      _creationTime: v.number(),
      entityType: entityType,
      ivcNumber: v.optional(v.string()),
      createdAt: v.optional(v.number()),
      lastUpdatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    let query = ctx.db.query('entities');

    if (args.entityType) {
      // Filter manually since we don't have an index on entityType yet
      const allEntities = await query.collect();
      const filtered = allEntities.filter((e) => e.entityType === args.entityType);
      return filtered.slice(0, args.limit ?? 50);
    }

    return await query.order('desc').take(args.limit ?? 50);
  },
});
