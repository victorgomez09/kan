import { eq } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import { slugs } from "@kan/db/schema";

export const getWorkspaceSlug = (db: dbClient, slug: string) => {
  return db.query.slugs.findFirst({
    columns: {
      slug: true,
      type: true,
    },
    where: eq(slugs.slug, slug),
  });
};
