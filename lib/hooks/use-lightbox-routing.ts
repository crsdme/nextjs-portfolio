'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

type Id = string | number
interface WithSlides { id: Id, slug?: string, slides?: unknown[] | null }

export function useLightboxPathRouting<T extends WithSlides>(opts: {
  data?: T[]
  authorSlug: string
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  active: T | null
  setActive: (v: T | null) => void
  index: number
  setIndex: (v: number) => void
}) {
  const { data, authorSlug, isOpen, setIsOpen, active, setActive, index, setIndex } = opts
  const pathname = usePathname()
  const guard = useRef(false)

  const [hash, setHash] = useState<string>(typeof window !== 'undefined' ? window.location.hash : '')

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const { urlAuthor, urlProject, urlSlideNum } = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    const slideFromHash = hash ? Math.max(1, Number.parseInt(hash.slice(1), 10) || 1) : null
    return {
      urlAuthor: parts[0],
      urlProject: parts[1],
      urlSlideNum: slideFromHash,
    }
  }, [pathname, hash])

  useEffect(() => {
    if (!data || !urlAuthor || !urlProject)
      return
    if (urlAuthor !== authorSlug)
      return

    const found = data.find(p => (p.slug ?? String(p.id)) === urlProject)
    if (!found)
      return

    const total = found.slides?.length ?? 1
    const desiredIdx = Math.min((urlSlideNum ?? 1) - 1, Math.max(total - 1, 0))

    if (guard.current) {
      guard.current = false
      return
    }

    const sameProject = (active?.slug ?? String(active?.id ?? '')) === (found.slug ?? String(found.id))
    if (isOpen && sameProject && index === desiredIdx)
      return

    setActive(found)
    setIndex(desiredIdx)
    setIsOpen(true)
  }, [pathname, hash, data, authorSlug])

  useEffect(() => {
    if (!isOpen || !active)
      return
    const base = `/${authorSlug}/${active.slug ?? String(active.id)}`
    const newUrl = `${base}#${index + 1}`
    if (location.pathname + location.hash !== newUrl) {
      history.replaceState(null, '', newUrl)
    }
  }, [isOpen, active, index, authorSlug])

  useEffect(() => {
    if (!isOpen)
      return
    if (!(urlAuthor === authorSlug && urlProject)) {
      setIsOpen(false)
      setActive(null)
    }
  }, [urlAuthor, urlProject, authorSlug, isOpen, setIsOpen, setActive])

  const openAt = (p: T, idx = 0) => {
    setActive(p)
    setIndex(idx)
    setIsOpen(true)
    history.replaceState(null, '', `/${authorSlug}/${p.slug ?? String(p.id)}#${idx + 1}`)
  }

  const close = () => {
    // guard.current = true
    setIsOpen(false)
    setActive(null)
    history.replaceState(null, '', `/${authorSlug}`)
  }

  return { openAt, close }
}
