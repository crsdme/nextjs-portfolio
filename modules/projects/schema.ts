import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { authors } from '@/db/schemas'

export const projectStatusEnum = pgEnum('project_status', ['active', 'inactive'])
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video'])

export interface Tag { label: string, url: string }

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .notNull()
    .references(() => authors.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description').notNull(),
  status: projectStatusEnum('status').notNull().default('active'),
  tags: jsonb('tags').$type<Tag[]>().notNull().default(sql`'[]'::jsonb`),
  date: timestamp('date'),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
}, t => ({
  authorIdx: index('projects_author_idx').on(t.authorId),
  statusIdx: index('projects_status_idx').on(t.status),
}))

export const projectMedia = pgTable('project_media', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  type: mediaTypeEnum('type').notNull(),

  src: text('src'),
  // width: integer('width'),
  // height: integer('height'),

  caption: text('caption'),
  description: text('description'),

  createdAt: timestamp('created_at').notNull().default(sql`now()`),
}, t => ({
  projIdx: index('project_media_project_idx').on(t.projectId),
  orderIdx: index('project_media_order_idx').on(t.projectId, t.position),
}))
