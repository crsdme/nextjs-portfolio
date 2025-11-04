'use client'

import { AuthorsActionSheet } from './_components/action-sheet'
import { AuthorsTable } from './_components/table'
import { AuthorsPageProvider } from './providers'

export default function AuthorsPage() {
  return (
    <AuthorsPageProvider>
      <div className="flex gap-4 w-full h-full flex-col">
        <AuthorsActionSheet />
        <AuthorsTable />
      </div>
    </AuthorsPageProvider>
  )
}
