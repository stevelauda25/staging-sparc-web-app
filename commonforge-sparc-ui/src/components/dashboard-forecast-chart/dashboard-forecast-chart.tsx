import { Fragment, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown, ChevronRight } from "@untitledui/icons"
import { cn } from "@/lib/utils"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const Y_TICKS = [220, 200, 180, 160, 140, 120, 100, 80, 60, 40, 20, 0]

const SERIES = [
  {
    id: "assigned",
    label: "Assigned workers",
    color: "#352e29",
    values: [148, 145, 115, 124, 142, 136, 128, 100, 38, 60, 88, 115],
  },
  {
    id: "progress",
    label: "In-progress",
    color: "#00c3d2",
    values: [180, 168, 118, 135, 165, 114, 110, 80, 66, 68, 98, 138],
  },
  {
    id: "win90",
    label: "90% win",
    color: "#ff4aa2",
    values: [148, 141, 141, 170, 180, 112, 96, 42, 36, 53, 55, 74],
  },
  {
    id: "win60",
    label: "60% win",
    color: "#ffae4c",
    values: [171, 120, 103, 140, 155, 152, 112, 106, 72, 88, 97, 122],
  },
  {
    id: "potential",
    label: "Potential",
    color: "#f45100",
    values: [139, 136, 118, 145, 178, 150, 102, 91, 59, 67, 69, 98],
  },
]

const RANGE_OPTIONS = ["1M", "3M", "6M", "1Y", "1.5Y", "2Y", "All"] as const
type RangeOption = (typeof RANGE_OPTIONS)[number]
const DASHBOARD_DENSITY = 1.1667
const scale = (value: number) => value * DASHBOARD_DENSITY
const PLOT = { left: scale(40), top: scale(6.5), width: scale(1096), height: scale(363) }
const SVG_HEIGHT = scale(397)
const SVG_WIDTH = scale(1136)
const Y_STEP = PLOT.height / (Y_TICKS.length - 1)
const MAX_Y = 220

function xAt(index: number) {
  return PLOT.left + (index / (MONTHS.length - 1)) * PLOT.width
}

function yAt(value: number) {
  return PLOT.top + (1 - value / MAX_Y) * PLOT.height
}

function pointsFor(values: number[]) {
  return values.map((value, index) => [xAt(index), yAt(value)] as const)
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
  return `${smoothPath(points)} L ${xAt(MONTHS.length - 1)} ${PLOT.top + PLOT.height} L ${xAt(0)} ${
    PLOT.top + PLOT.height
  } Z`
}

function SegmentedControl({
  selectedRange,
  onRangeChange,
}: {
  selectedRange: RangeOption
  onRangeChange: (range: RangeOption) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const activeButton = buttonRefs.current[RANGE_OPTIONS.indexOf(selectedRange)]

    if (!root || !activeButton) return

    const updateIndicator = () => {
      const rootRect = root.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      setIndicator({
        left: buttonRect.left - rootRect.left,
        width: buttonRect.width,
      })
    }

    updateIndicator()

    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(root)
    resizeObserver.observe(activeButton)

    return () => resizeObserver.disconnect()
  }, [selectedRange])

  return (
    <div
      ref={rootRef}
      className="relative flex h-[1.625rem] w-[17.0625rem] items-center gap-[0.125rem] rounded-[0.375rem] border-[0.5px] border-black/10 bg-[#f5f5f5] p-[0.125rem]"
      role="group"
      aria-label="Forecast range"
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-0 h-[1.375rem] rounded-[0.25rem] bg-[#3d3d3d] shadow-[0_1px_2px_rgba(0,0,0,0.12)] will-change-transform motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.455,0.03,0.515,0.955)] motion-reduce:transition-none"
          style={{ width: indicator.width, transform: `translate(${indicator.left}px, -50%)` }}
        />
      )}
      {RANGE_OPTIONS.map((option, index) => (
        <Fragment key={option}>
          <button
            ref={(element) => {
              buttonRefs.current[index] = element
            }}
            type="button"
            aria-pressed={selectedRange === option}
            onClick={() => onRangeChange(option)}
            className={cn(
              "relative z-10 flex h-[1.375rem] min-w-0 flex-1 basis-0 cursor-pointer items-center justify-center rounded-[0.25rem] px-0 text-xs leading-[0.875rem] font-normal outline-none motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-in-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-black/25",
              selectedRange === option ? "text-white" : "text-[#525252]",
            )}
          >
            {option}
          </button>
          {index < RANGE_OPTIONS.length - 1 && <span className="relative z-10 h-4 w-0 shrink-0 border-l border-black/10" />}
        </Fragment>
      ))}
    </div>
  )
}

function LegendSwatch({ color, dashed = false }: { color: string; dashed?: boolean }) {
  if (dashed) {
    return (
      <span
        className="h-px w-2.5 shrink-0 border-t"
        style={{ borderColor: color, borderTopStyle: "dashed" }}
      />
    )
  }

  return <span className="size-2.5 shrink-0 rounded-[0.1875rem]" style={{ background: color }} />
}

