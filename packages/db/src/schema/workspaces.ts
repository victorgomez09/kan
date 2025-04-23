import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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

export const workspaces = pgTable("workspace", {
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
}).enableRLS();

export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, { fields: [workspaces.createdBy], references: [users.id] }),
  members: many(workspaceMembers),
}));

export const workspaceMembers = pgTable("workspace_members", {
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
}).enableRLS();

export const slugs = pgTable("workspace_slugs", {
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: slugTypeEnum("type").notNull(),
});
