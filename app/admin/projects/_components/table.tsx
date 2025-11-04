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
import { useProjectsPageContext } from '../providers'

export function ProjectsTable() {
  const {
    projects,
    handleSubmitDelete,
    onEdit,
    isLoading,
  } = useProjectsPageContext()

  if (isLoading) {
    return (
      <div className="p-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="p-6">
        <p>Проекты не найдены</p>
      </div>
    )
  }

  return (
    <div>
      <ItemGroup className="gap-4">
        {projects.map(project => (
          <Item key={project.slug} variant="outline" role="listitem">
            <ItemMedia variant="image">
              {project.slides?.[0]?.src
                ? (
                    <Image
                      src={`/api/image/thumb?id=${extractDriveFileId(project.slides?.[0]?.src)}&w=32`}
                      alt={project.title}
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
                {project.title}
              </ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button size="icon" variant="outline" onClick={() => onEdit(project.id || 0)}>
                <Edit />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => handleSubmitDelete(project.id || 0)}>
                <Trash2 />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
