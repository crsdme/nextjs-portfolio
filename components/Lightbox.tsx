'use client'

import type { MediaSlide, Project } from '@/modules/projects/validation'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface Props {
  project: Project | null
  onClose: () => void
}

export function Lightbox({ project, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [slideIndex, setSlideIndex] = useState(0)

  // открыть/закрыть <dialog> при смене project
  useEffect(() => {
    if (!dialogRef.current)
      return
    if (project) {
      setSlideIndex(0)
      dialogRef.current.showModal()
    }
    else if (dialogRef.current.open) {
      dialogRef.current.close()
    }
  }, [project])

  // клавиатура: Esc, ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dialogRef.current?.open || !project)
        return
      if (e.key === 'Escape')
        onClose()
      const len = project.slides.length
      if (len > 1) {
        if (e.key === 'ArrowRight')
          setSlideIndex(i => (i + 1) % len)
        if (e.key === 'ArrowLeft')
          setSlideIndex(i => (i - 1 + len) % len)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose])

  if (!project)
    return null

  const slide = project.slides?.[slideIndex] ?? []

  return (
    <dialog
      ref={dialogRef}
      className="m-0 w-[min(1100px,96vw)] max-h-[90vh] rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 backdrop:bg-black/60"
      onCancel={onClose}
    >
      <button
        className="absolute right-3 top-3 rounded-md bg-neutral-800 px-2 py-1 text-xl"
        onClick={onClose}
        aria-label="Закрыть"
      >
        ×
      </button>

      <div className="grid h-full max-h-[90vh] grid-cols-1 md:grid-cols-[1.3fr_0.9fr]">
        {/* MEDIA */}
        <div className="relative flex items-center justify-center bg-neutral-900 p-3 md:p-4">
          <MediaViewer slide={slide} title={project.title} />
          {project.slides.length > 1 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-neutral-800/80 px-2 py-1 text-sm">
              <button
                className="px-2 py-1"
                onClick={() => setSlideIndex(i => (i - 1 + project.slides.length) % project.slides.length)}
                aria-label="Предыдущий слайд"
              >
                ←
              </button>
              <span className="opacity-80">
                {slideIndex + 1}
                {' '}
                /
                {project.slides.length}
              </span>
              <button
                className="px-2 py-1"
                onClick={() => setSlideIndex(i => (i + 1) % project.slides.length)}
                aria-label="Следующий слайд"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* META */}
        <aside className="max-h-[90vh] overflow-auto border-t border-neutral-800 p-4 md:border-l md:border-t-0 md:p-6">
          <h2 className="mb-1 text-2xl font-semibold">{project.title}</h2>
          {project.subtitle && <p className="mb-2 text-neutral-400">{project.subtitle}</p>}
          {project.description && <p className="mb-4 text-neutral-200">{project.description}</p>}

          {(project as any).stack?.length || project.tags?.length || project.date
            ? (
                <div className="space-y-5">
                  {(project as any).stack?.length
                    ? (
                        <MetaBlock title="Технологии">
                          <ChipList items={(project as any).stack} />
                        </MetaBlock>
                      )
                    : null}
                  {project.tags?.length
                    ? (
                        <MetaBlock title="Теги">
                          <ChipList items={project.tags.map(t => `#${t}`)} />
                        </MetaBlock>
                      )
                    : null}
                  {project.date
                    ? (
                        <MetaBlock title="Дата">{formatDate(project.date)}</MetaBlock>
                      )
                    : null}
                </div>
              )
            : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton href={project.projectUrl} label="Открыть проект" />
            <ActionButton href={project.repoUrl} label="Исходный код" variant="ghost" />
          </div>
        </aside>
      </div>
    </dialog>
  )
}

/* ---------- внутренние мини-компоненты ---------- */

function MediaViewer({ slide, title }: { slide: MediaSlide, title: string }) {
  if (slide.type === 'image') {
    return (
      <Image
        src={slide.src}
        alt={slide.alt ?? title}
        width={slide.width ?? 1600}
        height={slide.height ?? 1200}
        className="max-h-[68vh] w-auto max-w-full rounded-lg border border-neutral-800 object-contain"
        priority
      />
    )
  }
  if (slide.kind === 'youtube') {
    return (
      <iframe
        title={title}
        className="max-h-[68vh] w-full rounded-lg border border-neutral-800"
        src={slide.src.replace('watch?v=', 'embed/')}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }
  if (slide.kind === 'vimeo') {
    return (
      <iframe
        title={title}
        className="max-h-[68vh] w-full rounded-lg border border-neutral-800"
        src={slide.src}
        allowFullScreen
      />
    )
  }
  return (
    <video
      className="max-h-[68vh] w-full rounded-lg border border-neutral-800"
      controls
      preload="metadata"
      poster={slide.poster}
    >
      <source src={slide.src} type="video/mp4" />
    </video>
  )
}

function MetaBlock({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wide text-neutral-400">{title}</div>
      <div>{children}</div>
    </div>
  )
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(t => (
        <span key={t} className="rounded bg-neutral-900 px-2 py-1 text-xs text-neutral-300">
          {t}
        </span>
      ))}
    </div>
  )
}

function ActionButton({
  href,
  label,
  variant = 'solid',
}: {
  href?: string | null
  label: string
  variant?: 'solid' | 'ghost'
}) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm'
  if (!href) {
    return <button className={`${base} cursor-not-allowed bg-neutral-800 text-neutral-500`} disabled>{label}</button>
  }
  if (variant === 'ghost') {
    return <a className={`${base} border border-neutral-700 bg-transparent text-neutral-200 hover:bg-neutral-800`} href={href} target="_blank" rel="noreferrer">{label}</a>
  }
  return <a className={`${base} bg-neutral-100 text-neutral-900 hover:brightness-95`} href={href} target="_blank" rel="noreferrer">{label}</a>
}

function formatDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
}
