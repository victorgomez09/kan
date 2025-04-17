import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  integer,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

import { boards } from "./boards";
import { cards } from "./cards";
import { imports } from "./imports";
import { users } from "./users";

export const lists = pgTable(
  "list",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    index: integer("index").notNull(),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
    deletedAt: timestamp("deletedAt"),
    deletedBy: uuid("deletedBy").references(() => users.id),
    boardId: bigint("boardId", { mode: "number" })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    importId: bigint("importId", { mode: "number" }).references(
      () => imports.id,
    ),
  },
  () => [
    pgPolicy("Allow access to lists in user's workspace or public boards", {
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
    pgPolicy("Allow inserting lists in user's workspace", {
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
    pgPolicy("Allow updating lists in user's workspace", {
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
    pgPolicy("Allow deleting lists in user's workspace", {
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

export const listsRelations = relations(lists, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [lists.createdBy],
    references: [users.id],
  }),
  board: one(boards, {
    fields: [lists.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
  deletedBy: one(users, {
    fields: [lists.deletedBy],
    references: [users.id],
  }),
  import: one(imports, {
    fields: [lists.importId],
    references: [imports.id],
  }),
}));
