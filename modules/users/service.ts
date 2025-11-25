import type * as userValidation from './validation'
import bcrypt from 'bcrypt'
import { db } from '@/db'
import * as userRepository from './repository'
import 'server-only'

export async function createUser(value: userValidation.UserCreate) {
  const existing = await userRepository.findByLogin(value.login)
  if (existing.length > 0) {
    throw new Error('Пользователь с таким логином уже существует')
  }

  const passwordHash = await bcrypt.hash(value.passwordHash, 10)

  const [a] = await db.transaction(() => userRepository.create({ ...value, passwordHash }))
  return a
}

export async function updateUser(value: userValidation.UserUpdate) {
  if (!value.id)
    throw new Error('id обязателен')
  const [a] = await db.transaction(() => userRepository.update(value.id!, value))
  return a
}

export async function deleteUser(id: number) {
  const [a] = await db.transaction(() => userRepository.remove(id))
  return a
}

export async function listUsers(input: userValidation.UsersQuery) {
  return await userRepository.list(input)
}
