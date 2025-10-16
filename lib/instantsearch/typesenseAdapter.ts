import { typesenseConfig } from '@/lib/server/typesense';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import { SearchParams } from 'typesense/lib/Typesense/Types';
import { companiesSchema } from '../server/typesense/schema';

export const BASE_SEARCH_PARAMETERS = {
  query_by: ['companyName', 'techVerticals', 'executives', 'boardMembers'],
} satisfies SearchParams<typeof companiesSchema.infer>;

export const NATURAL_LANGUAGE_ADDITIONAL_PARAMETERS = {
  nl_query: true,
  nl_model_id: 'gemini-model',
} satisfies SearchParams<typeof companiesSchema.infer>;

const buildConfiguration = (naturalLanguageEnabled: boolean) => ({
  server: typesenseConfig,
  additionalSearchParameters: naturalLanguageEnabled
    ? { ...BASE_SEARCH_PARAMETERS, ...NATURAL_LANGUAGE_ADDITIONAL_PARAMETERS }
    : BASE_SEARCH_PARAMETERS,
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
