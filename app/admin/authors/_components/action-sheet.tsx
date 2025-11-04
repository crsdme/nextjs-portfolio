import {
  Button,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/'
import { useAuthorsPageContext } from '../providers'
import { AuthorsForm } from './form'

export function AuthorsActionSheet() {
  const {
    setIsOpen,
    isOpen,
    openModal,
    closeModal,
    selectedAuthor,
  } = useAuthorsPageContext()

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Авторы</h1>
        <p className="text-sm text-muted-foreground">Создание, редактирование и удаление авторов</p>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Button onClick={openModal}>Создать автора</Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{selectedAuthor.id ? 'Редактировать автора' : 'Создать автора'}</SheetTitle>
          </SheetHeader>
          <AuthorsForm />
          <SheetFooter>
            <Button variant="outline" onClick={closeModal}>Отмена</Button>
            <Button type="submit" form="author-form">Сохранить</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
