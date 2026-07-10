import type { ReactNode, HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * list-base — the shared row primitive.
 *
 * Every list-shaped component composes this: nav-item, footer-item,
 * menu-item, select-option, command-item. Slots + states only, no
 * navigation or selection logic (that lives in the composing component).
 *
 * NOTE: text/hover colors below use the brand "Neutral Gray" (cool) scale
 * from the Figma spec (#525252 text, #F5F5F5 hover, #A3A3A3 disabled).
 * These are arbitrary values for now — reconcile into `gray-*` tokens once
 * we settle warm vs cool neutrals across the system.
 */
const listBase = cva(
  "flex min-h-6 items-center gap-2 rounded-sm px-2 py-1 text-xs leading-4 select-none",
  {
    variants: {
      state: {
        default: "text-[#525252] hover:bg-[#F5F5F5]",
        hover: "text-[#525252] bg-[#F5F5F5]",
        selected: "text-[#525252] bg-[#F5F5F5]",
        disabled: "text-[#A3A3A3] cursor-not-allowed",
      },
      tone: {
        default: "",
        // danger colours are applied per-state below: each destructive state
        // needs its own text + fill from the red (danger) ramp, which overrides
        // the neutral state colours via tailwind-merge (compounds come last).
        danger: "",
      },
    },
    compoundVariants: [
      { tone: "danger", state: "default", class: "text-red-500 hover:bg-red-25" },
      { tone: "danger", state: "hover", class: "text-red-500 bg-red-25" },
      { tone: "danger", state: "selected", class: "text-red-500 bg-red-50" },
      { tone: "danger", state: "disabled", class: "text-red-200" },
    ],
    defaultVariants: { state: "default", tone: "default" },
  },
)

export interface ListBaseProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listBase> {
  /** leading slot — icon, radio, checkbox, avatar */
  leading?: ReactNode
  /** trailing slot — chevron, check, badge, shortcut */
  trailing?: ReactNode
  /** the row label */
  children: ReactNode
}

export function ListBase({
  leading,
  trailing,
  children,
  state,
  tone,
  className,
  ...props
}: ListBaseProps) {
  return (
    <div className={cn(listBase({ state, tone }), className)} {...props}>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {leading != null && <span className="flex shrink-0 items-center">{leading}</span>}
        <span className="truncate">{children}</span>
      </span>
      {trailing != null && <span className="flex shrink-0 items-center">{trailing}</span>}
    </div>
  )
}
