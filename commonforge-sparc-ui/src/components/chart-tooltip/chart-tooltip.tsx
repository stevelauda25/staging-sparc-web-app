import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

export const CHART_TOOLTIP_SHADOW =
  "0px 4px 8px 0px rgba(0,0,0,0.1),0px 2px 8px 0px rgba(0,0,0,0.15),0px 1px 2px 0px rgba(0,0,0,0.25),inset 0px 0px 0px 1px rgba(0,0,0,0.1),inset 0px -1px 1px 0px rgba(0,0,0,0.1),inset 0px 1px 2px 0px rgba(255,255,255,0.25)"

export interface ChartTooltipItem {
  label: ReactNode
  value?: ReactNode
  color?: string
  markerClassName?: string
}

export interface ChartTooltipProps {
  title: ReactNode
  items: ChartTooltipItem[]
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function ChartTooltip({ title, items, children, className, style }: ChartTooltipProps) {
  return (
    <div
      className={cn(
        "pointer-events-none w-[168px] rounded-[6px] border-[0.5px] border-white/10 bg-[#211d1a] px-3 py-2.5 text-white",
        className,
      )}
      style={{ boxShadow: CHART_TOOLTIP_SHADOW, ...style }}
    >
      <div className="mb-2 truncate text-[13px] leading-[18px] font-medium text-white">{title}</div>
      <div className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex min-w-0 items-center gap-2 text-[12px] leading-4">
            {item.color != null && (
              <span
                aria-hidden="true"
                className={cn("size-2.5 shrink-0 rounded-[3px]", item.markerClassName)}
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="min-w-0 flex-1 truncate text-[#b8b8b8]">{item.label}</span>
            {item.value != null && <span className="shrink-0 text-right text-white">{item.value}</span>}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
