import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

import { boards } from "./boards";
import { cardsToLabels } from "./cards";
import { imports } from "./imports";
import { users } from "./users";

export const labels = pgTable(
  "label",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    colourCode: varchar("colourCode", { length: 12 }),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
    boardId: bigint("boardId", { mode: "number" })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    importId: bigint("importId", { mode: "number" }).references(
      () => imports.id,
    ),
  },
  () => [
    pgPolicy("Allow access to labels in user's workspace or public boards", {
      for: "select",
      as: "permissive",
      to: [authenticatedRole, anonRole],
      using: sql`
        "boardId" IN (
          SELECT b.id
          FROM board b
          LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
            OR b.visibility = 'public'
        )
      `,
    }),
    pgPolicy("Allow inserting labels in user's workspace", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      `,
    }),
    pgPolicy("Allow updating labels in user's workspace", {
      for: "update",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      `,
    }),
    pgPolicy("Allow deleting labels in user's workspace", {
      for: "delete",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      `,
    }),
  ],
).enableRLS();

export const labelsRelations = relations(labels, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [labels.createdBy],
    references: [users.id],
  }),
  board: one(boards, {
    fields: [labels.boardId],
    references: [boards.id],
  }),
  cards: many(cardsToLabels),
  import: one(imports, {
    fields: [labels.importId],
    references: [imports.id],
  }),
}));
