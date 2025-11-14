export const SEARCH_ENTITIES = ["companies", "people"] as const;

export type SearchEntity = (typeof SEARCH_ENTITIES)[number];

export function parseSearchEntity(value: string | null | undefined): SearchEntity {
  return value === "people" ? "people" : "companies";
}
