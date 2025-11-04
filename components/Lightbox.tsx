'use client'

import type { Tag } from '@/modules/projects/schema'
import { ArrowLeft, ArrowRight, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { driveIframeFromUrl, extractDriveFileId } from '@/lib/url'
import { Badge, Button, Skeleton } from './ui/'

type MediaType = 'image' | 'video'

export interface LightboxMediaItem {
  id: number
  type: MediaType
  src: string
  caption?: string | null
  description?: string | null
}

export interface LightboxProject {
  id: number
  title: string
  subtitle?: string | null
  description?: string | null
  tags?: Tag[]
  date?: Date | string | null
  projectUrl?: string | null
  repoUrl?: string | null
  slides: LightboxMediaItem[]
}

interface LightboxProps {
  open: boolean
  project: LightboxProject | null
  initialIndex?: number
  onClose: () => void
  onSlideChange: (index: number) => void
}

function clsx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(' ')
}

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked)
      return
    const { overflow, paddingRight } = document.body.style
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [locked])
}

function useKeyNav(enabled: boolean, handlers: {
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onFirst?: () => void
  onLast?: () => void
}) {
  useEffect(() => {
    if (!enabled)
      return
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': handlers.onClose()
          break
        case 'ArrowLeft': handlers.onPrev()
          break
        case 'ArrowRight': handlers.onNext()
          break
        case 'Home': handlers.onFirst?.()
          break
        case 'End': handlers.onLast?.()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, handlers])
}

interface LightboxProps {
  open: boolean
  project: LightboxProject | null
  index: number
  onClose: () => void
  onSlideChange: (index: number) => void
}

export function Lightbox({ open, project, index, onClose, onSlideChange }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const items = project?.slides ?? []
  const canOpen = open && project && items.length > 0

  useLockBodyScroll(!!canOpen)

  const goPrev = useCallback(() => {
    if (!items.length)
      return
    onSlideChange((index - 1 + items.length) % items.length)
  }, [index, items.length, onSlideChange])

  const goNext = useCallback(() => {
    if (!items.length)
      return
    onSlideChange((index + 1) % items.length)
  }, [index, items.length, onSlideChange])

  const goFirst = useCallback(() => onSlideChange(0), [onSlideChange])
  const goLast = useCallback(() => onSlideChange(items.length - 1), [items.length, onSlideChange])

  useKeyNav(!!canOpen, { onPrev: goPrev, onNext: goNext, onClose, onFirst: goFirst, onLast: goLast })

  useEffect(() => {
    if (canOpen)
      closeBtnRef.current?.focus()
  }, [canOpen])

  useEffect(() => {
    if (!canOpen)
      return
    const neighbors = [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]]
    neighbors.forEach((n) => {
      if (n?.type === 'image') {
        const img = new window.Image()
        ;(img as any).decoding = 'async'
        ;(img as any).loading = 'eager'
        img.src = n.src
      }
    })
    const mediaEl = dialogRef.current?.querySelector<HTMLVideoElement>('video')
    if (mediaEl)
      mediaEl.pause()
  }, [index, items, canOpen])

  const current = items[index]

  if (!canOpen)
    return null

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${project?.title} — галерея`}
      className="fixed inset-0 z-50 flex flex-col bg-black/80"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget)
          onClose()
      }}
    >
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/90 px-3 py-8 md:px-4">
        <div className="min-w-0">
          <div className="truncate text-sm text-neutral-400">{project!.subtitle}</div>
          <h2 className="truncate text-base font-semibold text-neutral-100">{project!.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-neutral-400 md:inline">
            {`${index + 1} / ${items.length}`}
          </span>
          <Button
            ref={closeBtnRef}
            size="icon"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid h-full grid-cols-1 md:grid-cols-[1.4fr_1fr]">
        <div className="relative flex min-h-0 items-center justify-center bg-neutral-900 p-2 md:p-4">
          {items.length > 1 && (
            <>
              <Button onClick={goPrev} size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button onClick={goNext} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <div className="max-h-[76vh] w-full max-w-[96%]">
            <MediaRenderer item={current} />
          </div>

          {items.length > 1 && (
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-neutral-800/70 px-3 py-1 text-xs text-neutral-200 md:hidden">
              {`${index + 1} / ${items.length}`}
            </div>
          )}
        </div>

        <aside className="min-h-0 overflow-auto border-t border-neutral-800 bg-neutral-950 p-4 md:border-l md:border-t-0 md:p-6">
          {(current?.caption || current?.description) && (
            <div className="mb-5 space-y-1">
              {current.caption && <div className="text-sm font-medium text-neutral-100">{current.caption}</div>}
              {current.description && <p className="text-sm leading-6 text-neutral-300">{current.description}</p>}
            </div>
          )}

          {project!.description && <p className="mb-5 text-[15px] leading-7 text-neutral-200">{project!.description}</p>}

          {(project!.tags?.length || project!.date) && (
            <div className="space-y-4">
              {!!project!.tags?.length && (
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Теги</div>
                  <div className="flex flex-wrap gap-2">
                    {project!.tags!.map(t => (<Badge key={t.url}>{t.label}</Badge>))}
                  </div>
                </div>
              )}
              {project!.date && (
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Дата</div>
                  <Badge>{formatDate(project!.date!)}</Badge>
                </div>
              )}
            </div>
          )}

          {items.length > 1 && (
            <div className="mt-8">
              <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Галерея</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {items.map((it, i) => (
                  <button
                    key={it.id}
                    onClick={() => onSlideChange(i)}
                    aria-label={`Открыть слайд ${i + 1}`}
                    className={clsx(
                      'relative h-16 w-24 shrink-0 overflow-hidden rounded border',
                      i === index
                        ? 'border-neutral-100 ring-2 ring-neutral-500'
                        : 'border-neutral-700 hover:border-neutral-500',
                    )}
                  >
                    <Image
                      src={`/api/image/thumb?id=${extractDriveFileId(it.src)}&w=94`}
                      alt={it.caption ?? `Слайд ${i + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>,
    document.body,
  )
}

