'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminPage() {
  const { data: authors, isLoading: isLoadingAuthors } = useQuery({
    queryKey: ['authors', { q: '', page: 1, pageSize: 10 }],
    queryFn: async () => {
      const r = await fetch('/api/authors', { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', { q: '', page: 1, pageSize: 10 }],
    queryFn: async () => {
      const r = await fetch('/api/projects', { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

  const isLoading = isLoadingAuthors || isLoadingProjects

  if (isLoading) {
    return (
      <>
        <div className="flex gap-4 w-full h-full">
          <Skeleton className="h-30 w-full" />
          <Skeleton className="h-30 w-full" />
        </div>
      </>
    )
  }

  const totalAuthors = authors?.total || 0
  const totalProjects = projects?.total || 0

  return (
    <div className="flex gap-4 w-full">
      <Card className="flex flex-col gap-0 w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{totalAuthors}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Авторы
          </p>
        </CardContent>
      </Card>
      <Card className="flex flex-col gap-0 w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{totalProjects}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Проекты
          </p>
        </CardContent>
      </Card>
      <Card className="flex flex-col gap-0 w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">1</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Пользователи
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
