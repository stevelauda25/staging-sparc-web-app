import { useState, type PointerEvent } from "react"
import { ChevronDown, ChevronRight } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { SegmentedButton } from "@/components/segmented-button"
import { Legend } from "@/components/legend"

const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
const Y_TICKS = [220, 200, 180, 160, 140, 120, 100, 80, 60, 40, 20, 0]

const SERIES = [
  {
    id: "assigned",
    label: "Assigned workers",
    color: "#352e29",
    values: [100, 38, 60, 88, 115, 148, 145, 115, 124, 142, 136, 128],
  },
  {
    id: "progress",
    label: "In-progress",
    color: "#00c3d2",
    values: [80, 66, 68, 98, 138, 180, 168, 118, 135, 165, 114, 110],
  },
  {
    id: "win90",
    label: "90% win",
    color: "#ff4aa2",
    values: [42, 36, 53, 55, 74, 148, 141, 141, 170, 180, 112, 96],
  },
  {
    id: "win60",
    label: "60% win",
    color: "#ffae4c",
    values: [106, 72, 88, 97, 122, 171, 120, 103, 140, 155, 152, 112],
  },
  {
    id: "potential",
    label: "Potential",
    color: "#f45100",
    values: [91, 59, 67, 69, 98, 139, 136, 118, 145, 178, 150, 102],
  },
]

const RANGE_OPTIONS = ["1M", "3M", "6M", "1Y", "1.5Y", "2Y", "All"] as const
type RangeOption = (typeof RANGE_OPTIONS)[number]
const PLOT = { left: 40, top: 6.5, width: 1096, height: 363 }
const SVG_WIDTH = PLOT.left + PLOT.width
const SVG_HEIGHT = 397
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
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
  return `${smoothPath(points)} L ${xAt(MONTHS.length - 1)} ${PLOT.top + PLOT.height} L ${xAt(0)} ${
    PLOT.top + PLOT.height
  } Z`
}

export interface DashboardForecastChartProps {
  className?: string
}

export function DashboardForecastChart({ className }: DashboardForecastChartProps) {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("1M")
  const [hoverX, setHoverX] = useState<number | null>(null)

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
        <h2 className="text-sm leading-5 font-medium text-black">Forecast worker need</h2>
        <a
          href="#forecast-graph"
          className="flex items-center gap-0.5 text-xs leading-4 font-normal text-[#525252] underline underline-offset-2"
        >
          Open Forecast Graph
          <ChevronRight size={14} className="text-[#525252]" />
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
              onChange={(v) => setSelectedRange(v as RangeOption)}
              options={RANGE_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
            <button
              type="button"
              className="flex h-[26px] items-center justify-center gap-1 rounded-[6px] border-[0.5px] border-black/10 bg-white px-2.5 py-1 text-xs leading-[14px] font-normal text-black shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            >
              All graph
              <ChevronDown size={12} className="text-black" />
            </button>
          </div>
        </div>

        <div className="flex h-[444px] flex-col items-center gap-6 pb-2">
          <div className="relative h-[397px] w-full">
            <div className="pointer-events-none absolute inset-0 z-10">
              {Y_TICKS.map((tick, index) => (
                <span
                  key={tick}
                  className="absolute left-0 w-8 text-left text-[11px] leading-[13px] font-normal text-[#525252]"
                  style={{ top: `${PLOT.top + index * 33 - 6}px` }}
                >
                  {tick}
                </span>
              ))}

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between">
                {MONTHS.map((month) => (
                  <span
                    key={month}
                    className="w-20 text-center text-[11px] leading-[13px] font-normal text-[#525252]"
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
              aria-label="Forecast worker need line chart from August to July"
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
                    y1={PLOT.top + index * 33}
                    y2={PLOT.top + index * 33}
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

              {hoverX != null && (
                <rect
                  x={hoverX}
                  y={PLOT.top}
                  width={PLOT.left + PLOT.width - hoverX}
                  height={PLOT.height}
                  fill="white"
                  opacity="0.62"
                  pointerEvents="none"
                />
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
                {SERIES.map((series) => {
                  const [markerX, markerY] = pointOnSmoothPath(pointsFor(series.values), hoverX)
                  return (
                    <span
                      key={`${series.id}-hover-marker`}
                      className="absolute size-[6px] rounded-full border border-white"
                      style={{
                        backgroundColor: series.color,
                        left: `calc(${(markerX / SVG_WIDTH) * 100}% - 3px)`,
                        top: `calc(${(markerY / SVG_HEIGHT) * 100}% - 3px)`,
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div aria-label="Forecast chart legend" className="flex h-[15px] items-center justify-center gap-5">
            {SERIES.map((series) => (
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
