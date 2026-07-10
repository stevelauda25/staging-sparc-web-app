import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * badge — a small status/role label.
 *
 * Colour recipe from the Figma: fill {color}-25, border {color}-200,
 * text + dot {color}-500 (Success mapped exactly onto the green scale, so the
 * same recipe drives error/warning). Neutral and outline are grayscale, and
 * purple is the role badge used by the account-switcher (arbitrary values
 * until a purple ramp exists).
 */
const badge = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] border-[0.5px] border-solid font-medium leading-[1.3]",
  {
    variants: {
      variant: {
        success: "border-green-200 bg-green-25 text-green-500",
        error: "border-red-200 bg-red-25 text-red-500",
        warning: "border-amber-200 bg-amber-25 text-amber-500",
        neutral: "border-neutral-200 bg-neutral-100 text-neutral-600",
        outline: "border-neutral-300 bg-surface text-foreground",
        purple: "border-[#BC97F7] bg-[#F7F1FF] text-[#7635D9]",
      },
      size: {
        sm: "px-1.5 py-1 text-[10px]",
        md: "px-2 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  },
)

export interface BadgeProps extends VariantProps<typeof badge> {
  children: ReactNode
  /** colored status dot before the label (takes the text color) */
  dot?: boolean
  /** optional leading icon */
  icon?: ReactNode
  className?: string
}

export function Badge({ variant, size, dot, icon, children, className }: BadgeProps) {
  return (
    <span className={cn(badge({ variant, size }), className)}>
      {icon != null && <span className="flex shrink-0 items-center">{icon}</span>}
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
