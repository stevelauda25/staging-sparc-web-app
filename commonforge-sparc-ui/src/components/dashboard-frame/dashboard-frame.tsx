import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Breadcrumb, type BreadcrumbItem } from "@/components/breadcrumb"
import { useShell, SidebarToggle } from "@/components/app-shell"

export interface DashboardFrameProps {
  /** breadcrumb trail; the last item is the current page */
  breadcrumb?: BreadcrumbItem[]
  children?: ReactNode
  className?: string
}

/**
 * dashboard-frame — the main canvas rendered to the right of the sidebar.
 *
 * Matches the Figma shell: warm background, 8px inset, white rounded surface,
 * hairline border, layered elevation, compact breadcrumb header, and a tall
 * scrollable body area reserved for dashboard content.
 */
export function DashboardFrame({
  breadcrumb = [{ label: "Dashboard" }],
  children,
  className,
}: DashboardFrameProps) {
  const { collapsed } = useShell()
  // the last breadcrumb entry is the current page; expose it as the page's h1 so
  // screen-reader users get a top-level heading (the breadcrumb shows it visually)
  const currentPage = breadcrumb[breadcrumb.length - 1]?.label ?? "Dashboard"
  return (
    <section
      data-node-id="2533:3618"
      className={cn("flex h-full min-h-0 w-full items-start bg-background p-2", className)}
    >
      <div
        data-node-id="2533:3619"
        className={cn(
          "relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md bg-surface ring-[0.5px] ring-black/10",
          "shadow-[0_1px_2px_-1px_rgba(0,0,0,0.2),0_2px_4px_-2px_rgba(0,0,0,0.15),0_4px_6px_-4px_rgba(0,0,0,0.1)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1)]",
        )}
      >
        <header
          data-node-id="2533:3620"
          className={cn(
            "relative z-30 flex h-10 shrink-0 items-center gap-1 rounded-t-md bg-surface pr-3 shadow-[inset_0_-0.5px_0_rgba(0,0,0,0.1)] motion-safe:transition-[padding] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            collapsed ? "pl-1.5" : "pl-3",
          )}
        >
          <h1 className="sr-only">{currentPage}</h1>
          {/* when collapsed the expand toggle lives here as a real header child, so
              it scrolls with the header rather than floating pinned over it */}
          {collapsed && <SidebarToggle />}
          {/* breadcrumb trail, Figma node 2533:3621 */}
          <Breadcrumb items={breadcrumb} />
        </header>
        <div data-node-id="2533:3622" className="scrollbar-hide relative z-10 min-h-0 w-full flex-1 overflow-auto overscroll-none">
          {children}
        </div>
      </div>
    </section>
  )
}
