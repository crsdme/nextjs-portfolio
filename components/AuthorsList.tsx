'use client'

import type { Author } from '@/modules/authors/validation'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface ListResponse {
  items: Author[]
  total: number
  page: number
  pageSize: number
  hasNext?: boolean
}

export function AuthorsClientList({
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
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div className="p-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-md bg-neutral-900 px-6 py-4"
          >
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
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
    <div className="p-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {data.items.map(author => (
        <div
          key={author.id}
          className="flex items-center gap-4 rounded-md bg-neutral-900 px-6 py-4"
        >
          {author.avatarUrl
            ? (
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              )
            : (
                <div className="h-16 w-16 rounded-full bg-neutral-700" />
              )}
          <div>
            <h3 className="text-lg font-semibold text-white">{author.name}</h3>
            {author.bio && (
              <p className="text-sm text-neutral-400 line-clamp-1">{author.bio}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
