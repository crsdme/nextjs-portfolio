'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { Author } from '@/modules/authors/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { z } from 'zod'
import { createAuthorAction, deleteAuthorAction, editAuthorAction } from './_actions'

const formSchema = z.object({
  name: z.string().min(3, { message: 'Имя должно быть не менее 3 символов' }).trim(),
  description: z.string().min(3, { message: 'Описание должно быть не менее 3 символов' }).trim(),
  avatarUrl: z.string().min(3, { message: 'URL аватара должно быть не менее 3 символов' }).trim(),
  socials: z.array(z.object({
    label: z.string().min(3, { message: 'Название должно быть не менее 3 символов' }).trim(),
    url: z.string().min(3, { message: 'URL должно быть не менее 3 символов' }).trim(),
  })),
  slug: z.string().min(3, { message: 'Slug должно быть не менее 3 символов' }).trim(),
})

export const AuthorsPageContext = createContext<AuthorsPageContextValue | null>(null)

export interface AuthorsPageContextValue {
  authors: Author[]
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  handleSubmitDelete: (v: number) => void
  onEdit: (v: number) => void
  isLoading: boolean
  form: UseFormReturn<z.infer<typeof formSchema>>
  selectedAuthor: Author
  handleSubmit: (v: z.infer<typeof formSchema>) => void
  openModal: () => void
  closeModal: () => void
}

const defaultAuthor: Author = {
  id: 0,
  name: '',
  description: '',
  avatarUrl: '',
  socials: [],
  slug: '',
}

export function AuthorsPageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<Author>(defaultAuthor)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      avatarUrl: '',
      socials: [],
      slug: '',
    },
  })

  const { data: authors, isLoading } = useQuery({
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

    const author = authors?.items.find((author: Author) => author.id === id) || defaultAuthor
    setSelectedAuthor({ ...author, id })
    form.reset(author)
    setIsOpen(true)
  }

  const handleSubmitCreate = async (value: Author) => {
    const res = await createAuthorAction(value)

    if (res.ok) {
      toast.success('Автор успешно создан')
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    }
    else {
      toast.error('Не удалось создать автора')
    }
    setSelectedAuthor(defaultAuthor)
  }

  const handleSubmitEdit = async (value: any) => {
    const res = await editAuthorAction(selectedAuthor?.id || 0, value)
    if (res.ok) {
      toast.success('Автор успешно обновлен')
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    }
    else {
      toast.error('Не удалось обновить автора')
    }
    setSelectedAuthor(defaultAuthor)
  }

  const handleSubmitDelete = async (id: number) => {
    const res = await deleteAuthorAction(id)
    if (res.ok) {
      toast.success('Автор успешно удален')
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    }
    else {
      toast.error('Не удалось удалить автора')
    }
  }

  const handleSubmit = (value: any) => {
    if (selectedAuthor.id) {
      handleSubmitEdit(value)
    }
    else {
      handleSubmitCreate(value)
    }
  }

  const openModal = () => {
    setIsOpen(true)
    setSelectedAuthor(defaultAuthor)
    form.reset(defaultAuthor)
    form.clearErrors()
  }

  const closeModal = () => {
    setIsOpen(false)
    form.reset(defaultAuthor)
    form.clearErrors()
    setSelectedAuthor(defaultAuthor)
  }

  const value = useMemo<AuthorsPageContextValue>(
    () => ({
      authors: authors?.items || [],
      setIsOpen,
      isOpen,
      openModal,
      closeModal,
      form,
      handleSubmit,
      selectedAuthor,
      handleSubmitDelete,
      onEdit,
      isLoading,
    }),
    [
      authors?.items,
      setIsOpen,
      isOpen,
      openModal,
      closeModal,
      form,
      selectedAuthor,
      handleSubmit,
      handleSubmitDelete,
      onEdit,
      isLoading,
    ],
  )

  return (
    <AuthorsPageContext.Provider value={value}>
      {children}
    </AuthorsPageContext.Provider>
  )
}

export function useAuthorsPageContext() {
  const ctx = useContext(AuthorsPageContext)
  if (!ctx)
    throw new Error('useAuthorsPage must be used within <AuthorsPageProvider>')
  return ctx
}

export default AuthorsPageProvider
