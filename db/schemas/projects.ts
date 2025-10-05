import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { authors } from './authors'

export const projectStatusEnum = pgEnum('project_status', ['active', 'inactive'])
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video'])
export const videoKindEnum = pgEnum('video_kind', ['youtube', 'vimeo', 'mp4'])

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

  projectUrl: text('project_url'),
  repoUrl: text('repo_url'),

  tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`),

  date: timestamp('date'),

  coverMediaId: integer('cover_media_id'),

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

  visible: boolean('visible').notNull().default(true),

  type: mediaTypeEnum('type').notNull(),

  imageSrc: text('image_src'),
  imageAlt: text('image_alt'),
  width: integer('width'),
  height: integer('height'),

  videoKind: videoKindEnum('video_kind'),
  videoSrc: text('video_src'),
  poster: text('poster'),
  autoplay: boolean('autoplay').notNull().default(false),
  loop: boolean('loop').notNull().default(false),
  controls: boolean('controls').notNull().default(true),
  startSeconds: integer('start_seconds'),

  caption: text('caption'),
  longDescription: text('long_description'),

  createdAt: timestamp('created_at').notNull().default(sql`now()`),
}, t => ({
  projIdx: index('project_media_project_idx').on(t.projectId),
  orderIdx: index('project_media_order_idx').on(t.projectId, t.position),
}))
