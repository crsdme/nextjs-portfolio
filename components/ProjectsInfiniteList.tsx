'use client'

import type { Project } from '@/modules/projects/validation'
import { useInfiniteQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Lightbox } from '@/components/'
import { useLightboxPathRouting } from '@/lib/hooks/use-lightbox-routing'
import { extractDriveFileId } from '@/lib/url'
import { Skeleton } from './ui'

interface ListResponse {
  items: Project[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
}

export function ProjectsInfiniteList({
  author,
  q = '',
  pageSize = 20,
  page = 1,
}: { q?: string, pageSize?: number, author?: any, page?: number }) {
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '400px 0px',
  })

  const baseParams = useMemo(() => ({
    q,
    pageSize,
    sort: 'id.desc',
    authorId: author?.id ? String(author.id) : undefined,
  }), [q, pageSize, author?.id])

  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ListResponse>({
    queryKey: ['projects-infinite', baseParams],
    initialPageParam: page,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            ...baseParams,
            page: String(pageParam),
          }).filter(([_, v]) => v !== undefined && v !== ''),
        ) as Record<string, string>,
      )

      const r = await fetch(`/api/projects?${params.toString()}`, { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    getNextPageParam: (lastPage) => {
      const hasNext = lastPage.total > lastPage.page * lastPage.pageSize
      return hasNext ? lastPage.page + 1 : undefined
    },
    staleTime: 0,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const items = useMemo(() => data?.pages.flatMap(p => p.items) ?? [], [data])

  const [active, setActive] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const { openAt, close } = useLightboxPathRouting<any>({
    data: items,
    basePath: author ? `/${author.slug}` : '/projects',
    isOpen,
    setIsOpen,
    active,
    setActive,
    index,
    setIndex,
  })

  if (status === 'pending') {
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

  if (status === 'error') {
    return (
      <div className="p-2">
        Ошибка:
        {' '}
        {(error as Error).message}
      </div>
    )
  }

  return (
    <div className="px-2 pb-2 sm:px-4 sm:pb-4 max-w-7xl mx-auto">
      <div
        className="grid grid-flow-dense gap-2
          sm:grid-cols-2 lg:grid-cols-3
          auto-rows-[14rem] sm:auto-rows-[12rem] lg:auto-rows-[14rem] sm:gap-4"
      >
        {items.map((p) => {
          const cover = pickCardCover(p)
          return (
            <button
              key={p.id}
              onClick={() => openAt(p, 0)}
              className="group relative block overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 cursor-zoom-in opacity-90 hover:opacity-100 transition-opacity duration-200"
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

      <div ref={loadMoreRef} />

      {isFetchingNextPage && (
        <div className="py-3 text-sm text-neutral-400">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-62 w-full bg-neutral-700" />
          ))}
        </div>
      )}
    </div>
  )
}

function pickCardCover(p: Project) {
  const firstImg = (p.slides || []).find(s => s.type === 'image') as any
  if (firstImg) {
    return {
      src: firstImg.src as string,
      alt: firstImg.alt as string | undefined,
      width: firstImg.width,
      height: firstImg.height,
      type: firstImg.type,
    }
  }

  const firstVid = (p.slides || []).find(s => s.type === 'video') as any
  if (firstVid?.src)
    return { src: firstVid.src as string, alt: p.title, type: firstVid.type }

  return null
}
