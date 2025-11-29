import { Kysely, MssqlDialect, ParseJSONResultsPlugin } from "kysely";
import type { DB } from "./db-types";
import * as tarn from "tarn";
import * as tedious from "tedious";

const dialect = new MssqlDialect({
  tarn: {
    ...tarn,
    options: {
      min: 0,
      max: 10,
      propagateCreateError: true,
    },
  },
  tedious: {
    ...tedious,
    connectionFactory: () =>
      new tedious.Connection({
        authentication: {
          options: {
            password: process.env.DB_PASSWORD,
            userName: process.env.DB_USER,
          },
          type: "default",
        },
        options: {
          database: process.env.DB_NAME,
          instanceName: process.env.DB_INSTANCE_NAME,
          trustServerCertificate: true,
          requestTimeout: 60_000,
        },
        server: process.env.DB_SERVER!,
      }),
  },
});

export const db = new Kysely<DB>({
  dialect,
  plugins: [new ParseJSONResultsPlugin()],
});
