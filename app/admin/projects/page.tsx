'use client'

import { ProjectsActionSheet } from './_components/action-sheet'
import { ProjectsTable } from './_components/table'
import ProjectsPageProvider from './providers'

export default function ProjectsPage() {
  return (
    <ProjectsPageProvider>
      <div className="flex gap-4 w-full h-full flex-col">
        <ProjectsActionSheet />
        <ProjectsTable />
      </div>
    </ProjectsPageProvider>
  )
}
