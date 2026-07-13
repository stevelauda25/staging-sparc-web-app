import { useEffect, useRef, useState, type PointerEvent } from "react"
import { ChevronDown, ChevronRight } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { SegmentedButton } from "@/components/segmented-button"
import { Legend } from "@/components/legend"
import { ListBase } from "@/components/list-base"
import { ChartTooltip } from "@/components/chart-tooltip"

// 24 months of forecast horizon (2 years). The range control shows the first N
// of these, so a shorter range zooms into the near-term forecast.
const MONTHS = [
  "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
  "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
]
const Y_TICKS = [220, 200, 180, 160, 140, 120, 100, 80, 60, 40, 20, 0]

const SERIES = [
  {
    id: "assigned",
    label: "Assigned workers",
    color: "#352e29",
    values: [100, 38, 60, 88, 115, 148, 145, 115, 124, 142, 136, 128, 120, 96, 110, 138, 150, 142, 158, 150, 130, 148, 140, 132],
  },
  {
    id: "progress",
    label: "In-progress",
    color: "#008fa3",
    values: [80, 66, 68, 98, 138, 180, 168, 118, 135, 165, 114, 110, 122, 100, 118, 150, 170, 160, 175, 168, 140, 158, 130, 120],
  },
  {
    id: "win90",
    label: "90% win",
    color: "#d9368a",
    values: [42, 36, 53, 55, 74, 148, 141, 141, 170, 180, 112, 96, 110, 90, 120, 140, 165, 175, 168, 150, 175, 185, 130, 110],
  },
  {
    id: "win60",
    label: "60% win",
    color: "#f8b84e",
    values: [106, 72, 88, 97, 122, 171, 120, 103, 140, 155, 152, 112, 128, 105, 115, 145, 168, 150, 160, 140, 150, 165, 158, 120],
  },
  {
    id: "potential",
    label: "Potential",
    color: "#d94800",
    values: [91, 59, 67, 69, 98, 139, 136, 118, 145, 178, 150, 102, 115, 88, 100, 130, 155, 145, 158, 150, 160, 180, 155, 118],
  },
]

const GRAPH_FILTERS = [
  { id: "all", label: "All graph" },
  ...SERIES.map((series) => ({ id: series.id, label: series.label, color: series.color })),
] as const

type GraphFilterId = (typeof GRAPH_FILTERS)[number]["id"]

const RANGE_OPTIONS = ["1M", "3M", "6M", "1Y", "1.5Y", "2Y", "All"] as const
type RangeOption = (typeof RANGE_OPTIONS)[number]

// how many of the 24 months each range shows (from now forward)
const RANGE_MONTHS: Record<RangeOption, number> = {
  "1M": 2,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
  "1.5Y": 18,
  "2Y": 24,
  All: 24,
}
const PLOT = { left: 40, top: 6.5, width: 1096, height: 363 }
const SVG_WIDTH = PLOT.left + PLOT.width
const SVG_HEIGHT = 397
const MAX_Y = 220
const RIGHT_CHART_LINE_COLOR = "#e0e0e0"
const HOVER_MARKER_SIZE = 10
const HOVER_MARKER_OFFSET = HOVER_MARKER_SIZE / 2
const TOOLTIP_WIDTH = 168
const TIMELINE_START_YEAR = 2026
const TIMELINE_START_MONTH = 7
const MS_PER_DAY = 24 * 60 * 60 * 1000
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function xAt(index: number, count: number) {
  return PLOT.left + (count <= 1 ? 0 : (index / (count - 1)) * PLOT.width)
}

function yAt(value: number) {
  return PLOT.top + (1 - value / MAX_Y) * PLOT.height
}

