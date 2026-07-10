import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Breadcrumb, type BreadcrumbItem } from "@/components/breadcrumb"

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
  return (
    <section
      data-node-id="2533:3618"
      className={cn("flex min-h-[2345px] w-full items-start bg-background p-2", className)}
    >
      <div
        data-node-id="2533:3619"
        className={cn(
          "relative flex min-h-[2329px] min-w-0 flex-1 flex-col overflow-hidden rounded-md bg-surface ring-[0.5px] ring-black/10",
          "shadow-[0_1px_2px_-1px_rgba(0,0,0,0.2),0_2px_4px_-2px_rgba(0,0,0,0.15),0_4px_6px_-4px_rgba(0,0,0,0.1)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1)]",
        )}
      >
        <header
          data-node-id="2533:3620"
          className="relative z-10 flex h-9 shrink-0 items-center px-3 shadow-[inset_0_-0.5px_0_rgba(0,0,0,0.1)]"
        >
          {/* breadcrumb trail, Figma node 2533:3621 */}
          <Breadcrumb items={breadcrumb} />
        </header>
        <div data-node-id="2533:3622" className="relative z-10 min-h-[2293px] w-full">
          {children}
        </div>
      </div>
    </section>
  )
}
