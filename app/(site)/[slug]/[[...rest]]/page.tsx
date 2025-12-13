import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
    title: `${author.name} | Portfolio`,
    description: `${author.description ?? ''}`,
    openGraph: {
      type: 'website',
      url: '/',
      title: `${author.name} | Portfolio`,
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
      <ProjectsListServer pageSize={22} page={1} author={author} />
      <ProjectsInfiniteList pageSize={22} page={2} author={author} />
    </>
  )
}
