import { relations, sql } from "drizzle-orm";
import {
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { boards } from "./boards";
import { cards } from "./cards";
import { imports } from "./imports";
import { lists } from "./lists";
import { workspaceMembers, workspaces } from "./workspaces";

export const users = pgTable(
  "user",
  {
    id: uuid("id").notNull().primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: varchar("image", { length: 255 }),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  },
  () => [
    pgPolicy("Allow viewing members in user's workspace", {
      for: "select",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        id IN (
          SELECT wm."userId"
          FROM workspace_members wm
          WHERE wm."workspaceId" IN (
            SELECT "workspaceId"
            FROM workspace_members
            WHERE "userId" = auth.uid()
          )
        )
      `,
    }),
  ],
).enableRLS();

export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  cards: many(cards),
  imports: many(imports),
  lists: many(lists),
  workspaces: many(workspaces),
}));

export const usersToWorkspacesRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    addedBy: one(users, {
      fields: [workspaceMembers.createdBy],
      references: [users.id],
    }),
    deletedBy: one(users, {
      fields: [workspaceMembers.deletedBy],
      references: [users.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.userId],
      references: [users.id],
    }),
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
  }),
);
