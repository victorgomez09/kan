import { relations, sql } from "drizzle-orm";
import {
  bigserial,
  pgEnum,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { boards } from "./boards";
import { cards } from "./cards";
import { labels } from "./labels";
import { lists } from "./lists";
import { users } from "./users";

export const importSourceEnum = pgEnum("source", ["trello"]);
export const importStatusEnum = pgEnum("status", [
  "started",
  "success",
  "failed",
]);

export const imports = pgTable(
  "import",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    source: importSourceEnum("source").notNull(),
    status: importStatusEnum("status").notNull(),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  () => [
    pgPolicy("Allow access to user's own imports", {
      for: "all",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "createdBy" = auth.uid()
      `,
    }),
  ],
).enableRLS();

export const importsRelations = relations(imports, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [imports.createdBy],
    references: [users.id],
  }),
  boards: many(boards),
  cards: many(cards),
  lists: many(lists),
  labels: many(labels),
}));
