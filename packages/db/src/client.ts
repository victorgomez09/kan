import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

export const createDrizzleClient = () => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  return drizzle({
    client: pool,
    schema,
  });
};
