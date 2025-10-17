import { collection } from 'typesense-ts';

/**
 * Useful for `type instantiation is excessively deep and possibly infinite` errors.
 * [Reference](https://x.com/solinvictvs/status/1671507561143476226)
 * @template T - The type to recurse.
 */
type Recurse<T> = T extends infer R ? R : never;

export const companiesSchema = collection({
  name: 'companies',
  fields: [
    // Non indexed but should be part of the schema
    { name: 'companyID', type: 'string', index: false },

    // Indexed fields
    { name: 'companyName', type: 'string', index: true },
    { name: 'shortName', type: 'string', index: true, optional: true },
    { name: 'companyDescription', type: 'string', optional: true },
    { name: 'technology', type: 'string', optional: true },

    // Faceted fields
    { name: 'sector', type: 'string', facet: true },
    { name: 'stage', type: 'string', facet: true },
    { name: 'establishedYear', type: 'int32', facet: true, sort: true, optional: true },
    { name: 'employees', type: 'int32', facet: true, sort: true, range_index: true, optional: true },
    { name: 'techVerticals', type: 'string[]', facet: true },
    { name: 'executives', type: 'string[]', facet: true },
    { name: 'investors', type: 'string[]', facet: true },
    { name: 'boardMembers', type: 'string[]', facet: true },
  ],
});

export const personSchema = collection({
  name: 'person',
  fields: [
    { name: 'name', type: 'string', index: true },
    { name: 'email', type: 'string', index: false, optional: true },
    { name: 'phone', type: 'string', index: false, optional: true },
    { name: 'cv', type: 'string', index: false, optional: true },
    { name: 'linkedInProfile', type: 'string', index: false, optional: true },
  ],
});

export const ALL_SCHEMAS: Recurse<[typeof companiesSchema, typeof personSchema]> = [companiesSchema, personSchema];

// Register the collection globally for type safety
declare module 'typesense-ts' {
  interface Collections {
    companies: typeof companiesSchema.schema;
    person: typeof personSchema.schema;
  }
}

export const attributeMetaMap: Record<string, { label: string; formatRefinementLabel?: boolean }> = {
  boardMembers: { label: 'Board Members' },
  executives: { label: 'Key Excecutives' },
  techVerticals: { label: 'Tech verticals' },
  employees: { label: 'Employees count' },
  sector: { label: 'Sector' },
  stage: { label: 'Stage' },
  establishedYear: { label: 'Founded at', formatRefinementLabel: false },
} satisfies { [K in keyof Partial<typeof companiesSchema.infer>]: { label: string; formatRefinementLabel?: boolean } };
