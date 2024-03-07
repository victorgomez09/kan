import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlEnum,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { type AdapterAccount } from "@auth/core/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mySqlTable = mysqlTableCreator((name) => `${name}`);

export const boards = mySqlTable(
  "board",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    createdBy: varchar("createdBy", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    deletedAt: timestamp("deletedAt"),
    deletedBy: varchar("deletedBy", { length: 256 }),
    importId: varchar("importId", { length: 256 }),
    workspaceId: bigint("workspaceId", { mode: "number" }).notNull(),
  },
);

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

export const imports = mySqlTable(
  "import",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    source: mysqlEnum('source', ['trello']).notNull(),
    createdBy: varchar("createdBy", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    status: mysqlEnum('status', ['started', 'success', 'failed']).notNull(),
  },
);

export const importsRelations = relations(imports, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [imports.createdBy],
		references: [users.id],
	}),
  boards: many(boards),
  cards: many(cards),
  lists: many(lists),
  labels: many(labels)
}));

export const labels = mySqlTable(
  "label",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 256 }).notNull(),
    colourCode: varchar("colourCode", { length: 12 }),
    createdBy: varchar("createdBy", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    boardId: bigint("boardId", { mode: "number" }).notNull(),
    importId: varchar("importId", { length: 255 }),
  }
);

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

export const cardsToLabels = mySqlTable(
  "card_label",
  {
    cardId: bigint("cardId", { mode: "number" }).notNull().references(() => cards.id),
    labelId: bigint("labelId", { mode: "number" }).notNull().references(() => labels.id),
  }, (t) => ({
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

export const cardToWorkspaceMembers = mySqlTable(
  "card_workspace_members",
  {
    cardId: bigint("cardId", { mode: "number" }).notNull().references(() => cards.id),
    workspaceMemberId: bigint("workspaceMemberId", { mode: "number" }).notNull().references(() => workspaceMembers.id),
  }, (t) => ({
    pk: primaryKey(t.cardId, t.workspaceMemberId),
  }),
);

export const cardToWorkspaceMembersRelations = relations(cardToWorkspaceMembers, ({ one }) => ({
	card: one(cards, {
		fields: [cardToWorkspaceMembers.cardId],
		references: [cards.id],
	}),
  member: one(workspaceMembers, {
		fields: [cardToWorkspaceMembers.workspaceMemberId],
		references: [workspaceMembers.id],
	}),
}));

export const lists = mySqlTable(
  "list",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 256 }).notNull(),
    createdBy: varchar("createdBy", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    boardId: bigint("boardId", { mode: "number" }).notNull(),
    index: int("index").notNull(),
    deletedAt: timestamp("deletedAt"),
    deletedBy: varchar("deletedBy", { length: 256 }),
    importId: varchar("importId", { length: 255 }),
  }
);

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

export const cards = mySqlTable(
  "card",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    createdBy: varchar("createdBy", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    listId: bigint("listId", { mode: "number" }).notNull(),
    index: int("index").notNull(),
    deletedAt: timestamp("deletedAt"),
    deletedBy: varchar("deletedBy", { length: 256 }),
    importId: varchar("importId", { length: 255 }),
  }
);

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
}));

export const users = mySqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  boards: many(boards),
  cards: many(cards),
  imports: many(imports),
  lists: many(lists),
  workspaces: many(workspaces),
}));

export const accounts = mySqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mySqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mySqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export const workspaces = mySqlTable(
  "workspace",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    name: varchar("name", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),  
    createdBy: varchar("createdBy", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    deletedAt: timestamp("deletedAt"),
    deletedBy: varchar("deletedBy", { length: 256 }),
  }
);

export const workspaceRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, { fields: [workspaces.createdBy], references: [users.id] }),
  members: many(workspaceMembers)
}));

export const workspaceMembers = mySqlTable(
  "workspace_members",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    publicId: varchar("publicId", { length: 12 }).notNull().unique(),
    userId: varchar("userId", { length: 256 }).notNull().references(() => users.id),
    workspaceId: bigint("workspaceId", { mode: "number" }).notNull().references(() => workspaces.id),
    createdBy: varchar("createdBy", { length: 256 }).notNull(),
    createdAt: timestamp("createdAt")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    deletedAt: timestamp("deletedAt"),
    role: mysqlEnum('role', ['admin', 'member', 'guest']).notNull(),
  }, (t) => ({
    pk: primaryKey(t.userId, t.workspaceId),
  }),
);

export const usersToWorkspacesRelations = relations(workspaceMembers, ({ one }) => ({
  addedBy: one(users, { fields: [workspaceMembers.createdBy], references: [users.id] }),
	user: one(users, {
		fields: [workspaceMembers.userId],
		references: [users.id],
	}),
  workspace: one(workspaces, {
		fields: [workspaceMembers.workspaceId],
		references: [workspaces.id],
	}),
}));


