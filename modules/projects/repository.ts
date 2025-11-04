import type * as projectValidation from './validation'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  andAll,
  dateRange,
  ilikeAny,
  normalizeQ,
  orderByFromSort,
} from '@/db/helpers'
import { projectMedia, projects } from '@/db/schemas'
import 'server-only'

export async function create(value: projectValidation.Project) {
  const { slides = [], ...projectData } = value

  const [project] = await db.insert(projects).values({ ...projectData, description: '' }).returning()

  const slidesRows = slides.length
    ? await db
        .insert(projectMedia)
        .values(slides.map(s => ({ projectId: project.id, ...s })))
        .returning()
    : []

  return { project, slides: slidesRows }
}

export async function update(id: number, value: projectValidation.Project) {
  const { slides = [], ...projectData } = value

  const [project] = await db
    .update(projects)
    .set(projectData)
    .where(eq(projects.id, id))
    .returning()

  await db.delete(projectMedia).where(eq(projectMedia.projectId, id))

  const slidesRows = slides.length
    ? await db
        .insert(projectMedia)
        .values(slides.map(s => ({ projectId: id, ...s })))
        .returning()
    : []

  return { project, slides: slidesRows }
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
  authorId: undefined,
}) {
  const page = Math.max(1, p.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, p.pageSize ?? 20))

  const where = andAll(
    ilikeAny(normalizeQ(p.query), [projects.title, projects.subtitle]),
    dateRange(projects.createdAt, p.createdFrom, p.createdTo),
    p.authorId ? eq(projects.authorId, p.authorId) : undefined,
  )

  const pm = projectMedia

  const items = await db
    .select({
      id: projects.id,
      title: projects.title,
      subtitle: projects.subtitle,
      createdAt: projects.createdAt,
      authorId: projects.authorId,
      status: projects.status,
      tags: projects.tags,
      date: projects.date,
      slug: projects.slug,
      slides: sql<any>`coalesce(
      json_agg(${pm}.*) filter (where ${pm}.id is not null),
      '[]'::json
    )`,
    })
    .from(projects)
    .leftJoin(pm, eq(pm.projectId, projects.id))
    .where(where)
    .groupBy(projects.id)
    .orderBy(orderByFromSort(p.sort, {
      id: projects.id,
      createdAt: projects.createdAt,
    }, 'id', 'desc'))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(projects)
    .where(where)

  const total = Number(count)
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return { items, page, pageSize, total, pages, hasPrev: page > 1, hasNext: page < pages, sort: p.sort }
}
