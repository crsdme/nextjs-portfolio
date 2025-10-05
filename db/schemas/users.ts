import { sql } from 'drizzle-orm'
import { boolean, index, integer, pgEnum, pgTable, primaryKey, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { authors } from './authors'

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('editor'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
}, t => ({
  emailUidx: uniqueIndex('users_email_uidx').on(t.email),
}))

export const userAuthors = pgTable('user_authors', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),

  canCreate: boolean('can_create').notNull().default(true),
  canUpdate: boolean('can_update').notNull().default(true),
  canDelete: boolean('can_delete').notNull().default(false),
  canPublish: boolean('can_publish').notNull().default(false),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.authorId] }),
  userIdx: index('user_authors_user_idx').on(t.userId),
  authorIdx: index('user_authors_author_idx').on(t.authorId),
}))
