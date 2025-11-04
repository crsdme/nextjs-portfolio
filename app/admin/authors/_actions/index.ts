'use server'

import type { AuthorCreate, AuthorUpdate } from '@/modules/authors/validation'
import { createAuthor, deleteAuthor, updateAuthor } from '@/modules/authors/service'
import { authorSchema, createAuthorSchema } from '@/modules/authors/validation'

export async function createAuthorAction(value: AuthorCreate) {
  const parsed = createAuthorSchema.safeParse(value)

  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const, errors: parsed }

  await createAuthor(parsed.data)
  return { ok: true }
}

export async function editAuthorAction(id: number, value: AuthorUpdate) {
  const parsed = authorSchema.safeParse({ ...value, id })
  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const, errors: parsed }
  await updateAuthor(parsed.data)
  return { ok: true }
}

export async function deleteAuthorAction(id: number) {
  await deleteAuthor(id)
  return { ok: true }
}
