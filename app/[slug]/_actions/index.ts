'use server'

import { AuthorService } from '@/modules/authors'

export async function getBySlug(slug: string) {
  return await AuthorService.getBySlug(slug)
}