// export function Lightbox({ open, project, initialIndex = 0, onClose, onSlideChange }: LightboxProps) {
//   const [index, setIndex] = useState(initialIndex)
//   const dialogRef = useRef<HTMLDivElement>(null)
//   const closeBtnRef = useRef<HTMLButtonElement>(null)

//   const items = project?.slides ?? []
//   const canOpen = open && project && items.length > 0

//   // useEffect(() => {
//   //   if (!canOpen)
//   //     return
//   //   const next = Math.min(Math.max(0, initialIndex), Math.max(items.length - 1, 0))
//   //   setIndex(next)
//   // }, [
//   //   canOpen,
//   //   initialIndex,
//   //   project?.id, // смена проекта
//   //   items.length, // поменялось кол-во слайдов
//   // ])

//   // (B) репортим наружу (в твой useLightboxPathRouting) изменение индекса
//   useEffect(() => {
//     if (!canOpen || !items.length)
//       return
//     onSlideChange(index)
//   }, [index, canOpen, items.length, onSlideChange])

//   useLockBodyScroll(!!canOpen)

//   const goPrev = useCallback(() => {
//     setIndex(i => (i - 1 + items.length) % items.length)
//   }, [items.length])

//   const goNext = useCallback(() => {
//     setIndex(i => (i + 1) % items.length)
//   }, [items.length])

//   const goFirst = useCallback(() => setIndex(0), [])
//   const goLast = useCallback(() => setIndex(items.length - 1), [items.length])

//   useKeyNav(!!canOpen, { onPrev: goPrev, onNext: goNext, onClose, onFirst: goFirst, onLast: goLast })

//   useEffect(() => {
//     if (canOpen) {
//       closeBtnRef.current?.focus()
//     }
//   }, [canOpen])

//   useEffect(() => {
//     if (!canOpen)
//       return
//     const neighbors = [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]]
//     neighbors.forEach((n) => {
//       if (!n)
//         return
//       if (n.type === 'image') {
//         const img = new window.Image()
//         img.src = n.src
//       }
//     })

//     const mediaEl = dialogRef.current?.querySelector<HTMLVideoElement>('video')
//     if (mediaEl)
//       mediaEl.pause()
//   }, [index, items, canOpen])

//   const current = items[index]

//   if (!canOpen)
//     return null

//   return createPortal(
//     <div
//       ref={dialogRef}
//       role="dialog"
//       aria-modal="true"
//       aria-label={`${project?.title} — галерея`}
//       className="fixed inset-0 z-50 flex flex-col bg-black/80"
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget)
//           onClose()
//       }}
//     >
//       <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/90 px-3 py-8 md:px-4">
//         <div className="min-w-0">
//           <div className="truncate text-sm text-neutral-400">{project!.subtitle}</div>
//           <h2 className="truncate text-base font-semibold text-neutral-100">{project!.title}</h2>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="hidden text-sm text-neutral-400 md:inline">
//             {index + 1}
//             /
//             {items.length}
//           </span>
//           <Button size="icon" onClick={onClose}>
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       <div className="grid h-full grid-cols-1 md:grid-cols-[1.4fr_1fr]">
//         <div className="relative flex min-h-0 items-center justify-center bg-neutral-900 p-2 md:p-4">
//           {items.length > 1 && (
//             <>
//               <Button size="icon" onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
//                 <ArrowLeft className="h-4 w-4" />
//               </Button>
//               <Button size="icon" onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
//                 <ArrowRight className="h-4 w-4" />
//               </Button>
//             </>
//           )}

