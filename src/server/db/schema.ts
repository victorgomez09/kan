import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

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
  },
);

export const boardsRelations = relations(boards, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [boards.createdBy],
		references: [users.id],
	}),
  lists: many(lists),
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
    index: int("index").notNull()
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
  cards: many(cards)
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
    index: int("index").notNull()
  }
);

export const cardsRelations = relations(cards, ({ one }) => ({
	createdBy: one(users, {
		fields: [cards.createdBy],
		references: [users.id],
	}),
  list: one(lists, {
		fields: [cards.listId],
		references: [lists.id],
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
  lists: many(lists),
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
