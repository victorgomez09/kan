import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const importSourceEnum = pgEnum("source", ["trello"]);
export const importStatusEnum = pgEnum("status", [
  "started",
  "success",
  "failed",
]);
export const memberRoleEnum = pgEnum("role", ["admin", "member", "guest"]);
export const memberStatusEnum = pgEnum("member_status", [
  "invited",
  "active",
  "removed",
]);
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
export const slugTypeEnum = pgEnum("slug_type", ["reserved", "premium"]);
export const workspacePlanEnum = pgEnum("workspace_plan", [
  "free",
  "pro",
  "enterprise",
]);

export const boards = pgTable("board", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  publicId: varchar("publicId", { length: 12 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdBy: uuid("createdBy")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  deletedAt: timestamp("deletedAt"),
  deletedBy: uuid("deletedBy").references(() => users.id),
  importId: bigint("importId", { mode: "number" }).references(() => imports.id),
  workspaceId: bigint("workspaceId", { mode: "number" })
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
});

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

export const imports = pgTable("import", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  publicId: varchar("publicId", { length: 12 }).notNull().unique(),
  source: importSourceEnum("source").notNull(),
  status: importStatusEnum("status").notNull(),
  createdBy: uuid("createdBy")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

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

export const labels = pgTable("label", {
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
  importId: bigint("importId", { mode: "number" }).references(() => imports.id),
});

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
  (t) => ({
    pk: primaryKey(t.cardId, t.labelId),
  }),
);

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
  (t) => ({
    pk: primaryKey(t.cardId, t.workspaceMemberId),
  }),
);

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

export const lists = pgTable("list", {
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
  importId: bigint("importId", { mode: "number" }).references(() => imports.id),
});

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

export const cards = pgTable("card", {
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
  importId: bigint("importId", { mode: "number" }).references(() => imports.id),
});

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

export const users = pgTable("user", {
  id: uuid("id").notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  cards: many(cards),
  imports: many(imports),
  lists: many(lists),
  workspaces: many(workspaces),
}));

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
});

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
});

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

export const cardActivities = pgTable("card_activity", {
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
  workspaceMemberId: bigint("workspaceMemberId", { mode: "number" }).references(
    () => workspaceMembers.id,
  ),
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
});

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

export const comments = pgTable("card_comments", {
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
});

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

export const slugs = pgTable("workspace_slugs", {
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: slugTypeEnum("type").notNull(),
});
