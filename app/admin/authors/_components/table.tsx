import { Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Skeleton,
} from '@/components/ui'
import { extractDriveFileId } from '@/lib/url'
import { useAuthorsPageContext } from '../providers'

export function AuthorsTable() {
  const {
    authors,
    handleSubmitDelete,
    onEdit,
    isLoading,
  } = useAuthorsPageContext()

  if (isLoading) {
    return (
      <div className="p-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (authors.length === 0) {
    return (
      <div className="p-6">
        <p>Авторы не найдены</p>
      </div>
    )
  }

  return (
    <div>
      <ItemGroup className="gap-4">
        {authors.map(author => (
          <Item key={author.name} variant="outline" role="listitem">
            <ItemMedia variant="image">
              {author.avatarUrl
                ? (
                    <Image
                      src={`/api/image/thumb?id=${extractDriveFileId(author.avatarUrl)}&w=32`}
                      alt={author.name}
                      width={32}
                      height={32}
                      className="object-cover grayscale"
                    />
                  )
                : (
                    <div className="h-16 w-16 rounded-full bg-neutral-700" />
                  )}
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                {author.name}
              </ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button size="icon" variant="outline" onClick={() => onEdit(author.id || 0)}>
                <Edit />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => handleSubmitDelete(author.id || 0)}>
                <Trash2 />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
