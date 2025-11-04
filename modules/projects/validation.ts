import { z } from 'zod'

export const imageSlideSchema = z.object({
  id: z.number().optional(),
  projectId: z.number().optional(),
  type: z.literal('image'),
  src: z.string(),
  caption: z.string().optional(),
  description: z.string().optional(),
})

export const videoSlideSchema = z.object({
  id: z.number().optional(),
  projectId: z.number().optional(),
  type: z.literal('video'),
  src: z.string(),
  caption: z.string().optional(),
  description: z.string().optional(),
})

export const mediaSlideSchema = z.discriminatedUnion('type', [
  imageSlideSchema,
  videoSlideSchema,
])

/* --- Project --- */
export const projectSchema = z.object({
  id: z.number().optional(),
  authorId: z.number().int().positive(),
  slug: z.string().min(1, 'Укажите slug'),
  title: z.string().min(1, 'Укажите название'),
  subtitle: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  slides: z.array(mediaSlideSchema).min(1, 'Добавьте хотя бы один слайд'),
  tags: z.array(z.object({
    label: z.string().min(1, 'Укажите label'),
    url: z.string(),
  })).optional(),
  date: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})

export const projectsSchema = z.array(projectSchema)

export const createSchema = projectSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const updateSchema = projectSchema.partial().extend({ id: z.number().int().positive() })

export const projectsQueryInput = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id.asc', 'id.desc', 'createdAt.asc', 'createdAt.desc']).default('id.desc'),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  authorId: z.string().transform(val => Number(val)).optional(),
})

export type ImageSlide = z.infer<typeof imageSlideSchema>
export type VideoSlide = z.infer<typeof videoSlideSchema>
export type MediaSlide = z.infer<typeof mediaSlideSchema>
export type Project = z.infer<typeof projectSchema>
export type ProjectsQuery = z.infer<typeof projectsQueryInput>
