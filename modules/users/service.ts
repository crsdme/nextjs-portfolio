import type * as projectValidation from './validation'
import { db } from '@/db'
import * as projectRepository from './repository'
import 'server-only'

export async function createProject(value: projectValidation.Project) {
  const [p] = await db.transaction(async () => {
    return await projectRepository.create(value)
  })
  return p
}

export async function updateProject(value: projectValidation.Project) {
  const [p] = await db.transaction(async () => {
    return await projectRepository.update(value.id, value)
  })
  return p
}

export async function deleteProject(id: string) {
  const [p] = await db.transaction(async () => {
    return await projectRepository.remove(id)
  })
  return p
}

export async function listProjects(input: projectValidation.ProjectsQuery) {
  return await projectRepository.list(input)
}
