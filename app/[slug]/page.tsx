import { notFound } from 'next/navigation'
import { AuthorsClientList, ProjectsClientList } from '@/components/'
import { getBySlug } from './_actions'

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await getBySlug(params.slug)
  if (!author)
    notFound()

  return (
    <>
      <AuthorsClientList />
      <ProjectsClientList />
    </>
  )
}
