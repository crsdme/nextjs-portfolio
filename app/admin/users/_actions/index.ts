'use server'

import type { UserCreate, UserUpdate } from '@/modules/users/validation'
import { createUser, deleteUser, updateUser } from '@/modules/users/service'
import { createUserSchema, updateUserSchema } from '@/modules/users/validation'

export async function createUserAction(value: UserCreate) {
  const parsed = createUserSchema.safeParse(value)

  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const, errors: parsed }

  await createUser(parsed.data)
  return { ok: true }
}

export async function editUserAction(id: number, value: UserUpdate) {
  const parsed = updateUserSchema.safeParse({ ...value, id })
  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const, errors: parsed }
  await updateUser(parsed.data)
  return { ok: true }
}

export async function deleteUserAction(id: number) {
  await deleteUser(id)
  return { ok: true }
}
