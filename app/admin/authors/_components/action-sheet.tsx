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
        <SheetTrigger asChild>
          <Button onClick={openModal}>Создать автора</Button>
        </SheetTrigger>
        <SheetContent className="w-[700px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedAuthor.id ? 'Редактировать автора' : 'Создать автора'}</SheetTitle>
          </SheetHeader>
          <AuthorsForm />
          <SheetFooter>
            <div className="flex flex-col items-center gap-2 w-full">
              <Button variant="outline" onClick={closeModal} className="w-full">Отмена</Button>
              <Button type="submit" form="author-form" className="w-full">Сохранить</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
