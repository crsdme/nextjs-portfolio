import type * as authorValidation from './validation'
import { db } from '@/db'
import * as authorRepository from './repository'
import 'server-only'

export async function createAuthor(value: authorValidation.Author) {
  const [a] = await db.transaction(() => authorRepository.create(value))
  return a
}

export async function updateAuthor(value: authorValidation.Author) {
  if (!value.id)
    throw new Error('id обязателен')
  const [a] = await db.transaction(() => authorRepository.update(value.id!, value))
  return a
}

export async function deleteAuthor(id: number) {
  const [a] = await db.transaction(() => authorRepository.remove(id))
  return a
}

export async function listAuthors(input: authorValidation.AuthorsQuery) {
  return await authorRepository.list(input)
}

export async function getBySlug(slug: string) {
  const clean = String(slug || '').trim()
  if (!clean)
    return null
  return authorRepository.findBySlug(clean)
}
