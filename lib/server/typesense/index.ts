import { configure, setDefaultConfiguration } from 'typesense-ts';

type Domain = NonNullable<Parameters<typeof configure>[0]['nodes'][number]['host']>;

function assertDomain(value: string | Domain): asserts value is Domain {
  if (value !== 'localhost' && !/\./.test(value)) {
    throw new Error(`Invalid domain: ${value}`);
  }
}

const { TYPESENSE_HOST = 'localhost' as const, TYPESENSE_PORT = '8108', TYPESENSE_API_KEY = 'xyz' } = process.env;

assertDomain(TYPESENSE_HOST);

export const typesenseConfig = configure({
  apiKey: TYPESENSE_API_KEY,
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: Number(TYPESENSE_PORT),
      protocol: 'http',
    },
  ],
  retryIntervalSeconds: 2,
});

setDefaultConfiguration(typesenseConfig);
