'use client'

import type { Project } from '@/modules/projects/validation'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { Lightbox } from '@/components/'
import { Skeleton } from './ui/'

interface ListResponse {
  items: Project[]
  total: number
  page: number
  pageSize: number
  hasNext?: boolean
}

export function ProjectsClientList({
  q = '',
  page = 1,
  pageSize = 20,
}: { q?: string, page?: number, pageSize?: number }) {
  const params = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize), sort: 'id.desc' })

  const { data, isLoading, isError } = useQuery<ListResponse>({
    queryKey: ['projects', { q, page, pageSize, sort: 'id.desc' }],
    queryFn: async () => {
      const r = await fetch(`/api/projects?${params}`, { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

  const [active, setActive] = useState<Project | null>(null)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      </div>
    )
  }
  if (isError || !data)
    return <div className="p-6">Ошибка</div>

  return (
    <div className="p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.items.map((p) => {
          const cover = pickCardCover(p)
          return (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className="group relative block overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              aria-label={p.title}
            >
              {cover
                ? (
                    <Image
                      src={cover.src}
                      alt={cover.alt ?? p.title}
                      width={cover.width ?? 1200}
                      height={cover.height ?? 800}
                      className="h-56 w-full object-cover transition group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                  )
                : (
                    <div className="flex h-56 w-full items-center justify-center bg-neutral-800 text-neutral-500">
                      Нет изображения
                    </div>
                  )}
            </button>
          )
        })}
      </div>

      <Lightbox project={active} onClose={() => setActive(null)} />
    </div>
  )
}

/**
 *  1) cover.image
 *  2) cover.video.poster
 *  3) первый image-слайд
 *  4) poster первого video-слайда
 */
function pickCardCover(p: Project) {
  const c = p.cover as any
  if (c && c.type === 'image')
    return { src: c.src as string, alt: c.alt as string | undefined, width: c.width, height: c.height }
  if (c && c.type === 'video' && c.poster)
    return { src: c.poster as string, alt: p.title }
  const firstImg = (p.slides || []).find(s => s.type === 'image') as any
  if (firstImg)
    return { src: firstImg.src as string, alt: firstImg.alt as string | undefined, width: firstImg.width, height: firstImg.height }
  const firstVid = (p.slides || []).find(s => s.type === 'video') as any
  if (firstVid?.poster)
    return { src: firstVid.poster as string, alt: p.title }
  return null
}
