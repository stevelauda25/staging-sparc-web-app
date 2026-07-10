import { Fragment, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface SegmentedButtonOption {
  value: string
  label: string
  /** optional count badge, shown only when provided */
  count?: number
}

export interface SegmentedButtonProps {
  options: SegmentedButtonOption[]
  /** the selected option's value */
  value: string
  onChange: (value: string) => void
  /** medium = the raw component (14px / 36px), small = the chart range tabs (12px / 22px) */
  size?: "medium" | "small"
  /** stretch the segments to equal width to fill the container (give it a width via className) */
  fill?: boolean
  /** show the divider line between segments (default true) */
  dividers?: boolean
  className?: string
}

const SIZE = {
  medium: {
    button: "gap-2 rounded-[6px] py-2 text-[14px] leading-[20px]",
    hugPx: "px-3",
    indicator: "rounded-[6px]",
    badge: "size-5 text-[12px]",
    sep: "h-5",
  },
  small: {
    button: "gap-2 rounded-[4px] py-1 text-[12px] leading-[14px]",
    hugPx: "px-2",
    indicator: "rounded-[4px]",
    badge: "size-[14px] text-[10px]", // measured for the small size: keeps the button at 22px
    sep: "h-4",
  },
} as const

function CountBadge({ count, selected, cls }: { count: number; selected: boolean; cls: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-normal leading-none tabular-nums",
        cls,
        selected
          ? "bg-white/20 text-white"
          : "bg-black/5 text-[#8f8f8f] group-hover:bg-black/10 group-hover:text-black",
      )}
    >
      {count}
    </span>
  )
}

/**
 * segmented-button — a single-select button group with a sliding selection pill,
 * matching the forecast chart's control (#f5f5f5 track, #3d3d3d pill, #525252
 * idle, no hover state). Two sizes: medium (raw component 2176:7625) and small
 * (chart range tabs 2494:7304). Each segment can carry an optional count badge.
 */
export function SegmentedButton({
  options,
  value,
  onChange,
  size = "small",
  fill = false,
  dividers = true,
  className,
}: SegmentedButtonProps) {
  const s = SIZE[size]
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<{ left: number; width: number; height: number } | null>(null)
  const selectedIndex = options.findIndex((o) => o.value === value)

  useLayoutEffect(() => {
    const root = rootRef.current
    const active = buttonRefs.current[selectedIndex]
    if (!root || !active) return

    const update = () => {
      const rootRect = root.getBoundingClientRect()
      const btnRect = active.getBoundingClientRect()
      // left-0 sits at the padding box (inside the border), so subtract the border
      const borderLeft = parseFloat(getComputedStyle(root).borderLeftWidth) || 0
      setPill({
        left: btnRect.left - rootRect.left - borderLeft,
        width: btnRect.width,
        height: btnRect.height,
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(root)
    observer.observe(active)
    return () => observer.disconnect()
  }, [selectedIndex, options.length])

  return (
    <div
      ref={rootRef}
      role="tablist"
      className={cn(
        "relative items-center gap-[2px] rounded-[6px] border-[0.5px] border-black/10 bg-[#f5f5f5] p-[1.5px]",
        fill ? "flex w-full" : "inline-flex",
        className,
      )}
    >
      {pill && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 left-0 bg-[#3d3d3d] shadow-[0_1px_2px_rgba(0,0,0,0.12)] will-change-transform motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.455,0.03,0.515,0.955)] motion-reduce:transition-none",
            s.indicator,
          )}
          style={{
            width: pill.width,
            height: pill.height,
            transform: `translate(${pill.left}px, -50%)`,
          }}
        />
      )}
      {options.map((option, i) => {
        const selected = option.value === value
        return (
          <Fragment key={option.value}>
            {i > 0 && dividers && (
              <span aria-hidden="true" className={cn("relative z-10 w-0 shrink-0 border-l border-black/10", s.sep)} />
            )}
            <button
              ref={(el) => {
                buttonRefs.current[i] = el
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "group relative z-10 flex cursor-pointer items-center justify-center font-normal outline-none focus-visible:ring-2 focus-visible:ring-black/25 motion-safe:transition-colors",
                s.button,
                fill ? "min-w-0 flex-1 basis-0 px-0" : cn("shrink-0", s.hugPx),
                selected ? "text-white" : "text-[#525252] hover:bg-black/5",
              )}
            >
              {option.label}
              {option.count != null && <CountBadge count={option.count} selected={selected} cls={s.badge} />}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
