import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  index,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

import { imports } from "./imports";
import { labels } from "./labels";
import { lists } from "./lists";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const boardVisibilityEnum = pgEnum("board_visibility", [
  "private",
  "public",
]);

export const boards = pgTable(
  "board",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).notNull(),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
    deletedAt: timestamp("deletedAt"),
    deletedBy: uuid("deletedBy").references(() => users.id),
    importId: bigint("importId", { mode: "number" }).references(
      () => imports.id,
    ),
    workspaceId: bigint("workspaceId", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    visibility: boardVisibilityEnum("visibility").notNull().default("private"),
  },
  (table) => [
    index("board_visibility_idx").on(table.visibility),
    uniqueIndex("unique_slug_per_workspace")
      .on(table.workspaceId, table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    pgPolicy("Allow access to boards in user's workspace or public boards", {
      for: "select",
      as: "permissive",
      to: [authenticatedRole, anonRole],
      using: sql`
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
        OR visibility = 'public'
      `,
    }),
    pgPolicy("Allow inserting boards in user's workspace", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      `,
    }),
    pgPolicy("Allow updating boards in user's workspace", {
      for: "update",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      `,
    }),
    pgPolicy("Allow deleting boards in user's workspace", {
      for: "delete",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      `,
    }),
  ],
).enableRLS();

export const boardsRelations = relations(boards, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [boards.createdBy],
    references: [users.id],
  }),
  lists: many(lists),
  labels: many(labels),
  deletedBy: one(users, {
    fields: [boards.deletedBy],
    references: [users.id],
  }),
  import: one(imports, {
    fields: [boards.importId],
    references: [imports.id],
  }),
  workspace: one(workspaces, {
    fields: [boards.workspaceId],
    references: [workspaces.id],
  }),
}));
