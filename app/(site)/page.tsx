import { ProjectsInfiniteList } from '@/components/ProjectsInfiniteList'
import { ProjectsListServer } from '@/components/ProjectsListServer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <>
      <ProjectsListServer pageSize={24} page={1} />
      <ProjectsInfiniteList pageSize={24} page={2} />
    </>
  )
}
