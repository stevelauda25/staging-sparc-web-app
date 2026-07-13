import { useEffect, useRef, useState, type ReactNode } from "react"
import { LayoutLeft } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { ShellProvider } from "./shell"

export interface AppShellProps {
  /** the main dashboard content, rendered to the right of the rail */
  children?: ReactNode
  className?: string
}

/**
 * app-shell — the top-level dashboard frame.
 *
 * The rail sits in normal flow when expanded. Collapsed, it leaves the flow so
 * the content fills the width, and hovering the left edge peeks the full rail
 * back in as a floating overlay (Attio-style).
 *
 * The collapse toggle is a genuine child of the rail (account-switcher) when
 * shown and of the content header when collapsed, so it scrolls with whichever
 * owns it. A viewport-anchored clone below carries the smooth slide for the
 * ~200ms transition; the real toggles hide themselves while it runs.
 */
export function AppShell({ children, className }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [sliding, setSliding] = useState(false)
  const slideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const toggle = () => {
    setCollapsed((value) => !value)
    setPeeked(false)
    setSliding(true)
    clearTimeout(slideTimer.current)
    slideTimer.current = setTimeout(() => setSliding(false), 220)
  }

  useEffect(() => () => clearTimeout(slideTimer.current), [])

  return (
    <ShellProvider value={{ collapsed, toggle, sliding }}>
      <div
        className={cn(
          "relative grid h-screen w-full grid-rows-[minmax(0,1fr)] overflow-hidden bg-surface motion-safe:transition-[grid-template-columns] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          className,
        )}
        style={{ gridTemplateColumns: collapsed ? "0rem minmax(0, 1fr)" : "15rem minmax(0, 1fr)" }}
      >
        {/* the rail owns the movement; the grid column owns the content reflow.
            Peeking keeps the column collapsed, so hover never pushes content. */}
        <div
          onMouseLeave={collapsed ? () => setPeeked(false) : undefined}
          className={cn(
            "relative z-50 col-start-1 row-start-1 h-full min-h-0 w-[15rem] min-w-[15rem] overflow-hidden will-change-transform motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            collapsed && !peeked && "pointer-events-none -translate-x-[calc(100%+4px)]",
          )}
        >
          <Sidebar floating={collapsed && peeked} className="h-full" />
        </div>

        <main className="col-start-2 row-start-1 h-full min-w-0 overflow-hidden">
          {children}
        </main>

        {/* overlay clone: purely visual, viewport-anchored. It is invisible except
            during the ~200ms slide, where it carries the toggle smoothly between
            the account-switcher spot (12.5rem) and the header spot (0.875rem). The
            real toggles (which scroll with their container) hide while it runs. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-[14px] z-40 flex size-7 items-center justify-center rounded-md text-secondary motion-safe:transition-[left] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            sliding ? "opacity-100" : "opacity-0",
            collapsed && !peeked ? "left-3.5" : "left-[12.5rem]",
          )}
        >
          <LayoutLeft className="size-4" />
        </span>

        {/* collapsed: a thin hover zone on the left edge peeks the rail out */}
        {collapsed && (
          <div
            className="absolute left-0 top-0 z-40 h-full w-2.5"
            onMouseEnter={() => setPeeked(true)}
          />
        )}
      </div>
    </ShellProvider>
  )
}
