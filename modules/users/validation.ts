import { z } from 'zod'

export const userSchema = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1, 'Укажите логин'),
  passwordHash: z.string().min(1, 'Укажите пароль'),
  accesses: z.array(z.string()).default([]),
  authors: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const usersSchema = z.array(userSchema)

export const createUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const updateUserSchema = userSchema.partial().extend({ id: z.number().int().positive() })

export const usersQueryInput = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['id.asc', 'id.desc', 'createdAt.asc', 'createdAt.desc']).default('id.desc'),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
})

export type UserUpdate = z.infer<typeof updateUserSchema>
export type UserCreate = z.infer<typeof createUserSchema>
export type User = z.infer<typeof userSchema>
export type UsersQuery = z.infer<typeof usersQueryInput>
