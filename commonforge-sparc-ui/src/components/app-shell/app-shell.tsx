import { useState, type ReactNode } from "react"
import { LayoutLeft } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/lib/use-media-query"
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
 * Desktop (>= lg): the rail sits in the grid. Collapsed, it leaves the flow so
 * the content fills the width, and hovering the left edge peeks the full rail
 * back in as a floating overlay (Attio-style). One persistent toggle slides
 * between the account-switcher spot and the content header.
 *
 * Below lg: there is no room for a 240px rail, so the sidebar becomes an
 * off-canvas drawer opened by the header hamburger, over a dimmed backdrop.
 */
export function AppShell({ children, className }: AppShellProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [collapsed, setCollapsed] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const toggle = () => {
    setCollapsed((value) => !value)
    setPeeked(false)
  }
  const openMobileNav = () => setMobileNavOpen(true)
  const closeMobileNav = () => setMobileNavOpen(false)

  // below lg the rail column is always 0; the sidebar lives in the drawer instead
  const railWidth = isDesktop ? (collapsed ? "0rem" : "15rem") : "0rem"

  return (
    <ShellProvider value={{ collapsed, toggle, mobileNavOpen, openMobileNav, closeMobileNav }}>
      <div
        className={cn(
          "relative grid h-screen w-full grid-rows-[minmax(0,1fr)] overflow-hidden bg-surface motion-safe:transition-[grid-template-columns] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          className,
        )}
        style={{ gridTemplateColumns: `${railWidth} minmax(0, 1fr)` }}
      >
        {/* desktop rail: in the grid at lg+, hidden below (the drawer takes over) */}
        <div
          onMouseLeave={collapsed ? () => setPeeked(false) : undefined}
          className={cn(
            "relative z-50 col-start-1 row-start-1 hidden h-full min-h-0 w-[15rem] min-w-[15rem] overflow-hidden will-change-transform lg:block motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            collapsed && !peeked && "pointer-events-none -translate-x-[calc(100%+4px)]",
          )}
        >
          <Sidebar floating={collapsed && peeked} className="h-full" />
        </div>

        <main className="col-start-2 row-start-1 h-full min-w-0 overflow-hidden">
          {children}
        </main>

        {/* the one desktop collapse toggle (slides between rail and header) */}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute top-[14px] z-[60] hidden size-7 items-center justify-center rounded-md text-secondary outline-none hover:bg-[#F5F5F5] hover:text-primary focus-visible:ring-2 focus-visible:ring-[#CFC7BC] lg:flex motion-safe:transition-[left] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            collapsed && !peeked ? "left-3.5" : "left-[12.5rem]",
          )}
        >
          <LayoutLeft className="size-4" />
        </button>

        {/* desktop collapsed: a thin hover zone on the left edge peeks the rail out */}
        {collapsed && (
          <div
            className="absolute left-0 top-0 z-40 hidden h-full w-2.5 lg:block"
            onMouseEnter={() => setPeeked(true)}
          />
        )}

        {/* mobile: dimmed backdrop behind the drawer */}
        <div
          aria-hidden="true"
          onClick={closeMobileNav}
          className={cn(
            "fixed inset-0 z-[60] bg-black/10 motion-safe:transition-opacity motion-safe:duration-200 motion-reduce:transition-none lg:hidden",
            mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />

        {/* mobile: the off-canvas nav drawer */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-[70] w-[15rem] will-change-transform lg:hidden motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            mobileNavOpen ? "translate-x-0" : "-translate-x-[115%]",
          )}
        >
          {/* softer than the desktop peek: elevation you feel, not see (~5% + whisper edge) */}
          <Sidebar floating className="h-full border-black/[0.06] shadow-[5px_0_18px_-8px_rgba(32,27,24,0.05)]" />
        </div>
      </div>
    </ShellProvider>
  )
}