//           <div className="max-h-[76vh] w-full max-w-[96%]">
//             <MediaRenderer item={current} />
//           </div>

//           {items.length > 1 && (
//             <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-neutral-800/70 px-3 py-1 text-xs text-neutral-200 md:hidden">
//               {index + 1}
//               /
//               {items.length}
//             </div>
//           )}
//         </div>

//         <aside className="min-h-0 overflow-auto border-t border-neutral-800 bg-neutral-950 p-4 md:border-l md:border-t-0 md:p-6">
//           {(current?.caption || current?.description) && (
//             <div className="mb-5 space-y-1">
//               {current.caption && (
//                 <div className="text-sm font-medium text-neutral-100">{current.caption}</div>
//               )}
//               {current.description && (
//                 <p className="text-sm leading-6 text-neutral-300">{current.description}</p>
//               )}
//             </div>
//           )}

//           {project!.description && (
//             <p className="mb-5 text-[15px] leading-7 text-neutral-200">{project!.description}</p>
//           )}

//           {(project!.tags?.length || project!.date) && (
//             <div className="space-y-4">
//               {project!.tags?.length && (
//                 <div>
//                   <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Теги</div>
//                   <div className="flex flex-wrap gap-2">
//                     {project!.tags?.map(t => (
//                       <Badge key={t.url}>{t.label}</Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               {project!.date && (
//                 <div>
//                   <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Дата</div>
//                   <Badge>{formatDate(project!.date!)}</Badge>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="mt-6 flex flex-wrap gap-3">
//             <Button variant="outline" onClick={onClose}>Открыть в новой вкладке</Button>
//           </div>

//           {items.length > 1 && (
//             <div className="mt-8">
//               <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">Галерея</div>
//               <div className="flex gap-2 overflow-x-auto pb-2">
//                 {items.map((it, i) => (
//                   <button
//                     key={it.id}
//                     onClick={() => setIndex(i)}
//                     aria-label={`Открыть слайд ${i + 1}`}
//                     className={clsx(
//                       'relative h-16 w-24 shr ink-0 overflow-hidden rounded border',
//                       i === index
//                         ? 'border-neutral-100 ring-2 ring-neutral-500'
//                         : 'border-neutral-700 hover:border-neutral-500',
//                     )}
//                   >
//                     <Image
//                       src={`/api/image/thumb?id=${extractDriveFileId(it.src)}&w=94`}
//                       alt={it.caption ?? `Слайд ${i + 1}`}
//                       fill
//                       sizes="96px"
//                       className="object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </aside>
//       </div>
//     </div>,
//     document.body,
//   )
// }

function MediaRenderer({ item }: { item: LightboxMediaItem }) {
  if (!item)
    return null
  if (item.type === 'image')
    return <MediaImage item={item} />
  if (item.type === 'video')
    return <MediaVideo item={item} />
  return null
}

function MediaImage({ item }: { item: LightboxMediaItem }) {
  return (
    <div className="relative mx-auto aspect-video max-h-[76vh] w-full">
      <Image
        alt={item.caption ?? 'Изображение'}
        src={`/api/image/thumb?id=${extractDriveFileId(item.src)}&w=500`}
        fill
        sizes="(max-width: 768px) 96vw, 60vw"
        className="rounded-lg border border-neutral-800 object-contain bg-neutral-950"
        priority
      />
    </div>
  )
}

function MediaVideo({ item }: { item: LightboxMediaItem }) {
  const [loaded, setLoaded] = useState(false)
  const fileId = extractDriveFileId(item.src)
  const iframeSrc = useMemo(() => driveIframeFromUrl(item.src), [item.src])

  useEffect(() => {
    setLoaded(false)
  }, [fileId])

  return (
    <div className="relative mx-auto aspect-video max-h-[76vh] w-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-full w-full bg-neutral-950" />
          <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 animate-spin text-neutral-400" />
        </div>
      )}
      <iframe
        key={fileId}
        src={iframeSrc}
        width="100%"
        height="100%"
        allow="fullscreen; autoplay"
        className="rounded-lg border border-neutral-800 bg-black"
        loading="eager"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

function formatDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
}
