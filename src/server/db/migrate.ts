import 'dotenv/config';

import { env } from "~/env.mjs";

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const migrationClient = postgres(env.POSTGRES_URL, { max: 1 });
migrate(drizzle(migrationClient), { migrationsFolder: './src/server/db/migrations' }).catch((e) => console.log(e))
