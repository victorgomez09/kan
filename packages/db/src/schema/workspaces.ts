import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

import { users } from "./users";

export const memberRoleEnum = pgEnum("role", ["admin", "member", "guest"]);
export const memberStatusEnum = pgEnum("member_status", [
  "invited",
  "active",
  "removed",
]);
export const slugTypeEnum = pgEnum("slug_type", ["reserved", "premium"]);
export const workspacePlanEnum = pgEnum("workspace_plan", [
  "free",
  "pro",
  "enterprise",
]);

export const workspaces = pgTable(
  "workspace",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    plan: workspacePlanEnum("plan").notNull().default("free"),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
    deletedAt: timestamp("deletedAt"),
    deletedBy: uuid("deletedBy").references(() => users.id),
  },
  () => [
    pgPolicy("Allow viewing user's workspaces", {
      for: "select",
      as: "permissive",
      to: [authenticatedRole, anonRole],
      using: sql`
        CASE 
          WHEN auth.uid() IS NULL THEN
            EXISTS (
              SELECT 1 
              FROM board 
              WHERE "workspaceId" = workspace.id 
              AND visibility = 'public'
            )
          ELSE
            id IN (
              SELECT "workspaceId"
              FROM workspace_members
              WHERE "userId" = auth.uid()
            )
            OR "createdBy" = auth.uid()
        END
      `,
    }),
    pgPolicy("Allow updating user's workspaces", {
      for: "update",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        id IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      `,
    }),
    pgPolicy("Allow deleting user's workspaces", {
      for: "delete",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        id IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      `,
    }),
    pgPolicy("Allow authenticated users to create workspaces", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`true`,
    }),
  ],
).enableRLS();

export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, { fields: [workspaces.createdBy], references: [users.id] }),
  members: many(workspaceMembers),
}));

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    workspaceId: bigint("workspaceId", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdBy: uuid("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
    deletedAt: timestamp("deletedAt"),
    deletedBy: uuid("deletedBy").references(() => users.id),
    role: memberRoleEnum("role").notNull(),
    status: memberStatusEnum("status").default("invited").notNull(),
  },
  () => [
    pgPolicy("Allow members to view workspace membership", {
      for: "select",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "userId" = auth.uid() OR
        is_workspace_member(auth.uid(), "workspaceId")
      `,
    }),
    pgPolicy("Allow admins to add workspace members", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`
        is_workspace_admin(auth.uid(), "workspaceId")
      `,
    }),
    pgPolicy("Allow admins to update workspace members", {
      for: "update",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        is_workspace_admin(auth.uid(), "workspaceId")
      `,
    }),
    pgPolicy("Allow admins to remove workspace members", {
      for: "delete",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        is_workspace_admin(auth.uid(), "workspaceId")
      `,
    }),
  ],
).enableRLS();

export const slugs = pgTable("workspace_slugs", {
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: slugTypeEnum("type").notNull(),
});
