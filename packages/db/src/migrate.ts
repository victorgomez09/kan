import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const postgresUrl = process.env.POSTGRES_URL;
if (!postgresUrl) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

const migrationClient = postgres(postgresUrl, { max: 1 });
migrate(drizzle(migrationClient), {
  migrationsFolder: "./src/server/db/migrations",
}).catch((e) => console.log(e));
