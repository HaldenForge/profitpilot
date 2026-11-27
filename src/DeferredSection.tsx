import { Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type DeferredSectionProps = {
  children: ReactNode
}

export default function DeferredSection({ children }: DeferredSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '500px 0px' }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="deferred-section">
      {shouldLoad ? (
        <Suspense fallback={<div className="deferred-section-placeholder">Loading section...</div>}>
          {children}
        </Suspense>
      ) : (
        <div className="deferred-section-placeholder" aria-hidden="true" />
      )}
    </div>
  )
}
