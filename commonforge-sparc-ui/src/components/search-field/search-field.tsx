import { useState, type ReactNode } from "react"
import { SearchMd } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { TextInput, type TextInputProps } from "@/components/text-input"
import { ListBase } from "@/components/list-base"

export interface SearchResult {
  id: string
  label: string
  leading?: ReactNode
  trailing?: ReactNode
}

export interface SearchFieldProps
  extends Omit<TextInputProps, "leading" | "prefix" | "suffix" | "results" | "trailing"> {
  /** results shown in the dropdown */
  results?: SearchResult[]
  /** force the dropdown open (defaults to open on focus) */
  open?: boolean
  onSelectResult?: (result: SearchResult) => void
  /** keyboard shortcut hint shown as a trailing kbd badge, e.g. "⌘K" */
  shortcut?: string
  /** override the search icon size (defaults to 18 for md, 12 for sm) */
  iconSize?: number
}

/**
 * search-field — a text-input configured for search.
 *
 * Composes text-input with a leading search icon. When focused (or forced via
 * `open`) it shows a results dropdown: a white panel with a #E0E0E0 border and
 * a layered shadow, whose rows are list-base. States (default, filled, error,
 * disabled) come from text-input.
 */
export function SearchField({
  results,
  open,
  onSelectResult,
  placeholder = "Search projects",
  containerClassName,
  shortcut,
  size = "md",
  iconSize,
  ...props
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false)
  const showResults = (open ?? focused) && results != null && results.length > 0
  // the small size uses a 12px icon, the medium an 18px icon
  const resolvedIconSize = iconSize ?? (size === "sm" ? 12 : 18)

  return (
    <div className="relative">
      <TextInput
        size={size}
        // sized in rem (px-at-base / 16) so the icon scales with the root font-size
        leading={<SearchMd style={{ width: `${resolvedIconSize / 16}rem`, height: `${resolvedIconSize / 16}rem` }} />}
        trailing={
          shortcut ? (
            <kbd className="flex min-w-5 items-center justify-center rounded-[3px] border-[0.6px] border-black/10 py-0.5 pr-0.5 pl-1 font-sans text-[0.625rem] leading-[0.875rem] tracking-[0.2px] text-[#8F8F8F]">
              {shortcut}
            </kbd>
          ) : undefined
        }
        placeholder={placeholder}
        containerClassName={containerClassName}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />

      {showResults && (
        <div
          className={cn(
            "absolute left-0 top-full z-10 mt-1.5 w-full rounded-[6px] border border-[#E0E0E0] bg-surface p-2",
            "shadow-[0_4px_6px_0_rgba(0,0,0,0.05),0_8px_12px_-2px_rgba(0,0,0,0.05),0_2px_12px_-8px_rgba(0,0,0,0.05)]",
          )}
        >
          <div className="flex flex-col gap-2">
            {results!.map((r) => (
              <ListBase
                key={r.id}
                role="option"
                leading={r.leading}
                trailing={r.trailing}
                className="cursor-pointer"
                // prevent the input's blur from closing the list before the click registers
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectResult?.(r)}
              >
                {r.label}
              </ListBase>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
