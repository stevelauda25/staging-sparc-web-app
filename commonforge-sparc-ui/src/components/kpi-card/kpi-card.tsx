import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface KpiTrend {
  /** up = green rising triangle, down = red falling triangle */
  direction: "up" | "down"
  /** the delta shown beside the triangle, e.g. "6" */
  value: string
}

export interface KpiCardProps {
  label: string
  value: string
  /** rendered under the value, in the default size only */
  description?: string
  /** a unit suffix rendered after the value, e.g. "/hr" (ignored if `trend` is set) */
  suffix?: string
  /** a delta indicator (green up / red down) rendered after the value */
  trend?: KpiTrend
  /** optional icon: top-right in the default size, leading in compact */
  icon?: ReactNode
  size?: "default" | "compact"
  className?: string
}

// Text sizes: label 12/16, value 20, desc 11/15 (per the request). Trend delta
// (14) and unit suffix (12) follow the Figma.
const LABEL = "text-[12px] leading-[16px] font-normal text-secondary"
const VALUE = "font-sans text-[20px] leading-[1.2] font-medium tracking-normal text-primary"
const DESC = "text-[11px] leading-[15px] font-normal text-secondary"

/** an 8px filled triangle, pointing up by default (down = rotated) */
function Triangle({ down }: { down?: boolean }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className={cn("shrink-0", down && "rotate-180")}>
      <path d="M4 0.5L7.5 7.5L0.5 7.5Z" fill="currentColor" />
    </svg>
  )
}

/** the value plus its optional trend badge or unit suffix */
function ValueRow({ value, trend, suffix }: Pick<KpiCardProps, "value" | "trend" | "suffix">) {
  return (
    <div className={cn("flex shrink-0", trend ? "items-center gap-2" : "items-end gap-[2px]")}>
      <p className={VALUE}>{value}</p>
      {trend ? (
        <span
          className={cn(
            "flex items-center gap-1 text-[14px] leading-[1.2] font-normal",
            trend.direction === "up" ? "text-[#129457]" : "text-[#e51d31]",
          )}
        >
          <Triangle down={trend.direction === "down"} />
          {trend.value}
        </span>
      ) : (
        suffix != null && (
          <span className="py-[2px] text-[12px] leading-[1.2] font-normal text-secondary">{suffix}</span>
        )
      )}
    </div>
  )
}

function IconSlot({ icon }: { icon: ReactNode }) {
  return <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
}

// border + the dashboard's layered card shadow (shadow-003)
const CARD =
  "overflow-hidden border-[0.5px] border-black/10 bg-white p-3 shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1)]"

/**
 * kpi-card — a single KPI tile, built from the Figma "KPI tile" set (2272:1099).
 *
 * Default size: label plus an optional top-right icon, then the value (with an
 * optional up/down trend or a unit suffix), then a description. Compact size: a
 * leading icon with a label and value, no description. Text sizes reuse the
 * dashboard KPI card (label 14 / value 20 / desc 12).
 */
export function KpiCard({
  label,
  value,
  description,
  suffix,
  trend,
  icon,
  size = "default",
  className,
}: KpiCardProps) {
  if (size === "compact") {
    return (
      <article className={cn(CARD, "flex items-center gap-3 rounded-[8px]", className)}>
        {icon != null && <IconSlot icon={icon} />}
        <div className="flex min-w-0 flex-col items-start gap-1">
          <p className={LABEL}>{label}</p>
          <ValueRow value={value} trend={trend} suffix={suffix} />
        </div>
      </article>
    )
  }

  return (
    <article className={cn(CARD, "flex items-start gap-4 rounded-[6px]", className)}>
      <div className="flex h-20 min-w-0 flex-1 flex-col items-start justify-between">
        <p className={LABEL}>{label}</p>
        <div className="flex flex-col items-start gap-[6px]">
          <ValueRow value={value} trend={trend} suffix={suffix} />
          {description != null && <p className={DESC}>{description}</p>}
        </div>
      </div>
      {icon != null && <IconSlot icon={icon} />}
    </article>
  )
}
