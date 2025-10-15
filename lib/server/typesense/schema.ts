import { collection } from 'typesense-ts';

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

export const ALL_SCHEMAS = [companiesSchema];

// Register the collection globally for type safety
declare module 'typesense-ts' {
  interface Collections {
    companies: typeof companiesSchema.schema;
  }
}

export const attributeMetaMap: Record<string, { label: string, formatRefinementLabel?: boolean }> = {
  boardMembers: {label: "Board Members"},
  executives: {label: "Key Excecutives"},
  techVerticals: {label: "Tech verticals"},
  employees: {label: "Employees count"},
  sector: {label: "Sector"},
  stage: { label: "Stage"},
  establishedYear: { label: "Founded at", formatRefinementLabel: false },

} satisfies { [K in keyof Partial<typeof companiesSchema.infer>]: { label: string, formatRefinementLabel?: boolean } };
