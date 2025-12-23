import type { Author } from '@/modules/authors/validation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/'
import { extractDriveFileId } from '@/lib/url'
import { AuthorService } from '@/modules/authors'

interface ListResponse {
  items: Author[]
  total: number
  page: number
  pageSize: number
  hasNext?: boolean
}

async function fetchAuthors({
  page = 1,
  pageSize = 20,
}: { page?: number, pageSize?: number }): Promise<ListResponse> {
  const { items, total } = await AuthorService.listAuthors({
    page,
    pageSize,
    sort: 'id.desc',
  })

  return {
    items: items as any,
    total,
    page,
    pageSize,
    hasNext: total > pageSize,
  }
}

export async function AuthorsList({
  page = 1,
  pageSize = 20,
}: { page?: number, pageSize?: number }) {
  const data = await fetchAuthors({ page, pageSize })

  return (
    <>
      {data.items.map(author => (
        <div
          key={author.id}
          className="pl-0 flex-1"
        >
          <Link
            href={`/${author.slug}`}
            prefetch
            className="
                group relative flex gap-4 items-center overflow-hidden rounded-lg border border-neutral-800 bg-[#1a1a1a] p-4 opacity-90
                hover:opacity-100 transition-opacity duration-200 min-w-76 md:min-w-92"
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
              <p className="text-lg font-semibold text-white">{author.name}</p>
              {author.description && (
                <p className="text-sm text-neutral-400 line-clamp-1">{author.description}</p>
              )}
            </div>
          </Link>
        </div>
      ))}
    </>
  )
}