function pointsFor(values: number[]) {
  return values.map((value, index) => [xAt(index, values.length), yAt(value)] as const)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function weekRangeForX(x: number, count: number) {
  if (count <= 1) return formatWeekRange(0)

  const timelineStart = Date.UTC(TIMELINE_START_YEAR, TIMELINE_START_MONTH, 1)
  const progress = clamp(((x - PLOT.left) / PLOT.width) * (count - 1), 0, count - 1)
  const monthIndex = Math.min(Math.floor(progress + 0.0001), count - 1)
  const monthProgress = monthIndex >= count - 1 ? 0 : progress - monthIndex
  const monthStart = Date.UTC(TIMELINE_START_YEAR, TIMELINE_START_MONTH + monthIndex, 1)
  const monthEnd = Date.UTC(TIMELINE_START_YEAR, TIMELINE_START_MONTH + monthIndex + 1, 1)
  const dayOffsetInMonth = Math.floor(((monthEnd - monthStart) * monthProgress) / MS_PER_DAY)
  const currentDate = monthStart + dayOffsetInMonth * MS_PER_DAY
  const absoluteDayOffset = Math.floor((currentDate - timelineStart) / MS_PER_DAY)
  const weekStartOffset = Math.floor(absoluteDayOffset / 7) * 7

  return formatWeekRange(weekStartOffset)
}

function formatWeekRange(weekStartOffset: number) {
  const start = new Date(Date.UTC(TIMELINE_START_YEAR, TIMELINE_START_MONTH, 1 + weekStartOffset))
  const end = new Date(start.getTime() + 6 * MS_PER_DAY)
  const startMonth = MONTH_LABELS[start.getUTCMonth()]
  const endMonth = MONTH_LABELS[end.getUTCMonth()]
  const startDay = start.getUTCDate()
  const endDay = end.getUTCDate()

  return startMonth === endMonth ? `${startMonth} ${startDay} - ${endDay}` : `${startMonth} ${startDay} - ${endMonth} ${endDay}`
}

function valueFromY(y: number) {
  const rawValue = (1 - (y - PLOT.top) / PLOT.height) * MAX_Y
  return Math.round(clamp(rawValue, 0, MAX_Y))
}

function valueOnSmoothPath(values: number[], x: number) {
  const [, y] = pointOnSmoothPath(pointsFor(values), x)
  return valueFromY(y)
}

function cubicAt(a: number, b: number, c: number, d: number, t: number) {
  const inverse = 1 - t
  return inverse ** 3 * a + 3 * inverse ** 2 * t * b + 3 * inverse * t ** 2 * c + t ** 3 * d
}

function pointOnSmoothPath(points: readonly (readonly [number, number])[], x: number) {
  const clampedX = clamp(x, PLOT.left, PLOT.left + PLOT.width)
  const segmentProgress = ((clampedX - PLOT.left) / PLOT.width) * (points.length - 1)
  const segmentIndex = clamp(Math.floor(segmentProgress), 0, points.length - 2)
  const start = points[segmentIndex]
  const end = points[segmentIndex + 1]
  const beforeStart = points[segmentIndex - 1] ?? start
  const afterEnd = points[segmentIndex + 2] ?? end
  const cp1 = [start[0] + (end[0] - beforeStart[0]) / 6, start[1] + (end[1] - beforeStart[1]) / 6] as const
  const cp2 = [end[0] - (afterEnd[0] - start[0]) / 6, end[1] - (afterEnd[1] - start[1]) / 6] as const

  let low = 0
  let high = 1
  for (let i = 0; i < 12; i += 1) {
    const middle = (low + high) / 2
    const middleX = cubicAt(start[0], cp1[0], cp2[0], end[0], middle)
    if (middleX < clampedX) low = middle
    else high = middle
  }

  const t = (low + high) / 2
  return [clampedX, cubicAt(start[1], cp1[1], cp2[1], end[1], t)] as const
}

function smoothPath(points: readonly (readonly [number, number])[]) {
  if (points.length < 2) return ""

  const command = points.map((point, index, source) => {
    if (index === 0) return `M ${point[0]} ${point[1]}`

    const previous = source[index - 1]
    const next = source[index + 1] ?? point
    const beforePrevious = source[index - 2] ?? previous
    const cp1x = previous[0] + (point[0] - beforePrevious[0]) / 6
    const cp1y = previous[1] + (point[1] - beforePrevious[1]) / 6
    const cp2x = point[0] - (next[0] - previous[0]) / 6
    const cp2y = point[1] - (next[1] - previous[1]) / 6

    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point[0]} ${point[1]}`
  })

  return command.join(" ")
}

function areaPath(values: number[]) {
  const points = pointsFor(values)
  const firstX = points[0][0]
  const lastX = points[points.length - 1][0]
  return `${smoothPath(points)} L ${lastX} ${PLOT.top + PLOT.height} L ${firstX} ${PLOT.top + PLOT.height} Z`
}

export interface DashboardForecastChartProps {
  className?: string
}

export function DashboardForecastChart({ className }: DashboardForecastChartProps) {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("1Y")
  const [selectedGraph, setSelectedGraph] = useState<GraphFilterId>("all")
  const [graphOpen, setGraphOpen] = useState(false)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const graphFilterRef = useRef<HTMLDivElement>(null)

  // the range control drives the visible window: show the first N months
  const visibleCount = RANGE_MONTHS[selectedRange]
  const visibleMonths = MONTHS.slice(0, visibleCount)
  const selectedGraphOption = GRAPH_FILTERS.find((filter) => filter.id === selectedGraph) ?? GRAPH_FILTERS[0]
  const activeSeries = selectedGraph === "all" ? SERIES : SERIES.filter((series) => series.id === selectedGraph)
  const visibleSeries = activeSeries.map((series) => ({ ...series, values: series.values.slice(0, visibleCount) }))
  const labelStep = visibleCount > 14 ? 2 : 1
  const hoverWeekRange = hoverX == null ? null : weekRangeForX(hoverX, visibleCount)
  const tooltipOnLeft = hoverX != null && hoverX > PLOT.left + PLOT.width - TOOLTIP_WIDTH - 24

  useEffect(() => {
    if (!graphOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!graphFilterRef.current?.contains(event.target as Node)) {
        setGraphOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setGraphOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [graphOpen])

  function handleChartPointerMove(event: PointerEvent<SVGRectElement>) {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const pointerX = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH
    setHoverX(clamp(pointerX, PLOT.left, PLOT.left + PLOT.width))
  }

  return (
    <section
      data-node-id="forecast-worker-need-chart"
      className={cn(
        "flex h-[570px] w-full flex-col overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-white",
        "shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-black/10 px-3">
        <h2 className="text-sm leading-5 font-medium text-primary">Forecast worker need</h2>
        <a
          href="#forecast-graph"
          className="flex items-center gap-0.5 text-xs leading-4 font-normal text-secondary underline underline-offset-2"
        >
          Open Forecast Graph
          <ChevronRight size={14} className="text-secondary" />
        </a>
      </header>

      <div className="flex h-[526px] flex-col gap-8 p-3">
        <div className="flex h-[26px] items-center justify-between">
          <div className="flex items-center gap-2">
            <SegmentedButton
              fill
              size="small"
              className="w-[273px]"
              value={selectedRange}
              onChange={(v) => {
                setSelectedRange(v as RangeOption)
                setHoverX(null)
              }}
              options={RANGE_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
            <div ref={graphFilterRef} className="relative shrink-0">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={graphOpen}
                onClick={() => setGraphOpen((open) => !open)}
                className={cn(
                  "flex h-[26px] items-center justify-center gap-1 rounded-[6px] border-[0.5px] border-black/10 bg-white px-2.5 py-1 text-xs leading-[14px] font-normal text-primary shadow-[inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.2),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.25)] hover:border-black/30",
                  graphOpen && "border-black/30",
                )}
              >
                {"color" in selectedGraphOption && (
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: selectedGraphOption.color }}
                  />
                )}
                {selectedGraphOption.label}
                <ChevronDown size={12} className={cn("text-primary", graphOpen && "rotate-180")} />
              </button>
              {graphOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-30 mt-1 flex w-[176px] flex-col gap-0.5 rounded-[6px] border-[0.5px] border-black/10 bg-white p-1 shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_4px_8px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.05)]"
                >
                  {GRAPH_FILTERS.map((filter) => {
                    const selected = filter.id === selectedGraph
                    return (
                      <ListBase
                        key={filter.id}
                        role="menuitemradio"
                        aria-checked={selected}
                        state={selected ? "selected" : "default"}
                        leading={
                          "color" in filter ? (
                            <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: filter.color }} />
                          ) : undefined
                        }
                        className={cn("w-full cursor-pointer rounded-[2px]", selected && "font-medium text-black")}
                        onClick={() => {
                          setSelectedGraph(filter.id)
                          setGraphOpen(false)
                          setHoverX(null)
                        }}
                      >
                        {filter.label}
                      </ListBase>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-[444px] flex-col items-center gap-6 pb-2">
          <div className="relative h-[397px] w-full">
            <div className="pointer-events-none absolute inset-0 z-10">
              {Y_TICKS.map((tick, index) => (
                <span
                  key={tick}
                  className="absolute left-0 w-8 text-left text-[11px] leading-[13px] font-normal text-secondary"
                  style={{ top: `${PLOT.top + index * 33 - 6}px` }}
                >
                  {tick}
                </span>
              ))}

              <div className="absolute bottom-0 left-0 right-0 h-[13px]">
                {visibleMonths.map((month, index) => {
                  if (index % labelStep !== 0 && index !== visibleMonths.length - 1) return null
                  return (
                    <span
                      key={`${month}-${index}`}
                      className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[11px] leading-[13px] font-normal text-secondary"
                      style={{ left: `${(xAt(index, visibleMonths.length) / SVG_WIDTH) * 100}%` }}
                    >
                      {month}
                    </span>
                  )
                })}
              </div>
            </div>
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="absolute inset-0 h-full w-full overflow-visible"
              role="img"
              aria-label={`Forecast worker need line chart over the next ${visibleCount} months`}
              preserveAspectRatio="none"
            >
              <defs>
                {SERIES.map((series) => (
                  <linearGradient key={series.id} id={`${series.id}-area`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={series.color} stopOpacity="0.16" />
                    <stop offset="100%" stopColor={series.color} stopOpacity="0.04" />
                  </linearGradient>
                ))}
                {hoverX != null && (
                  <>
                    <clipPath id="forecast-left-mask">
                      <rect x={PLOT.left} y={PLOT.top} width={hoverX - PLOT.left} height={PLOT.height} />
                    </clipPath>
                    <clipPath id="forecast-right-mask">
                      <rect
                        x={hoverX}
                        y={PLOT.top}
                        width={PLOT.left + PLOT.width - hoverX}
                        height={PLOT.height}
                      />
                    </clipPath>
                  </>
                )}
              </defs>

              {Y_TICKS.map((tick, index) => (
                <g key={tick}>
                  <line
                    x1={PLOT.left}
                    x2={PLOT.left + PLOT.width}
                    y1={PLOT.top + index * 33}
                    y2={PLOT.top + index * 33}
                    stroke="#f5f5f5"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}

              {visibleSeries.map((series) => (
                <path
                  key={`${series.id}-area`}
                  d={areaPath(series.values)}
                  fill={`url(#${series.id}-area)`}
                  opacity={series.id === "assigned" ? 0.75 : 1}
                  clipPath={hoverX != null ? "url(#forecast-left-mask)" : undefined}
                />
              ))}

              <line
                x1={PLOT.left}
                x2={PLOT.left + PLOT.width}
                y1={yAt(127)}
                y2={yAt(127)}
                stroke="#e51d31"
                strokeWidth="1"
                strokeDasharray="7 7"
                vectorEffect="non-scaling-stroke"
                clipPath={hoverX != null ? "url(#forecast-left-mask)" : undefined}
              />
              <line
                x1={PLOT.left}
                x2={PLOT.left + PLOT.width}
                y1={yAt(97)}
                y2={yAt(97)}
                stroke="#129457"
                strokeWidth="1"
                strokeDasharray="7 7"
                vectorEffect="non-scaling-stroke"
                clipPath={hoverX != null ? "url(#forecast-left-mask)" : undefined}
              />

              {visibleSeries.map((series) => (
                <path
                  key={`${series.id}-line`}
                  d={smoothPath(pointsFor(series.values))}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  clipPath={hoverX != null ? "url(#forecast-left-mask)" : undefined}
                />
              ))}

              {hoverX != null && (
                <>
                  <line
                    x1={PLOT.left}
                    x2={PLOT.left + PLOT.width}
                    y1={yAt(127)}
                    y2={yAt(127)}
                    stroke="#e51d31"
                    strokeWidth="1"
                    strokeDasharray="7 7"
                    vectorEffect="non-scaling-stroke"
                    clipPath="url(#forecast-right-mask)"
                    pointerEvents="none"
                  />
                  <line
                    x1={PLOT.left}
                    x2={PLOT.left + PLOT.width}
                    y1={yAt(97)}
                    y2={yAt(97)}
                    stroke="#129457"
                    strokeWidth="1"
                    strokeDasharray="7 7"
                    vectorEffect="non-scaling-stroke"
                    clipPath="url(#forecast-right-mask)"
                    pointerEvents="none"
                  />
                  {visibleSeries.map((series) => (
                    <path
                      key={`${series.id}-right-line`}
                      d={smoothPath(pointsFor(series.values))}
                      fill="none"
                      stroke={RIGHT_CHART_LINE_COLOR}
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      clipPath="url(#forecast-right-mask)"
                      pointerEvents="none"
                    />
                  ))}
                </>
              )}

              <rect
                x={PLOT.left}
                y={PLOT.top}
                width={PLOT.width}
                height={PLOT.height}
                fill="transparent"
                pointerEvents="all"
                style={{ cursor: "crosshair" }}
                onPointerMove={handleChartPointerMove}
                onPointerLeave={() => setHoverX(null)}
              />
            </svg>
            {hoverX != null && (
              <div className="pointer-events-none absolute inset-0 z-20">
                <span
                  className="absolute w-px bg-[#352e29]/55"
                  style={{
                    left: `${(hoverX / SVG_WIDTH) * 100}%`,
                    top: `${(PLOT.top / SVG_HEIGHT) * 100}%`,
                    height: `${(PLOT.height / SVG_HEIGHT) * 100}%`,
                    transform: "translateX(-0.5px)",
                  }}
                />
                {visibleSeries.map((series) => {
                  const [markerX, markerY] = pointOnSmoothPath(pointsFor(series.values), hoverX)
                  return (
                    <span
                      key={`${series.id}-hover-marker`}
                      className="absolute rounded-full border border-white"
                      style={{
                        width: HOVER_MARKER_SIZE,
                        height: HOVER_MARKER_SIZE,
                        backgroundColor: series.color,
                        left: `calc(${(markerX / SVG_WIDTH) * 100}% - ${HOVER_MARKER_OFFSET}px)`,
                        top: `calc(${(markerY / SVG_HEIGHT) * 100}% - ${HOVER_MARKER_OFFSET}px)`,
                      }}
                    />
                  )
                })}
                {hoverWeekRange != null && (
                  <ChartTooltip
                    title={hoverWeekRange}
                    items={visibleSeries.map((series) => ({
                      color: series.color,
                      label: series.label,
                      value: valueOnSmoothPath(series.values, hoverX),
                    }))}
                    className="absolute top-3"
                    style={{
                      left: `calc(${(hoverX / SVG_WIDTH) * 100}% + ${tooltipOnLeft ? -TOOLTIP_WIDTH - 12 : 12}px)`,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div aria-label="Forecast chart legend" className="flex h-[15px] items-center justify-center gap-5">
            {activeSeries.map((series) => (
              <Legend key={series.id} variant="square" color={series.color} label={series.label} />
            ))}
            <Legend variant="line" color="#e51d31" label="Total workforce" />
            <Legend variant="line" color="#129457" label="Carlton workforce" />
          </div>
        </div>
      </div>
    </section>
  )
}
