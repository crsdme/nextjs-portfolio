import { ProjectsInfiniteList } from '@/components/ProjectsInfiniteList'
import { ProjectsListServer } from '@/components/ProjectsListServer'

export default async function Home() {
  return (
    <>
      <ProjectsListServer pageSize={24} page={1} />
      <ProjectsInfiniteList pageSize={24} page={2} />
    </>
  )
}
