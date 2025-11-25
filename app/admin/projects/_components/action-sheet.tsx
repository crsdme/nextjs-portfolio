import {
  Button,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/'
import { useProjectsPageContext } from '../providers'
import { ProjectsForm } from './form'

export function ProjectsActionSheet() {
  const {
    setIsOpen,
    isOpen,
    openModal,
    closeModal,
    selectedProject,
  } = useProjectsPageContext()

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Проекты</h1>
        <p className="text-sm text-muted-foreground">Создание, редактирование и удаление проектов</p>
      </div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button onClick={openModal}>Создать проект</Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto w-[500px] sm:w-[640px]">
          <SheetHeader>
            <SheetTitle>{selectedProject.id ? 'Редактировать проект' : 'Создать проект'}</SheetTitle>
          </SheetHeader>
          <ProjectsForm />
          <SheetFooter>
            <div className="flex flex-col items-center gap-2 w-full">
              <Button variant="outline" onClick={closeModal} className="w-full">Отмена</Button>
              <Button type="submit" form="project-form" className="w-full">Сохранить</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