export interface DashboardForecastChartProps {
  className?: string
}

export function DashboardForecastChart({ className }: DashboardForecastChartProps) {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("1M")
  const weekX = xAt(5.5)
  const weekLeft = `${(weekX / SVG_WIDTH) * 100}%`

  return (
    <section
      data-node-id="forecast-worker-need-chart"
      className={cn(
        "flex h-[35.625rem] w-full flex-col overflow-hidden rounded-[0.375rem] border-[0.5px] border-black/10 bg-white",
        "shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-black/10 px-3">
        <h2 className="text-sm leading-5 font-medium text-black">Forecast worker need</h2>
        <a
          href="#forecast-graph"
          className="flex items-center gap-0.5 text-xs leading-4 font-normal text-[#525252] underline underline-offset-2"
        >
          Open Forecast Graph
          <ChevronRight size={16} className="text-[#525252]" />
        </a>
      </header>

      <div className="flex h-[32.875rem] flex-col gap-8 p-3">
        <div className="flex h-[1.625rem] items-center justify-between">
          <div className="flex items-center gap-2">
            <SegmentedControl selectedRange={selectedRange} onRangeChange={setSelectedRange} />
            <button
              type="button"
              className="flex h-[1.625rem] items-center justify-center gap-1 rounded-[0.375rem] border-[0.5px] border-black/10 bg-white px-2.5 py-1 text-xs leading-[0.875rem] font-normal text-black shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            >
              All graph
              <ChevronDown size={14} className="text-black" />
            </button>
          </div>
        </div>

        <div className="flex h-[27.75rem] flex-col items-center gap-6 pb-2">
          <div className="relative h-[24.8125rem] w-full">
            <div className="pointer-events-none absolute inset-0 z-10">
              {Y_TICKS.map((tick, index) => (
                <span
                  key={tick}
                  className="absolute left-0 w-8 text-left text-[0.6875rem] leading-[0.8125rem] font-normal text-[#525252]"
                  style={{ top: `${PLOT.top + index * Y_STEP - scale(6)}px` }}
                >
                  {tick}
                </span>
              ))}

              <span
                className="absolute -top-[0.9375rem] -translate-x-1/2 text-center text-[0.6875rem] leading-[0.9375rem] font-normal whitespace-nowrap text-[#525252]"
                style={{ left: weekLeft }}
              >
                This week
              </span>
              <span
                className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f1f1f1] bg-[#352e29]"
                style={{ left: weekLeft, top: PLOT.top }}
                aria-hidden
              />

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between">
                {MONTHS.map((month) => (
                  <span
                    key={month}
                    className="w-20 text-center text-[0.6875rem] leading-[0.8125rem] font-normal text-[#525252]"
                  >
                    {month}
                  </span>
                ))}
              </div>
            </div>
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="absolute inset-0 h-full w-full overflow-visible"
              role="img"
              aria-label="Forecast worker need line chart from January to December"
              preserveAspectRatio="none"
            >
              <defs>
                {SERIES.map((series) => (
                  <linearGradient key={series.id} id={`${series.id}-area`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={series.color} stopOpacity="0.16" />
                    <stop offset="100%" stopColor={series.color} stopOpacity="0.04" />
                  </linearGradient>
                ))}
              </defs>

              {Y_TICKS.map((tick, index) => (
                <g key={tick}>
                  <line
                    x1={PLOT.left}
                    x2={PLOT.left + PLOT.width}
                    y1={PLOT.top + index * Y_STEP}
                    y2={PLOT.top + index * Y_STEP}
                    stroke="#f5f5f5"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}

              {SERIES.map((series) => (
                <path
                  key={`${series.id}-area`}
                  d={areaPath(series.values)}
                  fill={`url(#${series.id}-area)`}
                  opacity={series.id === "assigned" ? 0.75 : 1}
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
              />

              {SERIES.map((series) => (
                <path
                  key={`${series.id}-line`}
                  d={smoothPath(pointsFor(series.values))}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              <line
                x1={weekX}
                x2={weekX}
                y1={PLOT.top}
                y2={PLOT.top + PLOT.height}
                stroke="#352e29"
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div
            aria-label="Forecast chart legend"
            className="flex h-[0.9375rem] items-center justify-center gap-5 text-[0.6875rem] leading-[0.9375rem] font-normal text-[#525252]"
          >
            {SERIES.map((series) => (
              <div key={series.id} className="flex items-center gap-1 whitespace-nowrap">
                <LegendSwatch color={series.color} />
                <span>{series.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 whitespace-nowrap">
              <LegendSwatch color="#e51d31" dashed />
              <span>Total workforce</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <LegendSwatch color="#129457" dashed />
              <span>Carlton workforce</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
