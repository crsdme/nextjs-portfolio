'use client'

import { useEffect } from 'react'

type Id = string | number
interface WithSlides { id: Id, slug?: string, slides?: unknown[] | null }

export function useLightboxPathRouting<T extends WithSlides>(opts: {
  data?: T[]
  basePath: string
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  active: T | null
  setActive: (v: T | null) => void
  index: number
  setIndex: (v: number) => void
}) {
  const {
    data,
    basePath,
    isOpen,
    setIsOpen,
    active,
    setActive,
    index,
    setIndex,
  } = opts

  const buildProjectPath = (p: T, slideIndex: number) => {
    const slugOrId = p.slug ?? String(p.id)
    return `${basePath}/${slugOrId}#${slideIndex + 1}`
  }

  const openAt = (p: T, idx = 0) => {
    setActive(p)
    setIndex(idx)
    setIsOpen(true)

    history.replaceState(null, '', buildProjectPath(p, idx))
  }

  const close = () => {
    setIsOpen(false)
    setActive(null)
    history.replaceState(null, '', basePath)
  }

  // -------------------------------
  // ⭐ ОТКРЫТИЕ ПО ПРЯМОЙ ССЫЛКЕ
  // -------------------------------
  useEffect(() => {
    if (!data || !data.length)
      return

    const path = window.location.pathname // "/anna-smirnova/conference-reel-2"
    const hash = window.location.hash // "#1"

    const parts = path.split('/').filter(Boolean)
    if (parts[0] !== basePath.replace('/', '').trim())
      return
    if (!parts[1])
      return

    const projectSlug = parts[1]
    const project = data.find(p => (p.slug ?? String(p.id)) === projectSlug)
    if (!project)
      return

    const slideNum = hash.startsWith('#')
      ? Math.max(1, Number(hash.slice(1)) || 1)
      : 1

    const idx = slideNum - 1

    // если уже открыто — ничего не делаем
    if (isOpen && active?.id === project.id)
      return

    setActive(project)
    setIndex(idx)
    setIsOpen(true)
  }, [data, basePath])
  // -------------------------------

  // keep URL synced when switching slides
  useEffect(() => {
    if (!isOpen || !active)
      return

    const href = buildProjectPath(active, index)
    const cur = window.location.pathname + window.location.hash

    if (cur !== href) {
      history.replaceState(null, '', href)
    }
  }, [isOpen, active, index, basePath])

  return { openAt, close }
}
