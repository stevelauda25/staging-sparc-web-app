import { cn } from "@/lib/utils"

export interface SeparatorProps {
  className?: string
}

/**
 * separator — a hairline divider row for the sidebar (and menus).
 *
 * A 12px-tall row with the list-base 8px horizontal inset, holding a centered
 * 1px line. This inset makes the rule line up with the text of the rows above
 * and below rather than running full-bleed.
 *
 * NOTE: the line is black/10 per the Figma (rgba(0,0,0,0.1)). Reconcile into
 * --border-hairline with the rest of the neutrals later. Pass `className`
 * (e.g. px-0) for a full-bleed rule.
 */
export function Separator({ className }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("flex h-3 items-center px-2", className)}
    >
      <span className="h-[0.6px] w-full bg-black/10" />
    </div>
  )
}
