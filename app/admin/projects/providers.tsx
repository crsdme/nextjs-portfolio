'use client'

import type { Row, Table } from '@tanstack/react-table'
import type { UseFormReturn } from 'react-hook-form'
import type { UseOffsetPaginationReturn } from '@/lib/hooks/use-offset-pagination'
import type { Author } from '@/modules/authors/validation'
import type { Tag } from '@/modules/projects/schema'
import type { Project } from '@/modules/projects/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'

import { format } from 'date-fns'
import { Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge, Button } from '@/components/ui'
import { useOffsetPagination } from '@/lib/hooks/use-offset-pagination'
import { extractDriveFileId } from '@/lib/url'
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
  pagination: UseOffsetPaginationReturn
  table: Table<any>
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
  const [paginationTotal, setPaginationTotal] = useState(0)
  const [selectedProject, setSelectedProject] = useState<Project>(defaultProject)
  const queryClient = useQueryClient()

  const pagination = useOffsetPagination({
    initialPage: 1,
    initialPageSize: 10,
    total: paginationTotal,
  })

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
    queryKey: ['projects', { q: '', page: pagination.page, pageSize: pagination.pageSize }],
    queryFn: async () => {
      const r = await fetch(`/api/projects?page=${pagination.page}&pageSize=${pagination.pageSize}`, { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

  useEffect(() => {
    setPaginationTotal(projects?.total || 0)
  }, [projects?.total])

  const { data: authors } = useQuery({
    queryKey: ['authors', { q: '', page: 1, pageSize: 100 }],
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

  const columns = [
    {
      header: '',
      accessorKey: 'slides',
      cell: ({ row }: { row: Row<Project> }) => {
        if (!row.original.slides?.[0]?.src)
          return <div className="h-16 w-16 rounded-full bg-neutral-700" />

        return (
          <Image
            src={`/api/image/thumb?id=${extractDriveFileId(row.original.slides?.[0]?.src)}&w=40`}
            alt={row.original.title}
            width={64}
            height={64}
            className="object-cover rounded-sm w-16 h-16"
          />
        )
      },
    },
    {
      header: 'Название',
      accessorKey: 'title',
    },
    {
      header: 'Автор',
      accessorKey: 'author',
      cell: ({ row }: { row: Row<Project> }) => (
        <div className="text-sm text-muted-foreground">
          <Badge variant="outline">{authors?.items.find((author: Author) => author.id === row.original.authorId)?.name || '-'}</Badge>
        </div>
      ),
    },
    {
      header: 'Теги',
      accessorKey: 'tags',
      cell: ({ row }: { row: Row<Project> }) => {
        return (
          <div className="flex items-center gap-2">
            {row.original.tags?.map((tag: Tag) => (
              <Badge key={tag.url} variant="outline">
                {tag.label}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      header: 'Статус',
      accessorKey: 'status',
      cell: ({ row }: { row: Row<Project> }) => {
        return (
          <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
            {row.original.status === 'active' ? 'Активный' : 'Неактивный'}
          </Badge>
        )
      },
    },
    {
      header: 'Создано',
      accessorKey: 'createdAt',
      cell: ({ row }: { row: Row<Project> }) => {
        return (
          <div className="text-sm text-muted-foreground">
            {row.original.date ? format(row.original.date, 'dd.MM.yyyy') : '-'}
          </div>
        )
      },
    },
    {
      header: '',
      accessorKey: 'actions',
      cell: ({ row }: { row: Row<Project> }) => {
        return (
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => onEdit(row.original.id || 0)}>
              <Edit className="size-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={() => handleSubmitDelete(row.original.id || 0)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: projects?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const value = useMemo<ProjectsPageContextValue>(
    () => ({
      projects: projects?.items || [],
      authors: authors?.items || [],
      pagination,
      table,
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
      pagination,
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
