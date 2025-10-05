import type { AnyColumn, SQL } from 'drizzle-orm'
import { and, asc, desc, gte, ilike, lte, or } from 'drizzle-orm'

import 'server-only'

export function normalizeQ(q?: string | null): string | undefined {
  const s = (q ?? '').trim()
  return s.length ? s : undefined
}

export function ilikeAny(q: string | undefined, cols: AnyColumn[]): SQL | undefined {
  if (!q || cols.length === 0)
    return undefined
  const like = `%${q}%`
  const parts = cols.map(c => ilike(c as any, like))
  return parts.length === 1 ? parts[0] : or(...parts)
}

export function numberRange(col: AnyColumn, min?: number, max?: number): SQL | undefined {
  const pieces: SQL[] = []
  if (typeof min === 'number')
    pieces.push(gte(col as any, min))
  if (typeof max === 'number')
    pieces.push(lte(col as any, max))
  if (pieces.length === 0)
    return undefined
  return pieces.length === 1 ? pieces[0] : and(...pieces)
}

export function dateRange(col: AnyColumn, from?: Date, to?: Date): SQL | undefined {
  const pieces: SQL[] = []
  if (from)
    pieces.push(gte(col as any, from))
  if (to)
    pieces.push(lte(col as any, to))
  if (pieces.length === 0)
    return undefined
  return pieces.length === 1 ? pieces[0] : and(...pieces)
}

export function andAll(...conds: (SQL | undefined)[]): SQL | undefined {
  const items = conds.filter(Boolean) as SQL[]
  if (items.length === 0)
    return undefined
  return items.length === 1 ? items[0] : and(...items)
}

export type SortKey = `${string}.asc` | `${string}.desc`

export function orderByFromSort<T extends Record<string, AnyColumn>>(
  sort: SortKey | undefined,
  columns: T,
  defaultKey: keyof T,
  defaultDir: 'asc' | 'desc' = 'desc',
) {
  const fallback = `${String(defaultKey)}.${defaultDir}` as SortKey
  const s = sort ?? fallback
  const [key, dir] = s.split('.') as [keyof T & string, 'asc' | 'desc']
  const col = columns[key] ?? columns[String(defaultKey)]
  return dir === 'asc' ? asc(col as any) : desc(col as any)
}
