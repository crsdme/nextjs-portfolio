import type * as authorValidation from './validation'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  andAll,
  dateRange,
  ilikeAny,
  normalizeQ,
  orderByFromSort,
} from '@/db/helpers'
import { authors } from '@/db/schemas'
import 'server-only'

export function create(value: authorValidation.AuthorCreate) {
  return db.insert(authors).values(value).returning()
}

export function update(id: number, value: authorValidation.AuthorUpdate) {
  return db.update(authors).set(value).where(eq(authors.id, id)).returning()
}

export function remove(id: number) {
  return db.delete(authors).where(eq(authors.id, id)).returning()
}

export async function list(p: authorValidation.AuthorsQuery = {
  page: 1,
  pageSize: 20,
  sort: 'id.desc',
  query: '',
  createdFrom: undefined,
  createdTo: undefined,
}) {
  const page = Math.max(1, p.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, p.pageSize ?? 20))

  const where = andAll(
    ilikeAny(normalizeQ(p.query), [authors.name, authors.description]),
    dateRange(authors.createdAt, p.createdFrom, p.createdTo),
  )

  const items = await db.select().from(authors).where(where).orderBy(orderByFromSort(p.sort, {
    id: authors.id,
    createdAt: authors.createdAt,
  }, 'id', 'desc')).limit(pageSize).offset((page - 1) * pageSize)

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(authors)
    .where(where)

  const total = Number(count)
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return { items, page, pageSize, total, pages, hasPrev: page > 1, hasNext: page < pages, sort: p.sort }
}

export async function findBySlug(slug: string) {
  return db.query.authors.findFirst({
    where: eq(authors.slug, slug),
  })
}
