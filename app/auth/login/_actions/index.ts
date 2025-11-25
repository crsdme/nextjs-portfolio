'use server'

import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/db'
import { clearAuthCookie, setAuthCookie, signToken } from '@/lib/auth'
import { users } from '@/modules/users/schema'

const loginSchema = z.object({
  login: z.string().min(1, 'Укажите логин'),
  password: z.string().min(6),
})

const registerSchema = z.object({
  login: z.string().min(1, 'Укажите логин'),
  password: z.string().min(6),
  accesses: z.array(z.number()).default([]),
  authors: z.array(z.number()).default([]),
})

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    login: formData.get('login'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { ok: false, error: 'Неверные данные формы' as const }
  }
  const { login, password } = parsed.data

  const user = await db.query.users.findFirst({ where: eq(users.login, login) })
  if (!user)
    return { ok: false, error: 'Такого логина не существует' as const }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok)
    return { ok: false, error: 'Неверный пароль' as const }

  const token = await signToken({ sub: String(user.id), login: user.login, accesses: user.accesses as any })
  await setAuthCookie(token)

  redirect('/admin')
}

export async function logoutAction() {
  await clearAuthCookie()
  redirect('/')
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    login: formData.get('login'),
    password: formData.get('password'),
    accesses: formData.get('accesses') ?? [],
    authors: formData.get('authors') ?? [],
  })
  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const }

  const { login, password, accesses, authors } = parsed.data
  const hash = await bcrypt.hash(password, 10)

  await db.insert(users).values({ login: login as string, passwordHash: hash, accesses: accesses as any, authors: authors as any })

  const token = await signToken({ sub: String(0), login, accesses: accesses as any })
  await setAuthCookie(token)

  redirect('/admin')
}
