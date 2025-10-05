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
import { projects } from '@/db/schemas/projects'
import 'server-only'

export function create(value: projectValidation.Project) {
  return db.insert(projects).values(value).returning()
}

export function update(id: number, value: projectValidation.Project) {
  return db.update(projects).set(value).where(eq(projects.id, id)).returning()
}

export function remove(id: number) {
  return db.delete(projects).where(eq(projects.id, id)).returning()
}

export async function list(p: projectValidation.ProjectsQuery = {
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
    ilikeAny(normalizeQ(p.query), [projects.title, projects.description]),
    dateRange(projects.createdAt, p.createdFrom, p.createdTo),
  )

  const items = await db.select().from(projects).where(where).orderBy(orderByFromSort(p.sort, {
    id: projects.id,
    createdAt: projects.createdAt,
  }, 'id', 'desc')).limit(pageSize).offset((page - 1) * pageSize)

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(projects)
    .where(where)

  const total = Number(count)
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return { items, page, pageSize, total, pages, hasPrev: page > 1, hasNext: page < pages, sort: p.sort }
}
