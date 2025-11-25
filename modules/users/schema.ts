import { sql } from 'drizzle-orm'
import { pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  login: text('login').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  accesses: text('accesses')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  authors: text('authors')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
}, t => ({
  loginUidx: uniqueIndex('users_login_uidx').on(t.login),
}))
