import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

import { imports } from "./imports";
import { labels } from "./labels";
import { lists } from "./lists";
import { users } from "./users";
import { workspaceMembers } from "./workspaces";

export const activityTypeEnum = pgEnum("card_activity_type", [
  "card.created",
  "card.updated.title",
  "card.updated.description",
  "card.updated.index",
  "card.updated.list",
  "card.updated.label.added",
  "card.updated.label.removed",
  "card.updated.member.added",
  "card.updated.member.removed",
  "card.updated.comment.added",
  "card.updated.comment.updated",
  "card.updated.comment.deleted",
  "card.archived",
]);

export const cards = pgTable(
  "card",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    index: integer("index").notNull(),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
    deletedAt: timestamp("deletedAt"),
    deletedBy: uuid("deletedBy").references(() => users.id),
    listId: bigint("listId", { mode: "number" })
      .notNull()
      .references(() => lists.id, { onDelete: "cascade" }),
    importId: bigint("importId", { mode: "number" }).references(
      () => imports.id,
    ),
  },
  () => [
    pgPolicy("Allow access to cards in user's workspace or public boards", {
      for: "select",
      as: "permissive",
      to: [authenticatedRole, anonRole],
      using: sql`
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
            OR b.visibility = 'public'
        )
      `,
    }),
    pgPolicy("Allow inserting cards in user's workspace", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      `,
    }),

    pgPolicy("Allow updating cards in user's workspace", {
      for: "update",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      `,
    }),
    pgPolicy("Allow deleting cards in user's workspace", {
      for: "delete",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      `,
    }),
  ],
).enableRLS();

export const cardsRelations = relations(cards, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [cards.createdBy],
    references: [users.id],
  }),
  list: one(lists, {
    fields: [cards.listId],
    references: [lists.id],
  }),
  deletedBy: one(users, {
    fields: [cards.deletedBy],
    references: [users.id],
  }),
  labels: many(cardsToLabels),
  members: many(cardToWorkspaceMembers),
  import: one(imports, {
    fields: [cards.importId],
    references: [imports.id],
  }),
  comments: many(comments),
}));

export const cardActivities = pgTable(
  "card_activity",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    type: activityTypeEnum("type").notNull(),
    cardId: bigint("cardId", { mode: "number" })
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    fromIndex: integer("fromIndex"),
    toIndex: integer("toIndex"),
    fromListId: bigint("fromListId", { mode: "number" }).references(
      () => lists.id,
    ),
    toListId: bigint("toListId", { mode: "number" }).references(() => lists.id),
    labelId: bigint("labelId", { mode: "number" }).references(() => labels.id),
    workspaceMemberId: bigint("workspaceMemberId", {
      mode: "number",
    }).references(() => workspaceMembers.id),
    fromTitle: varchar("fromTitle", { length: 255 }),
    toTitle: varchar("toTitle", { length: 255 }),
    fromDescription: text("fromDescription"),
    toDescription: text("toDescription"),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    commentId: bigint("commentId", { mode: "number" }).references(
      () => comments.id,
    ),
    fromComment: text("fromComment"),
    toComment: text("toComment"),
  },
  () => [
    pgPolicy(
      "Allow access to card activity in user's workspace or public boards",
      {
        for: "select",
        as: "permissive",
        to: [authenticatedRole, anonRole],
        using: sql`
        "cardId" IN (
          SELECT c.id
          FROM card c
          JOIN list l ON c."listId" = l.id
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
            OR b.visibility = 'public'
        )
      `,
      },
    ),
    pgPolicy("Allow inserting card activity in user's workspace", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`
        "cardId" IN (
          SELECT c.id
          FROM card c
          JOIN list l ON c."listId" = l.id
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      `,
    }),
  ],
).enableRLS();

export const cardActivitiesRelations = relations(cardActivities, ({ one }) => ({
  card: one(cards, {
    fields: [cardActivities.cardId],
    references: [cards.id],
  }),
  fromList: one(lists, {
    fields: [cardActivities.fromListId],
    references: [lists.id],
  }),
  toList: one(lists, {
    fields: [cardActivities.toListId],
    references: [lists.id],
  }),
  label: one(labels, {
    fields: [cardActivities.labelId],
    references: [labels.id],
  }),
  workspaceMember: one(workspaceMembers, {
    fields: [cardActivities.workspaceMemberId],
    references: [workspaceMembers.id],
  }),
  createdBy: one(users, {
    fields: [cardActivities.createdBy],
    references: [users.id],
  }),
}));

export const cardsToLabels = pgTable(
  "_card_labels",
  {
    cardId: bigint("cardId", { mode: "number" })
      .notNull()
      .references(() => cards.id),
    labelId: bigint("labelId", { mode: "number" })
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.cardId, t.labelId] }),
    pgPolicy(
      "Allow access to card labels in user's workspace or public boards",
      {
        for: "select",
        as: "permissive",
        to: [authenticatedRole, anonRole],
        using: sql`
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId" AND wm."userId" = auth.uid()
        WHERE wm."userId" = auth.uid()
          OR b.visibility = 'public'
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId" AND wm."userId" = auth.uid()
        WHERE wm."userId" = auth.uid()
          OR b.visibility = 'public'
      )
    `,
      },
    ),
    pgPolicy("Allow inserting card labels in user's workspace", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    `,
    }),
    pgPolicy("Allow updating card labels in user's workspace", {
      for: "update",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    `,
    }),
    pgPolicy("Allow deleting card labels in user's workspace", {
      for: "delete",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    `,
    }),
  ],
).enableRLS();

