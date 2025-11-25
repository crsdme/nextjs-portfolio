import {
  Button,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/'
import { useUsersPageContext } from '../providers'
import { UsersForm } from './form'

export function UsersActionSheet() {
  const {
    setIsOpen,
    isOpen,
    openModal,
    closeModal,
    selectedUser,
  } = useUsersPageContext()

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="text-sm text-muted-foreground">Создание, редактирование и удаление пользователей</p>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button onClick={openModal}>Создать пользователя</Button>
        </SheetTrigger>
        <SheetContent className="w-[700px]">
          <SheetHeader>
            <SheetTitle>{selectedUser.id ? 'Редактировать пользователя' : 'Создать пользователя'}</SheetTitle>
          </SheetHeader>
          <UsersForm />
          <SheetFooter>
            <div className="flex flex-col items-center gap-2 w-full">
              <Button variant="outline" onClick={closeModal} className="w-full">Отмена</Button>
              <Button type="submit" form="user-form" className="w-full">Сохранить</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
