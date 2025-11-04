'use client'

import type { Author } from '@/modules/authors/validation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle, Avatar, AvatarFallback, AvatarImage, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/'
import { Skeleton } from '@/components/ui/skeleton'
import { extractDriveFileId } from '@/lib/url'

interface ListResponse {
  items: Author[]
  total: number
  page: number
  pageSize: number
  hasNext?: boolean
}

export function AuthorsList({
  q = '',
  page = 1,
  pageSize = 20,
}: { q?: string, page?: number, pageSize?: number }) {
  const params = new URLSearchParams({
    q,
    page: String(page),
    pageSize: String(pageSize),
    sort: 'id.desc',
  })

  const { data, isLoading, isError, error, refetch } = useQuery<ListResponse>({
    queryKey: ['authors', { q, page, pageSize, sort: 'id.desc' }],
    queryFn: async () => {
      const r = await fetch(`/api/authors?${params}`, { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  if (isLoading) {
    return (
      <div className="p-4 flex gap-4 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="group relative flex gap-4 items-center overflow-hidden rounded-lg p-2 w-full"
          >
            <Skeleton className="h-16 w-16 rounded-full bg-neutral-700" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-neutral-700" />
              <Skeleton className="h-3 w-24 bg-neutral-700" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="max-w-xl">
          <AlertTitle>Не удалось загрузить авторов</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message ?? 'Попробуйте обновить страницу или повторить позже.'}
          </AlertDescription>
        </Alert>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded bg-neutral-800 px-4 py-2 text-sm text-white"
        >
          Повторить
        </button>
      </div>
    )
  }

  return (
    <div className="relative p-4">
      <Carousel
        opts={{
          align: 'start',
          loop: false,
          containScroll: 'trimSnaps',
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0 gap-4">
          {data.items.map(author => (
            <CarouselItem
              key={author.id}
              className="pl-0 basis-[260px] sm:basis-1/3 lg:basis-1/4"
            >
              <Link
                href={`/${author.slug}`}
                prefetch
                className="
                group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
                hover:opacity-100 transition-opacity duration-200"
              >
                {author.avatarUrl
                  ? (
                      <Avatar className="h-12 w-12 rounded-full object-cover">
                        <AvatarImage src={`/api/image/thumb?id=${extractDriveFileId(author.avatarUrl)}&w=100`} alt={author.name} />
                        <AvatarFallback className="rounded-full">UR</AvatarFallback>
                      </Avatar>
                    )
                  : (
                      <div className="h-16 w-16 rounded-full bg-neutral-700" />
                    )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{author.name}</h3>
                  {author.description && (
                    <p className="text-sm text-neutral-400 line-clamp-1">{author.description}</p>
                  )}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* стрелки */}
        <CarouselPrevious variant="default" className="left-0 h-20 rounded-sm" />
        <CarouselNext variant="default" className="right-0 h-20 rounded-sm" />
      </Carousel>
    </div>
  )
}
