import { z } from 'zod'

export const imageSlideSchema = z.object({
  id: z.string().optional(),
  type: z.literal('image'),
  src: z.string().url('Нужен URL изображения'),
  alt: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})

export const videoSlideSchema = z.object({
  id: z.string().optional(),
  type: z.literal('video'),
  kind: z.enum(['youtube', 'vimeo', 'mp4']),
  src: z.string().url('Нужен URL видео'),
  poster: z.string().url().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  controls: z.boolean().optional().default(true),
  startSeconds: z.number().int().min(0).optional(),
})

export const mediaSlideSchema = z.discriminatedUnion('type', [
  imageSlideSchema,
  videoSlideSchema,
])

const coverByRefSchema = z.union([
  z.object({ by: z.literal('index'), index: z.number().int().min(0) }),
  z.object({ by: z.literal('id'), id: z.string().min(1) }),
])

export const coverSchema = z.union([
  coverByRefSchema,
  imageSlideSchema,
  videoSlideSchema,
]).optional()

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Укажите название'),
  subtitle: z.string().optional(),
  description: z.string().min(1, 'Укажите описание'),
  status: z.enum(['active', 'inactive']).default('active'),
  slides: z.array(mediaSlideSchema).min(1, 'Добавьте хотя бы один слайд'),
  cover: coverSchema,
  tags: z.array(z.string()).min(1, 'Укажите теги'),
  date: z.string().datetime().optional(),
})
  .superRefine((val, ctx) => {
    if (!val.cover)
      return

    const slides = val.slides

    if ('by' in val.cover) {
      if (val.cover.by === 'index') {
        if (val.cover.index < 0 || val.cover.index >= slides.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'cover.index указывает вне диапазона slides',
            path: ['cover', 'index'],
          })
        }
      }
      // else if (val.cover.by === 'id') {
      //   const ok = slides.some(s => s.id && s.id === val.cover?.id)
      //   if (!ok) {
      //     ctx.addIssue({
      //       code: z.ZodIssueCode.custom,
      //       message: 'cover.id не найден среди slides',
      //       path: ['cover', 'id'],
      //     })
      //   }
      // }
    }
  })

export const projectsSchema = z.array(projectSchema)

export const createSchema = projectSchema

export const updateSchema = projectSchema

export const projectsQueryInput = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id.asc', 'id.desc', 'createdAt.asc', 'createdAt.desc']).default('id.desc'),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
})

export type ImageSlide = z.infer<typeof imageSlideSchema>
export type VideoSlide = z.infer<typeof videoSlideSchema>
export type MediaSlide = z.infer<typeof mediaSlideSchema>
export type Project = z.infer<typeof projectSchema>
