import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const postgresUrl = process.env.POSTGRES_URL;
if (!postgresUrl) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

const migrationClient = postgres(postgresUrl, { max: 1 });
console.log("Starting database migration...");

migrate(drizzle(migrationClient), {
  migrationsFolder: "./migrations",
})
  .then(() => {
    console.log("✅ Database migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  });
