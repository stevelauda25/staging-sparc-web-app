import { createContext, useContext } from "react"
import { cn } from "@/lib/utils"

export interface ShellState {
  /** the rail is collapsed (hidden) */
  collapsed: boolean
  /** flip collapsed <-> expanded */
  toggle: () => void
}

const ShellContext = createContext<ShellState>({
  collapsed: false,
  toggle: () => {},
})

export const ShellProvider = ShellContext.Provider

/** read the shell's collapse state + toggle */
export function useShell() {
  return useContext(ShellContext)
}

/**
 * SidebarToggle — a reserved 28px slot in the account-switcher (and the content
 * header when collapsed). It renders nothing visible: the app-shell paints ONE
 * persistent collapse toggle that simply slides between these two slots, so the
 * icon only ever moves. It never fades in or out and never doubles up.
 */
export function SidebarToggle({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block size-7 shrink-0", className)} />
}
