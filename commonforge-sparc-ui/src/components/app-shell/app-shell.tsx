import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"

export interface AppShellProps {
  /** the main dashboard content, rendered to the right of the rail */
  children?: ReactNode
  className?: string
}

/**
 * app-shell — the top-level dashboard frame.
 *
 * The rail and the content are both authored at the same comfortable scale in
 * rem, so there is NO zoom anywhere. The whole app scales from the root
 * font-size (see index.css), which is a fixed value. Resizing the browser only
 * reflows and scrolls the layout, it never rescales the element sizes. The rail
 * fills the viewport height with plain flexbox (footer pinned, nav scrolls).
 */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-surface", className)}>
      <Sidebar className="h-full shrink-0" />
      <main className="flex-1 overflow-auto overscroll-y-none">{children}</main>
    </div>
  )
}
