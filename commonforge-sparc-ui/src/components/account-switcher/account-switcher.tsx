import type { ReactNode } from "react"
import { ChevronDown, LayoutLeft } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"
import { Badge } from "@/components/badge"

export interface AccountSwitcherProps {
  /** display name, e.g. "Jason Heim" */
  name: string
  /** avatar image url; falls back to initials */
  avatarSrc?: string
  /** initials for the avatar fallback, e.g. "JH" */
  initials?: string
  /** role badge text, e.g. "Admin". Omit to hide the pill. */
  role?: string
  /** profile menu trigger */
  onClick?: () => void
  /** control rendered at the right edge (e.g. the shell's collapse toggle) */
  toggle?: ReactNode
  /** collapse-sidebar toggle (the panel icon); fallback when `toggle` is unset */
  onToggleSidebar?: () => void
  className?: string
}

/**
 * account-switcher — the profile header at the top of the rail.
 *
 * Full width: avatar + name + chevron on the left, a role badge and the
 * collapse (panel) icon on the right. Sized up from the Figma (avatar 20 -> 28,
 * name 14 -> 16) so it reads as a header rather than a nav row. The avatar
 * left-aligns with the nav icons below (8px rail pad + 4px + 4px = 16px).
 *
 * The Admin pill uses the shared badge (purple variant) at compact padding.
 * Its purple values are arbitrary until a purple ramp exists.
 */
export function AccountSwitcher({
  name,
  avatarSrc,
  initials,
  role,
  onClick,
  toggle,
  onToggleSidebar,
  className,
}: AccountSwitcherProps) {
  return (
    <div className={cn("flex h-10 w-[calc(100%+2px)] items-center gap-2 rounded-sm pl-1 pr-0", className)}>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClick}
          // -ml-1 + px-1 keeps a hover inset while the avatar sits at 12px, so its
          // center (23px) lines up with the nav/search icon centers; gap-1 gives
          // 4px between avatar and name, which lands the name on the 38px column
          className="-ml-1 flex min-w-0 items-center gap-1 rounded-sm px-1 py-0.5 outline-none hover:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-[#CFC7BC]"
        >
          <Avatar src={avatarSrc} fallback={initials} alt={name} size={20} />
          <span className="truncate text-sm leading-5 text-primary">{name}</span>
          <ChevronDown className="size-3 shrink-0 text-secondary" />
        </button>
        {role && (
          // purple role badge; keep the compact profile padding
          <Badge variant="purple" size="sm" className="shrink-0 px-1.5 py-0.5">
            {role}
          </Badge>
        )}
      </div>
      {toggle ??
        (onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="flex shrink-0 items-center justify-center rounded-sm p-1 text-secondary outline-none hover:bg-[#F5F5F5] hover:text-primary focus-visible:ring-2 focus-visible:ring-[#CFC7BC]"
          >
            <LayoutLeft className="size-4" />
          </button>
        ))}
    </div>
  )
}
