import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface DayProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** the selected date (or a range endpoint): dark fill, white number */
  selected?: boolean
  /** a day between the two range endpoints: subtle fill, dark number */
  inRange?: boolean
  /** a day spilling in from an adjacent month, shown muted */
  outsideMonth?: boolean
}

/**
 * day — the base cell of the date picker (Figma component-set "day", node 2257:2234).
 *
 * A 24px rounded square (6px radius, 12px number) with three core states:
 *   default   transparent fill, #000000 number
 *   hover     #F5F5F5 fill (CSS :hover)
 *   selected  #2B2B2B fill, white number
 *
 * Plus in-range (subtle #F5F5F5 fill for days between range endpoints),
 * outside-month (muted #8f8f8f) and disabled (#cccccc). This is the reusable
 * unit the month grid and the Default / Range picker variants compose.
 */
export function Day({
  selected = false,
  inRange = false,
  outsideMonth = false,
  disabled = false,
  className,
  children,
  ...props
}: DayProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-[4px] text-[12px] leading-[14px] font-normal outline-none focus-visible:ring-2 focus-visible:ring-[#CFC7BC] motion-safe:transition-colors motion-reduce:transition-none",
        disabled && "cursor-not-allowed text-[#cccccc]",
        !disabled && selected && "cursor-pointer bg-[#2b2b2b] text-white",
        !disabled && !selected && inRange && "cursor-pointer text-[#000000]",
        !disabled &&
          !selected &&
          !inRange &&
          cn("cursor-pointer text-[#000000] hover:bg-[#f5f5f5]", outsideMonth && "text-[#8f8f8f]"),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
