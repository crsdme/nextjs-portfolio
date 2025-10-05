import { sql } from 'drizzle-orm'
import { jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull(),
  value: jsonb('value').notNull().default(sql`'{}'::jsonb`),

  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
}, t => ({
  keyUidx: uniqueIndex('settings_key_uidx').on(t.key),
}))
