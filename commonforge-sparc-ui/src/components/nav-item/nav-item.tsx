import type { ComponentType, MouseEventHandler, SVGProps } from "react"
import { ChevronDown, ChevronRight } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { ListBase } from "@/components/list-base"

/** Any Untitled UI icon (they accept `size` plus standard SVG props). */
export type IconComponent = ComponentType<{ size?: number } & SVGProps<SVGSVGElement>>

/**
 * Icons are sized in rem (size-3 = 0.75rem = 12px at the base scale) so they
 * grow with the app's root font-size. 12px keeps a top-level row's label at
 * 8px pad + 12px icon + 8px gap = 28px, exactly the sub-list indent, so parent
 * and sub labels align down the rail (the indent below is the matching rem).
 */
const NAV_ICON_CLASS = "size-3"

export interface NavItemProps {
  /** Untitled UI icon for the row. Omit on sub-list rows. */
  icon?: IconComponent
  /** the row label */
  label: string
  /** current page — the selected treatment (#F0F0F0 fill, #000000 text) */
  current?: boolean
  /** show a chevron and mark the row expandable */
  expandable?: boolean
  /** chevron points down when expanded, right when collapsed */
  expanded?: boolean
  /** sub-list row: indented 28px, no leading icon */
  sub?: boolean
  /** destructive tone (e.g. Log out) — red text and fills from list-base */
  danger?: boolean
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
  /** escape hatch, merged last (used by the showcase to force a hover fill) */
  className?: string
}

/**
 * nav-item — a sidebar navigation row.
 *
 * Composes `list-base`: leading icon + label + optional expand chevron.
 * States: default, hover (from list-base), current (selected), disabled.
 * Structural variants: expandable (collapsed/expanded) and sub (indented).
 *
 * Chevron uses two distinct Untitled UI glyphs, not a rotation: ChevronDown
 * when expanded, ChevronRight when collapsed.
 *
 * NOTE: `current` overrides list-base's "selected" colors with the sidebar
 * treatment (#F0F0F0 fill on the #FBFAF9 rail, black text). These cool-gray
 * values are arbitrary for now, reconcile into tokens with the rest of the grays.
 */
export function NavItem({
  icon: Icon,
  label,
  current = false,
  expandable = false,
  expanded = false,
  sub = false,
  danger = false,
  disabled = false,
  onClick,
  className,
}: NavItemProps) {
  const Chevron = expanded ? ChevronDown : ChevronRight
  return (
    <ListBase
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-current={current ? "page" : undefined}
      aria-expanded={expandable ? expanded : undefined}
      aria-disabled={disabled || undefined}
      tone={danger ? "danger" : undefined}
      state={disabled ? "disabled" : current ? "selected" : "default"}
      leading={!sub && Icon ? <Icon className={NAV_ICON_CLASS} /> : undefined}
      trailing={expandable ? <Chevron className={cn(NAV_ICON_CLASS, "text-[#525252]")} /> : undefined}
      onClick={disabled ? undefined : onClick}
      // role="button" on a <div> gives no native Enter/Space activation, so wire
      // it up by hand (calling the element's own click) to keep the rail fully
      // keyboard-operable (WCAG 2.1.1).
      onKeyDown={
        disabled
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                e.currentTarget.click()
              }
            }
      }
      className={cn(
        "outline-none",
        !disabled && "cursor-pointer",
        !disabled &&
          "focus-visible:ring-2 focus-visible:ring-[#CFC7BC] focus-visible:ring-offset-0",
        sub && "pl-7", // 28px: 8px pad + 12px icon + 8px gap, aligns sub labels under parents
        current && "bg-[#F0F0F0] text-[#000000]",
        className,
      )}
    >
      {label}
    </ListBase>
  )
}
