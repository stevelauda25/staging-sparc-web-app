import type { InputHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  /** md = 12px padding / 14px text (regular), sm = 8px padding all sides / 12px text (small) */
  size?: "sm" | "md"
  /** error styling (red border) */
  error?: boolean
  /** leading icon inside the field (18px) */
  leading?: ReactNode
  /** trailing icon inside the field (18px) */
  trailing?: ReactNode
  /** flush left addon with a divider (e.g. a label dropdown) */
  prefix?: ReactNode
  /** flush right addon with a divider */
  suffix?: ReactNode
  containerClassName?: string
  /** override the padding on the input area (e.g. a tighter sidebar field) */
  fieldClassName?: string
}

/**
 * text-input — the raw input field.
 *
 * From Figma: fill gray-50 (#F5F5F5), 0.5px black/10 border, 6px radius. Focus
 * (via focus-within) turns the border black and adds a 3px black/10 ring;
 * error uses the red-500 border; disabled uses gray-100 fill with #8F8F8F
 * text. 14px text, #525252 placeholder. Cool grays are arbitrary values for
 * now, to be reconciled with the rest of the neutrals.
 *
 * NOTE: colors match the Figma exactly; the search-field composes this.
 */
export function TextInput({
  size = "md",
  error = false,
  disabled,
  leading,
  trailing,
  prefix,
  suffix,
  containerClassName,
  fieldClassName,
  className,
  ...props
}: TextInputProps) {
  // sm = fixed 32px, 8px horizontal padding, 12px/16px text (content is vertically
  // centered so the ⌘K badge and icons fit without stretching the field past 32px);
  // md = 12px padding all round / 14px text, height driven by content.
  const sizeClass = size === "sm" ? "h-8" : ""
  const addonPad = size === "sm" ? "px-2" : "px-4 py-3"
  const fieldPad = size === "sm" ? "px-2" : "p-3"
  const inputText = size === "sm" ? "text-[12px] leading-[16px]" : "text-sm leading-5"
  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-[6px] border-[0.5px] border-solid",
        sizeClass,
        disabled
          ? "border-black/10 bg-[#EBEBEB]"
          : error
            ? "border-red-500 bg-[#F5F5F5] focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]"
            : "border-black/10 bg-[#F5F5F5] focus-within:border-black focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]",
        containerClassName,
      )}
    >
      {prefix != null && (
        <div className={cn("flex shrink-0 items-center gap-2 border-r border-black/10 bg-surface", addonPad)}>
          {prefix}
        </div>
      )}

      <div className={cn("flex min-w-0 flex-1 items-center gap-2", fieldPad, fieldClassName)}>
        {leading != null && <span className="flex shrink-0 items-center text-secondary">{leading}</span>}
        <input
          disabled={disabled}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-secondary",
            inputText,
            disabled && "text-[#8F8F8F] placeholder:text-[#8F8F8F]",
            className,
          )}
          {...props}
        />
        {trailing != null && <span className="flex shrink-0 items-center text-secondary">{trailing}</span>}
      </div>

      {suffix != null && (
        <div className={cn("flex shrink-0 items-center gap-2 border-l border-black/10 bg-surface", addonPad)}>
          {suffix}
        </div>
      )}
    </div>
  )
}
