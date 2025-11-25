import { Edit, Trash2 } from 'lucide-react'
import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
  Skeleton,
} from '@/components/ui'
import { useUsersPageContext } from '../providers'

export function UsersTable() {
  const {
    users,
    handleSubmitDelete,
    onEdit,
    isLoading,
  } = useUsersPageContext()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="p-6">
        <p>Пользователи не найдены</p>
      </div>
    )
  }

  return (
    <div>
      <ItemGroup className="gap-4">
        {users.map(user => (
          <Item key={user.login} variant="outline" role="listitem">
            <ItemContent>
              <ItemTitle className="line-clamp-1">
                {user.login}
              </ItemTitle>
            </ItemContent>
            <ItemActions>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => onEdit(user.id || 0)}>
                  <Edit className="size-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleSubmitDelete(user.id || 0)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
