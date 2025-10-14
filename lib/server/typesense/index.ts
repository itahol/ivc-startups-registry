import { configure, setDefaultConfiguration } from 'typesense-ts';

const { TYPESENSE_HOST = 'localhost', TYPESENSE_PORT = '8108', TYPESENSE_API_KEY } = process.env;

export const typesenseConfig = configure({
  apiKey: 'g46Vko1pA0ROhg9mobCwgv0mBIeGlvBQ',
  nodes: [
    {
      host: 'localhost',
      port: Number(TYPESENSE_PORT),
      protocol: 'http',
    },
  ],
  retryIntervalSeconds: 2,
});

setDefaultConfiguration(typesenseConfig);
