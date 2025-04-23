import type { NeonDatabase as DrizzleClient } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

export type dbClient = DrizzleClient<typeof schema> & {
  $client: Pool;
};

export const createDrizzleClient = () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  return drizzle({
    client: pool,
    schema,
  });
};
