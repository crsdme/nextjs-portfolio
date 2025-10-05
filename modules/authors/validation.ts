import { z } from 'zod'

export const socialSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
})

export const authorSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, 'Укажите имя'),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Укажите корректный URL фото').optional(),
  socials: z.array(socialSchema).default([]),
  slug: z.string().min(1, 'Укажите slug'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const authorsSchema = z.array(authorSchema)

export const createSchema = authorSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const updateSchema = authorSchema.partial().extend({ id: z.number().int().positive() })

export const authorsQueryInput = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id.asc', 'id.desc', 'createdAt.asc', 'createdAt.desc']).default('id.desc'),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
})

export type Author = z.infer<typeof authorSchema>
export type AuthorsQuery = z.infer<typeof authorsQueryInput>