export const cardToLabelsRelations = relations(cardsToLabels, ({ one }) => ({
  card: one(cards, {
    fields: [cardsToLabels.cardId],
    references: [cards.id],
  }),
  label: one(labels, {
    fields: [cardsToLabels.labelId],
    references: [labels.id],
  }),
}));

export const cardToWorkspaceMembers = pgTable(
  "_card_workspace_members",
  {
    cardId: bigint("cardId", { mode: "number" })
      .notNull()
      .references(() => cards.id),
    workspaceMemberId: bigint("workspaceMemberId", { mode: "number" })
      .notNull()
      .references(() => workspaceMembers.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.cardId, t.workspaceMemberId] }),
    pgPolicy("Allow access to card workspace members in user's workspace", {
      for: "all",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
        "cardId" IN (
          SELECT c.id
          FROM card c
          JOIN list l ON c."listId" = l.id
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
        AND
        "workspaceMemberId" IN (
          SELECT wm.id
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

export const cardToWorkspaceMembersRelations = relations(
  cardToWorkspaceMembers,
  ({ one }) => ({
    card: one(cards, {
      fields: [cardToWorkspaceMembers.cardId],
      references: [cards.id],
    }),
    member: one(workspaceMembers, {
      fields: [cardToWorkspaceMembers.workspaceMemberId],
      references: [workspaceMembers.id],
    }),
  }),
);

export const comments = pgTable(
  "card_comments",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    comment: text("comment").notNull(),
    cardId: bigint("cardId", { mode: "number" })
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    createdBy: uuid("createdBy")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt"),
    deletedAt: timestamp("deletedAt"),
    deletedBy: uuid("deletedBy").references(() => users.id),
  },
  () => [
    pgPolicy(
      "Allow access to card comments in user's workspace or public boards",
      {
        for: "select",
        as: "permissive",
        to: [authenticatedRole, anonRole],
        using: sql`
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
          OR b.visibility = 'public'
      )
    `,
      },
    ),
    pgPolicy("Allow inserting comments on cards in user's workspace", {
      for: "insert",
      as: "permissive",
      to: [authenticatedRole],
      withCheck: sql`
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    `,
    }),
    pgPolicy("Allow updating own comments", {
      for: "update",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
      "createdBy" = auth.uid()
    `,
    }),
    pgPolicy("Allow deleting own comments", {
      for: "delete",
      as: "permissive",
      to: [authenticatedRole],
      using: sql`
      "createdBy" = auth.uid()
    `,
    }),
  ],
).enableRLS();

export const commentsRelations = relations(comments, ({ one }) => ({
  card: one(cards, {
    fields: [comments.cardId],
    references: [cards.id],
  }),
  createdBy: one(users, {
    fields: [comments.createdBy],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [comments.deletedBy],
    references: [users.id],
  }),
}));
