import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export type dbClient = NodePgDatabase<typeof schema> & {
  $client: Pool;
};

export const createDrizzleClient = (): dbClient => {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString,
  });

  return drizzlePg(pool, { schema }) as dbClient;
};
