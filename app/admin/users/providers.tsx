'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { Author } from '@/modules/authors/validation'
import type { User } from '@/modules/users/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { z } from 'zod'
import { createUserAction, deleteUserAction, editUserAction } from './_actions'

const formSchema = z.object({
  login: z.string().min(1, 'Укажите логин'),
  passwordHash: z.string().min(1, 'Укажите пароль'),
  accesses: z.array(z.string()).default([]),
  authors: z.array(z.string()).default([]),
})

export const UsersPageContext = createContext<UsersPageContextValue | null>(null)

export interface UsersPageContextValue {
  users: User[]
  authors: Author[]
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  handleSubmitDelete: (v: number) => void
  onEdit: (v: number) => void
  isLoading: boolean
  form: UseFormReturn<z.infer<typeof formSchema>>
  selectedUser: User
  handleSubmit: (v: z.infer<typeof formSchema>) => void
  openModal: () => void
  closeModal: () => void
}

const defaultUser: any = {
  id: 0,
  login: '',
  passwordHash: '',
  authors: [],
  accesses: [],
}

export function UsersPageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User>(defaultUser)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultUser,
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', { q: '', page: 1, pageSize: 10 }],
    queryFn: async () => {
      const r = await fetch('/api/users', { cache: 'no-store' })
      if (!r.ok)
        throw new Error('Failed')
      return r.json()
    },
    staleTime: 0,
  })

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

    const user = users?.items.find((user: User) => user.id === id) || defaultUser
    setSelectedUser({ ...user, id })
    form.reset(user)
    setIsOpen(true)
  }

  const handleSubmitCreate = async (value: User) => {
    const res = await createUserAction(value)

    if (res.ok) {
      toast.success('Пользователь успешно создан')
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
    else {
      toast.error('Не удалось создать пользователя')
    }
    setSelectedUser(defaultUser)
  }

  const handleSubmitEdit = async (value: any) => {
    const res = await editUserAction(selectedUser?.id || 0, value)
    if (res.ok) {
      toast.success('Пользователь успешно обновлен')
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
    else {
      toast.error('Не удалось обновить пользователя')
    }
    setSelectedUser(defaultUser)
  }

  const handleSubmitDelete = async (id: number) => {
    const res = await deleteUserAction(id)
    if (res.ok) {
      toast.success('Пользователь успешно удален')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
    else {
      toast.error('Не удалось удалить пользователя')
    }
  }

  const handleSubmit = (value: any) => {
    if (selectedUser.id) {
      handleSubmitEdit(value)
    }
    else {
      handleSubmitCreate(value)
    }
  }

  const openModal = () => {
    setIsOpen(true)
    setSelectedUser(defaultUser)
    form.reset(defaultUser)
    form.clearErrors()
  }

  const closeModal = () => {
    setIsOpen(false)
    form.reset(defaultUser)
    form.clearErrors()
    setSelectedUser(defaultUser)
  }

  const value = useMemo<UsersPageContextValue>(
    () => ({
      users: users?.items || [],
      authors: authors?.items || [],
      setIsOpen,
      isOpen,
      openModal,
      closeModal,
      form,
      handleSubmit,
      selectedUser,
      handleSubmitDelete,
      onEdit,
      isLoading,
    }),
    [
      users?.items,
      authors?.items,
      setIsOpen,
      isOpen,
      openModal,
      closeModal,
      form,
      selectedUser,
      handleSubmit,
      handleSubmitDelete,
      onEdit,
      isLoading,
    ],
  )

  return (
    <UsersPageContext.Provider value={value}>
      {children}
    </UsersPageContext.Provider>
  )
}

export function useUsersPageContext() {
  const ctx = useContext(UsersPageContext)
  if (!ctx)
    throw new Error('useUsersPage must be used within <UsersPageProvider>')
  return ctx
}

export default UsersPageProvider
