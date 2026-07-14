import { cn } from "@/lib/utils"

/** `square` = filled rounded chip, `line` = a horizontal stroke (e.g. threshold lines) */
export type LegendVariant = "square" | "line"

export interface LegendProps {
  /** swatch shape (default `square`) */
  variant?: LegendVariant
  /** swatch color, any CSS color string — fully adjustable */
  color: string
  /** the item label */
  label: string
  /** optional trailing count, e.g. the budget legend "61" */
  value?: string
  /** optional trailing percent, muted, e.g. "(57%)" */
  percent?: string
  /** line variant only: dashed vs solid stroke (default dashed) */
  dashed?: boolean
  /** line variant only: explicit stroke style; overrides `dashed` when set. Use
   *  distinct styles (e.g. dashed vs dotted) so lines differ by shape, not just
   *  color, for colorblind readers. */
  lineStyle?: "solid" | "dashed" | "dotted"
  /** square variant only: subtle white hairline around the chip (matches the donut legend) */
  bordered?: boolean
  className?: string
}

function LegendSwatch({
  variant,
  color,
  dashed,
  lineStyle,
  bordered,
}: Pick<LegendProps, "variant" | "color" | "dashed" | "lineStyle" | "bordered">) {
  if (variant === "line") {
    // SVG stroke (not a CSS border) so the weight and dash count are exact: a
    // bold 2px line showing two clear dashes across the swatch
    const style = lineStyle ?? (dashed ? "dashed" : "solid")
    const dashArray = style === "dotted" ? "1.5 3" : style === "dashed" ? "6 4" : undefined
    return (
      <svg aria-hidden="true" width="16" height="2" viewBox="0 0 16 2" className="shrink-0 overflow-visible">
        <line
          x1="0"
          y1="1"
          x2="16"
          y2="1"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashArray}
          strokeLinecap={style === "dotted" ? "round" : "butt"}
        />
      </svg>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn("size-2.5 shrink-0 rounded-[3px]", bordered && "border border-white/10")}
      style={{ backgroundColor: color }}
    />
  )
}

/**
 * legend — a single chart/map legend item: a swatch plus a label, with an
 * optional trailing value + percent. Two swatch variants: `square` (filled
 * chip) and `line` (a dashed or solid stroke). Color is fully adjustable via
 * the `color` prop. Compose several in a flex row to build a full legend.
 */
export function Legend({
  variant = "square",
  color,
  label,
  value,
  percent,
  dashed = true,
  lineStyle,
  bordered = false,
  className,
}: LegendProps) {
  const hasValue = value != null || percent != null
  return (
    <span
      className={cn(
        "flex items-center whitespace-nowrap text-[11px] leading-[15px] font-normal",
        hasValue ? "gap-2" : "gap-1",
        className,
      )}
    >
      <span className="flex items-center gap-1">
        <LegendSwatch variant={variant} color={color} dashed={dashed} lineStyle={lineStyle} bordered={bordered} />
        <span className="text-secondary">{label}</span>
      </span>
      {hasValue && (
        <span className="flex items-center gap-[2px]">
          {value != null && <span className="text-secondary">{value}</span>}
          {percent != null && <span className="text-[#8f8f8f]">{percent}</span>}
        </span>
      )}
    </span>
  )
}
