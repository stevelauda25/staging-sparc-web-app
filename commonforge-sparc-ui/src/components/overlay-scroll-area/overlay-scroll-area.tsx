import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

// extra props (role, aria-*, id, ...) land on the outer wrapper. className is
// reserved for the scrolling viewport, so it is omitted from the passthrough.
export interface OverlayScrollAreaProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  children: ReactNode
  /** classes for the scrolling viewport (usually a height, e.g. `h-full`) */
  className?: string
  /** classes for the outer positioning wrapper (e.g. `flex-1`) */
  wrapperClassName?: string
  /** distance of the overlay thumb from the right edge; negative pushes it outside the content */
  scrollbarRight?: number
}

/**
 * overlay-scroll-area — a scroll container with a thin, overlay scrollbar thumb
 * that appears only when the content overflows (the native bar stays hidden).
 * Used by the dashboard list panels so their scroll UI reads the same.
 */
export function OverlayScrollArea({
  children,
  className,
  wrapperClassName,
  scrollbarRight = 4,
  ...rest
}: OverlayScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ visible: false, top: 0, height: 0 })

  useEffect(() => {
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return

    const update = () => {
      const { clientHeight, scrollHeight, scrollTop } = viewport
      if (scrollHeight <= clientHeight + 1) {
        setThumb((current) => (current.visible ? { visible: false, top: 0, height: 0 } : current))
        return
      }

      const trackHeight = Math.max(0, clientHeight - 8)
      const height = Math.max(24, Math.round((clientHeight / scrollHeight) * trackHeight))
      const top = Math.round((scrollTop / (scrollHeight - clientHeight)) * (trackHeight - height))
      setThumb({ visible: true, top, height })
    }

    update()
    viewport.addEventListener("scroll", update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    observer.observe(content)
    return () => {
      viewport.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [])

  return (
    <div className={cn("relative min-h-0", wrapperClassName)} {...rest}>
      <div ref={viewportRef} tabIndex={0} className={cn("overflow-y-auto overscroll-contain outline-none scrollbar-hide", className)}>
        <div ref={contentRef}>{children}</div>
      </div>
      {thumb.visible && (
        <div className="pointer-events-none absolute inset-y-1 z-20 w-[3px]" style={{ right: scrollbarRight }}>
          <div
            className="absolute right-0 w-[3px] rounded-full bg-black/20"
            style={{ height: thumb.height, transform: `translateY(${thumb.top}px)` }}
          />
        </div>
      )}
    </div>
  )
}
