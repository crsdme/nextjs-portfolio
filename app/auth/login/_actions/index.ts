'use server'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schemas/users'
import { clearAuthCookie, setAuthCookie, signToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
})

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'Неверные данные формы' as const }
  }
  const { email, password } = parsed.data

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user)
    return { ok: false, error: 'Неверная почта или пароль' as const }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok)
    return { ok: false, error: 'Неверная почта или пароль' as const }

  const token = await signToken({ sub: String(user.id), email: user.email, role: user.role as any })
  await setAuthCookie(token)

  redirect('/admin')
}

export async function logoutAction() {
  clearAuthCookie()
  redirect('/login')
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') ?? 'editor',
  })
  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const }

  const { email, password, role } = parsed.data
  const hash = await bcrypt.hash(password, 10)

  // упадёт по unique(email), если уже существует — отлови, если нужно
  await db.insert(users).values({ email, passwordHash: hash, role })

  // сразу логиним
  const token = await signToken({ sub: String(0), email, role }) // sub можно получить select'ом, если надо
  await setAuthCookie(token)

  redirect('/admin')
}
