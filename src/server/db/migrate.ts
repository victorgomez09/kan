import 'dotenv/config';
import { migrate } from 'drizzle-orm/planetscale-serverless/migrator';
import { db } from './index';
 
migrate(db, { migrationsFolder: './src/server/db/migrations' }).catch((e) => console.log(e))
