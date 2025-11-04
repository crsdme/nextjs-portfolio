'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { Author } from '@/modules/authors/validation'
import type { Project } from '@/modules/projects/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { z } from 'zod'
import { createProjectAction, deleteProjectAction, editProjectAction } from './_actions'

const imageSlideSchema = z.object({
  type: z.literal('image'),
  caption: z.string().optional(),
  description: z.string().optional(),
  src: z.string(),
})

const videoSlideSchema = z.object({
  type: z.literal('video'),
  caption: z.string().optional(),
  description: z.string().optional(),
  src: z.string(),
})

const mediaSlideSchema = z.discriminatedUnion('type', [
  imageSlideSchema,
  videoSlideSchema,
])

const tagsSchema = z.object({
  label: z.string().min(1, 'Укажите label'),
  url: z.string(),
})

const formSchema = z.object({
  authorId: z.number().int().positive(),
  title: z.string().min(3, { message: 'Имя должно быть не менее 3 символов' }).trim(),
  subtitle: z.string().min(3, { message: 'Описание должно быть не менее 3 символов' }).trim(),
  tags: z.array(tagsSchema).optional(),
  status: z.enum(['active', 'inactive']),
  slides: z.array(mediaSlideSchema).min(1, 'Добавьте хотя бы один слайд'),
  slug: z.string().min(3, { message: 'Slug должно быть не менее 3 символов' }).trim(),
  date: z.date().optional(),
})

type ProjectForm = z.infer<typeof formSchema>

export const ProjectsPageContext = createContext<ProjectsPageContextValue | null>(null)

export interface ProjectsPageContextValue {
  projects: Project[]
  authors: Author[]
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  handleSubmitDelete: (v: number) => void
  onEdit: (v: number) => void
  isLoading: boolean
  form: UseFormReturn<ProjectForm>
  selectedProject: Project
  handleSubmit: (v: ProjectForm) => void
  openModal: () => void
  closeModal: () => void
}

const defaultProject: Project = {
  id: 0,
  authorId: 0,
  title: '',
  subtitle: '',
  tags: [],
  status: 'active',
  slides: [],
  slug: '',
  date: undefined,
}

export function ProjectsPageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project>(defaultProject)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      authorId: 0,
      title: '',
      subtitle: '',
      tags: [],
      status: 'active',
      slides: [],
      slug: '',
      date: undefined,
    },
    shouldUnregister: false,
  })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', { q: '', page: 1, pageSize: 10 }],
    queryFn: async () => {
      const r = await fetch('/api/projects', { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

  const { data: authors } = useQuery({
    queryKey: ['authors', { q: '', page: 1, pageSize: 10 }],
    queryFn: async () => {
      const r = await fetch('/api/authors', { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

  const onEdit = (id: number) => {
    if (!id)
      return

    const project = projects?.items.find((project: Project) => project.id === id) || defaultProject
    setSelectedProject({ ...project, id })
    form.reset({
      authorId: project.authorId,
      title: project.title,
      subtitle: project.subtitle,
      tags: project.tags ?? [],
      status: project.status ?? 'active',
      slides: project.slides ?? [],
      slug: project.slug,
      date: project.date ? new Date(project.date) : undefined,
    })
    setIsOpen(true)
  }

  const handleSubmitCreate = async (value: Project) => {
    const res = await createProjectAction(value)
    if (res.ok) {
      toast.success('Автор успешно создан')
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
    else {
      toast.error('Не удалось создать проект')
    }
    setSelectedProject(defaultProject)
  }

  const handleSubmitEdit = async (value: ProjectForm) => {
    const res = await editProjectAction(selectedProject?.id || 0, value)
    if (res.ok) {
      toast.success('Автор успешно обновлен')
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
    else {
      toast.error('Не удалось обновить проект')
    }
    setSelectedProject(defaultProject)
  }

  const handleSubmitDelete = async (id: number) => {
    const res = await deleteProjectAction(id)
    if (res.ok) {
      toast.success('Проект успешно удален')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
    else {
      toast.error('Не удалось удалить проект')
    }
  }

  const handleSubmit = (value: ProjectForm) => {
    if (selectedProject.id) {
      handleSubmitEdit(value)
    }
    else {
      handleSubmitCreate(value)
    }
  }

  const openModal = () => {
    setIsOpen(true)
    setSelectedProject(defaultProject)
    form.reset(defaultProject)
    form.clearErrors()
  }

  const closeModal = () => {
    setIsOpen(false)
    form.reset(defaultProject)
    form.clearErrors()
    setSelectedProject(defaultProject)
  }

  const value = useMemo<ProjectsPageContextValue>(
    () => ({
      projects: projects?.items || [],
      authors: authors?.items || [],
      setIsOpen,
      isOpen,
      openModal,
      closeModal,
      form,
      handleSubmit,
      selectedProject,
      handleSubmitDelete,
      onEdit,
      isLoading,
    }),
    [
      projects?.items,
      setIsOpen,
      isOpen,
      openModal,
      closeModal,
      form,
      selectedProject,
      handleSubmit,
      handleSubmitDelete,
      onEdit,
      isLoading,
    ],
  )

  return (
    <ProjectsPageContext.Provider value={value}>
      {children}
    </ProjectsPageContext.Provider>
  )
}

export function useProjectsPageContext() {
  const ctx = useContext(ProjectsPageContext)
  if (!ctx)
    throw new Error('useProjectsPage must be used within <ProjectsPageProvider>')
  return ctx
}

export default ProjectsPageProvider
