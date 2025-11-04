import { sql } from 'drizzle-orm'
import { jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export interface Social { label: string, url: string }

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  socials: jsonb('socials').$type<Social[]>().notNull().default(sql`'[]'::jsonb`),

  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
  slug: text('slug').notNull(),
}, t => ({
  slugUidx: uniqueIndex('authors_slug_uidx').on(t.slug),
}))
