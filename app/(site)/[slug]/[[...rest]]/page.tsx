import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HeaderAuthor } from '@/components/HeaderAuthor'
import { ProjectsInfiniteList } from '@/components/ProjectsInfiniteList'
import { ProjectsListServer } from '@/components/ProjectsListServer'
import * as actions from './_actions'

interface RouteParams { slug: string, rest?: string[] }

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params
  const author = await actions.getAuthorCached(slug)

  if (!author) {
    return {
      title: 'Portfolio',
      description: 'Portfolio',
    }
  }

  return {
    title: `${author.name}`,
    description: `${author.description ?? ''}`,
    openGraph: {
      type: 'website',
      url: '/',
      title: `${author.name}`,
      description: `${author.description ?? ''}`,
      siteName: 'Portfolio',
      images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Portfolio' }],
    },
  }
}

export default async function AuthorPage({ params }: { params: RouteParams }) {
  const { slug } = await params

  const author = await actions.getAuthorCached(slug)
  if (!author && slug !== 'projects')
    notFound()

  return (
    <>
      {/* <div className="flex flex-wrap gap-2 p-2 sm:gap-4 sm:p-4 max-w-7xl mx-auto"> */}
      <HeaderAuthor author={author} />
      {/* </div> */}
      <ProjectsListServer pageSize={24} page={1} author={author} />
      <ProjectsInfiniteList pageSize={24} page={2} author={author} />
    </>
  )
}
