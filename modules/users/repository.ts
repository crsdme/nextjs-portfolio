import type * as projectValidation from './validation'
import type { SortKey } from '@/db/helpers'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  andAll,
  dateRange,
  ilikeAny,
  normalizeQ,
  orderByFromSort,
} from '@/db/helpers'
import { projects } from '@/db/schemas'
import 'server-only'

export interface ProjectsQuery {
  query?: string
  page?: number
  pageSize?: number
  sort?: SortKey & ('id.asc' | 'id.desc' | 'createdAt.asc' | 'createdAt.desc')
  createdFrom?: Date
  createdTo?: Date
}

function buildWhere(p: ProjectsQuery) {
  return andAll(
    ilikeAny(normalizeQ(p.query), [products.title]),
    dateRange(products.createdAt, p.createdFrom, p.createdTo),
  )
}

function buildOrder(sort: NonNullable<ProjectsQuery['sort']>) {
  return orderByFromSort(sort, {
    id: products.id,
    price: products.price,
    createdAt: products.createdAt,
  }, 'id', 'desc')
}

export function create(value: projectValidation.Project) {
  return db.insert(products).values(value).returning()
}

export function update(id: string, value: projectValidation.Project) {
  return db.update(products).set(value).where(eq(products.id, id)).returning()
}

export function remove(id: string) {
  return db.delete(products).where(eq(products.id, id)).returning()
}

export async function list(p: ProjectsQuery = {}) {
  const page = Math.max(1, p.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, p.pageSize ?? 20))
  const where = buildWhere(p)

  const items = await db.select().from(products).where(where).orderBy(buildOrder(p.sort ?? 'id.desc')).limit(pageSize).offset((page - 1) * pageSize)

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(products)
    .where(where)

  const total = Number(count)
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return { items, page, pageSize, total, pages, hasPrev: page > 1, hasNext: page < pages, sort: p.sort ?? 'id.desc' }
}
