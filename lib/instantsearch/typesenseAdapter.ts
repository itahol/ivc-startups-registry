import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import { typesenseConfig } from '@/lib/server/typesense';

export const typesenseAdapter = new TypesenseInstantSearchAdapter({
  server: typesenseConfig,
  additionalSearchParameters: {
    query_by: ['companyName', 'techVerticals', 'executives', 'boardMembers'],
  },
});

export const searchClient = typesenseAdapter.searchClient;
