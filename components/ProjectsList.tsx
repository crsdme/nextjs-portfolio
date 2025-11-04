'use client'

import type { Author } from '@/modules/authors/validation'
import type { Project } from '@/modules/projects/validation'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { Lightbox } from '@/components/'
import { useLightboxPathRouting } from '@/lib/hooks/use-lightbox-routing'
import { extractDriveFileId } from '@/lib/url'
import { Avatar, AvatarFallback, AvatarImage, Badge, Skeleton } from './ui/'

interface ListResponse {
  items: Project[]
  total: number
  page: number
  pageSize: number
  hasNext?: boolean
}

interface ListResponse {
  items: Project[]
  total: number
  page: number
  pageSize: number
  hasNext?: boolean
}

export function ProjectsClientList({
  author,
  q = '',
  page = 1,
  pageSize = 20,
}: { q?: string, page?: number, pageSize?: number, author: any }) {
  const params = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize), sort: 'id.desc', authorId: String(author.id) })

  const { data, isLoading, isError } = useQuery<ListResponse>({
    queryKey: ['projects', { q, page, pageSize, sort: 'id.desc', authorId: author.id }],
    queryFn: async () => {
      const r = await fetch(`/api/projects?${params}`, { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

  const [active, setActive] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const { openAt, close } = useLightboxPathRouting<any>({
    data: data?.items,
    authorSlug: author.slug,
    isOpen,
    setIsOpen,
    active,
    setActive,
    index,
    setIndex,
  })

  if (isLoading) {
    return (
      <div className="px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-62 w-full bg-neutral-700" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data)
    return <div className="p-2">Ошибка</div>

  return (
    <div className="px-4">
      <div className="grid grid-flow-dense gap-4
        sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        auto-rows-[10rem] sm:auto-rows-[12rem] lg:auto-rows-[14rem]"
      >
        {author && <AuthorInfo author={author} />}
        {data.items.map((p) => {
          const cover = pickCardCover(p)
          return (
            <button
              key={p.id}
              onClick={() => openAt(p, 0)}
              className="
              group relative block overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 cursor-zoom-in opacity-90
              hover:opacity-100 transition-opacity duration-200"
              aria-label={p.title}
            >
              {cover
                ? (
                    <Image
                      src={`/api/image/thumb?id=${extractDriveFileId(cover.src)}&w=500`}
                      alt={cover.alt ?? p.title}
                      width={cover.width ?? 1200}
                      height={cover.height ?? 800}
                      className="h-full w-full object-cover transition group-hover:scale-102"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                  )
                : (
                    <div className="flex h-62 w-full items-center justify-center bg-[#1a1a1a] text-neutral-600">
                      No image
                    </div>
                  )}
            </button>
          )
        })}
      </div>

      <Lightbox
        project={active as any}
        open={isOpen}
        index={index}
        onClose={close}
        onSlideChange={setIndex}
      />
    </div>
  )
}

function AuthorInfo({ author }: { author: Author }) {
  return (
    <button
      className="
      group relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900
      opacity-95 hover:opacity-100 transition-opacity
      col-span-1 row-span-2"
    >
      <div className="flex flex-col w-full items-center justify-center text-neutral-200 px-6 py-8">
        <Avatar className="h-24 w-24 rounded-full object-cover">
          <AvatarImage src={`/api/image/thumb?id=${extractDriveFileId(author.avatarUrl)}&w=96`} alt={author.name} />
          <AvatarFallback className="rounded-full">UR</AvatarFallback>
        </Avatar>
        <div className="text-xl font-semibold mb-1">{author.name}</div>
        <div className="text-base text-neutral-400 mb-3">{author.description}</div>
        <div className="flex gap-3 mt-2 mb-8">
          {(author.socials || []).map(soc => (
            <Badge
              key={soc.url}
              variant="secondary"
              asChild
            >
              <a href={soc.url} target="_blank" rel="noopener noreferrer">
                {soc.label}
              </a>
            </Badge>
          ))}
        </div>
      </div>
    </button>
  )
}

function pickCardCover(p: Project) {
  const firstImg = (p.slides || []).find(s => s.type === 'image') as any
  if (firstImg)
    return { src: firstImg.src as string, alt: firstImg.alt as string | undefined, width: firstImg.width, height: firstImg.height, type: firstImg.type }
  const firstVid = (p.slides || []).find(s => s.type === 'video') as any
  if (firstVid.src)
    return { src: firstVid.src as string, alt: p.title, type: firstVid.type }
  return null
}
