'use server'

import { unstable_cache } from 'next/cache'
import { AuthorService } from '@/modules/authors'

export async function getBySlug(slug: string) {
  return await AuthorService.getBySlug(slug)
}

export const getAuthorCached = unstable_cache(
  async (slug: string) => getBySlug(slug),
  ['author-by-slug'],
  { revalidate: 3600 },
)
