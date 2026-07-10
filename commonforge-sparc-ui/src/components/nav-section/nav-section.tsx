import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ListBase } from "@/components/list-base"

export interface NavSectionProps {
  /** section caption, rendered uppercase (e.g. "Operations"). Omit for an unlabeled group. */
  label?: string
  /** the nav-items belonging to this section */
  children?: ReactNode
  className?: string
}

/**
 * nav-section — a labeled group of nav-items in the sidebar.
 *
 * The caption is a list-base row styled as a static section header:
 * 12px / 16px, #8F8F8F, uppercase, 2px vertical padding, and it drops
 * list-base's min-height so it sits at its natural ~20px. It is
 * non-interactive (hover suppressed). Children are the section's nav-items.
 *
 * NOTE: the caption is uppercased via CSS to match the Figma screenshot
 * (the exported JSON text is title-case). Pass a human-readable label.
 * Colors are the cool-gray family, reconcile into tokens with the rest later.
 */
export function NavSection({ label, children, className }: NavSectionProps) {
  return (
    <div role="group" aria-label={label} className={cn("space-y-0.5", className)}>
      {label != null && (
        <ListBase className="min-h-0 py-0.5 text-[0.625rem] leading-[0.875rem] text-[#8F8F8F] uppercase hover:bg-transparent cursor-default">
          {label}
        </ListBase>
      )}
      {children}
    </div>
  )
}
