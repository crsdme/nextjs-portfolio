import { z } from 'zod'

export const socialSchema = z.object({
  label: z.string().min(1),
  url: z.string(),
})

export const authorSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'Укажите имя'),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  socials: z.array(socialSchema).default([]),
  slug: z.string().min(1, 'Укажите slug'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const authorsSchema = z.array(authorSchema)

export const createAuthorSchema = authorSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const updateAuthorSchema = authorSchema.partial().extend({ id: z.number().int().positive() })

export const authorsQueryInput = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id.asc', 'id.desc', 'createdAt.asc', 'createdAt.desc']).default('id.desc'),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
})

export type AuthorUpdate = z.infer<typeof updateAuthorSchema>
export type AuthorCreate = z.infer<typeof createAuthorSchema>
export type Author = z.infer<typeof authorSchema>
export type AuthorsQuery = z.infer<typeof authorsQueryInput>
