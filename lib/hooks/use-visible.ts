// useVisible.ts
import { useEffect, useRef, useState } from 'react'

export function useVisible<T extends HTMLElement>(rootMargin = '200px') {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current)
      return
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setVisible(true)),
      { root: null, rootMargin, threshold: 0.01 },
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, visible }
}
