'use client'

import { UsersActionSheet } from './_components/action-sheet'
import { UsersTable } from './_components/table'
import { UsersPageProvider } from './providers'

export default function UsersPage() {
  return (
    <UsersPageProvider>
      <div className="flex gap-4 w-full h-full flex-col">
        <UsersActionSheet />
        <UsersTable />
      </div>
    </UsersPageProvider>
  )
}
