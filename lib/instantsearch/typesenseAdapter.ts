import { typesenseConfig } from '@/lib/server/typesense';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import { SearchParams } from 'typesense/lib/Typesense/Types';
import { companiesSchema, personSchema } from '../server/typesense/schema';

const COMPANY_SEARCH_PARAMETERS = {
  query_by: ['companyName', 'techVerticals', 'executives', 'boardMembers'],
} satisfies SearchParams<typeof companiesSchema.infer>;

export const BASE_SEARCH_PARAMETERS = COMPANY_SEARCH_PARAMETERS;

export const NATURAL_LANGUAGE_ADDITIONAL_PARAMETERS = {
  nl_query: true,
  nl_model_id: 'gemini-model-2',
} satisfies SearchParams<typeof companiesSchema.infer>;

export const PERSON_SEARCH_PARAMETERS = {
  query_by: ['name', 'cv'],
  highlight_full_fields: ['cv'],
  include_fields: [
    '$executive(companyID,companyName,personName,title,isCurrent,strategy:nest_array)',
    '$boardMember(companyID,companyName,personName,boardName,boardPosition,otherPositions,strategy:nest_array)',
  ].join(','),
  per_page: 10,
} satisfies SearchParams<typeof personSchema.infer>;

const buildConfiguration = (naturalLanguageEnabled: boolean) => ({
  server: typesenseConfig,
  union: true,
  collectionSpecificSearchParameters: {
    companies: naturalLanguageEnabled
      ? { ...COMPANY_SEARCH_PARAMETERS, ...NATURAL_LANGUAGE_ADDITIONAL_PARAMETERS }
      : COMPANY_SEARCH_PARAMETERS,
    person: PERSON_SEARCH_PARAMETERS,
  },
});

export const typesenseAdapter = new TypesenseInstantSearchAdapter(buildConfiguration(false));

export const searchClient = typesenseAdapter.searchClient;

let naturalLanguageEnabled = false;

export const setNaturalLanguageSearch = (enabled: boolean) => {
  if (naturalLanguageEnabled === enabled) {
    return;
  }

  naturalLanguageEnabled = enabled;
  typesenseAdapter.updateConfiguration(buildConfiguration(enabled));
};
