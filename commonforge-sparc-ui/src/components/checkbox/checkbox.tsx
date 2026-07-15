import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type CheckboxSize = "small" | "medium" | "large"

// box + radius + checkmark size per Figma size variant (small 12 / medium 16 / large 20)
const SIZES: Record<CheckboxSize, { box: string; radius: string; check: string }> = {
  small: { box: "size-3", radius: "rounded-[3px]", check: "size-2" },
  medium: { box: "size-4", radius: "rounded-[4px]", check: "size-[10px]" },
  large: { box: "size-5", radius: "rounded-[5px]", check: "size-[13px]" },
}

export interface CheckboxProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** on (checked) vs off (unchecked) */
  checked?: boolean
  /** box size: small 12, medium 16, large 20 */
  size?: CheckboxSize
  /** fires with the next checked value when toggled */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * checkbox — the on/off control (Figma component-set "checkbox", node 2169:5148).
 *
 * Three states across three sizes (small / medium / large):
 *   off     #b8b8b8 hairline, white fill
 *   hover   border darkens to #000000 (CSS :hover)
 *   on      #2b2b2b fill, white check (matches the date picker's selected fill)
 *
 * Disabled dims to 50%. Built as a role="checkbox" button so it keyboard-toggles
 * (Space / Enter) and merges className.
 */
export function Checkbox({
  checked = false,
  size = "medium",
  disabled = false,
  className,
  onCheckedChange,
  onClick,
  ...props
}: CheckboxProps) {
  const s = SIZES[size]
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        onCheckedChange?.(!checked)
        onClick?.(event)
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border outline-none focus-visible:ring-2 focus-visible:ring-[#CFC7BC] motion-safe:transition-colors motion-reduce:transition-none",
        s.box,
        s.radius,
        checked ? "border-transparent bg-[#2b2b2b] text-white" : "border-[#b8b8b8] bg-white",
        !disabled && !checked && "hover:border-[#000000]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
      {...props}
    >
      {checked && (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={s.check}>
          <path
            d="M4 8.5L6.75 11.25L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
