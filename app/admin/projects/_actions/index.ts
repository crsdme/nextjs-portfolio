'use server'

import type { Project } from '@/modules/projects/validation'
import { createProject, deleteProject, updateProject } from '@/modules/projects/service'
import { projectSchema } from '@/modules/projects/validation'

export async function createProjectAction(value: Project) {
  const parsed = projectSchema.safeParse(value)

  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const, errors: parsed }

  await createProject(parsed.data)
  return { ok: true }
}

export async function editProjectAction(id: number, value: Project) {
  const parsed = projectSchema.safeParse({ ...value, id })
  if (!parsed.success)
    return { ok: false, error: 'Неверные данные формы' as const, errors: parsed }
  await updateProject(parsed.data)
  return { ok: true }
}

export async function deleteProjectAction(id: number) {
  await deleteProject(id)
  return { ok: true }
}
