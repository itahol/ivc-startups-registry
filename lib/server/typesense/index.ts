import { setDefaultConfiguration } from 'typesense-ts';
import { ALL_SCHEMAS } from './schema';

setDefaultConfiguration({
  apiKey: 'xyz',
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
});

async function initTypesense() {
  for (const schmea of ALL_SCHEMAS) {
    await schmea.create();
  }
}

await initTypesense();
