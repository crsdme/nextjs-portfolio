import type * as userValidation from './validation'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  andAll,
  dateRange,
  ilikeAny,
  normalizeQ,
  orderByFromSort,
} from '@/db/helpers'
import { users } from '@/db/schemas'
import 'server-only'

export async function create(value: userValidation.UserCreate) {
  return db.insert(users).values(value).returning()
}

export function update(id: number, value: userValidation.UserUpdate) {
  return db.update(users).set(value).where(eq(users.id, id)).returning()
}

export function remove(id: number) {
  return db.delete(users).where(eq(users.id, id)).returning()
}

export function findByLogin(login: string) {
  return db.select().from(users).where(eq(users.login, login))
}

export async function list(p: userValidation.UsersQuery = {
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
    ilikeAny(normalizeQ(p.query), [users.login]),
    dateRange(users.createdAt, p.createdFrom, p.createdTo),
  )

  const items = await db.select().from(users).where(where).orderBy(orderByFromSort(p.sort, {
    id: users.id,
    createdAt: users.createdAt,
  }, 'id', 'desc')).limit(pageSize).offset((page - 1) * pageSize)

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(users)
    .where(where)

  const total = Number(count)
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return { items, page, pageSize, total, pages, hasPrev: page > 1, hasNext: page < pages, sort: p.sort }
}
