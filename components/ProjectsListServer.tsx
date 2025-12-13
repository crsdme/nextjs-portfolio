import type { Project } from '@/modules/projects/validation'
import { ProjectService } from '@/modules/projects'
import { ProjectsList } from './ProjectsList'

interface ListResponse {
  items: Project[]
  total: number
  page: number
  pageSize: number
  hasNext?: boolean
}

async function fetchProjects({
  page = 1,
  pageSize = 20,
  authorId,
}: { page?: number, pageSize?: number, authorId?: number }): Promise<ListResponse> {
  const { items, total } = await ProjectService.listProjects({
    page,
    pageSize,
    sort: 'id.desc',
    authorId,
  })

  return {
    items: items as any,
    total,
    page,
    pageSize,
    hasNext: total > pageSize,
  }
}

export async function ProjectsListServer({
  author,
  page = 1,
  pageSize = 12,
}: { author?: any, page?: number, pageSize?: number }) {
  const data = await fetchProjects({ page, pageSize, authorId: author?.id })

  return <ProjectsList author={author} data={data} />
}
