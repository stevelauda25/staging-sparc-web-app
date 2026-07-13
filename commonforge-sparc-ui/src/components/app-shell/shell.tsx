import { createContext, useContext } from "react"
import { LayoutLeft } from "@untitledui/icons"
import { cn } from "@/lib/utils"

export interface ShellState {
  /** the rail is collapsed (hidden) */
  collapsed: boolean
  /** flip collapsed <-> expanded */
  toggle: () => void
  /** true for the ~200ms the rail is animating between states */
  sliding: boolean
}

const ShellContext = createContext<ShellState>({
  collapsed: false,
  toggle: () => {},
  sliding: false,
})

export const ShellProvider = ShellContext.Provider

/** read the shell's collapse state + toggle (e.g. for the sidebar/header toggle) */
export function useShell() {
  return useContext(ShellContext)
}

/**
 * SidebarToggle — the collapse/expand control (the panel icon).
 *
 * It is rendered as a *real child* of whichever container currently owns it: the
 * account-switcher while the rail is shown, the content header while it is
 * collapsed. Being a genuine child means it scrolls with that container instead
 * of floating pinned over it. During the ~200ms slide the app-shell paints a
 * matching overlay clone that carries the motion, so this one hides itself
 * (opacity) while `sliding` to avoid a doubled icon.
 */
export function SidebarToggle({ className }: { className?: string }) {
  const { collapsed, toggle, sliding } = useShell()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md text-secondary outline-none hover:bg-[#F5F5F5] hover:text-primary focus-visible:ring-2 focus-visible:ring-[#CFC7BC]",
        sliding && "pointer-events-none opacity-0",
        className,
      )}
    >
      <LayoutLeft className="size-4" />
    </button>
  )
}
