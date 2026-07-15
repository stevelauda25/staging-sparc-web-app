import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import { createPortal } from "react-dom"
import { Calendar, ChevronDown, ChevronRight, LinkExternal01 } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/lib/use-media-query"
import { SegmentedButton } from "@/components/segmented-button"
import { Legend } from "@/components/legend"
import { ListBase } from "@/components/list-base"
import { ChartTooltip } from "@/components/chart-tooltip"
import { DatePicker } from "@/components/date-picker"
import { Checkbox } from "@/components/checkbox"

// 24 months of forecast horizon (2 years). The range control shows the first N
// of these, so a shorter range zooms into the near-term forecast.
const MONTHS = [
  "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
  "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
]
const Y_TICKS = [220, 200, 180, 160, 140, 120, 100, 80, 60, 40, 20, 0]

// Declining backlog funnel over the 2-year horizon, sampled weekly (POINTS_PER_MONTH
// points per month) so the lines carry many hills. At every point potential ≥ 60% win
// ≥ 90% win ≥ in-progress ≥ assigned workers: each tier is the tier below it plus a
// non-negative gap, so the five lines nest and never cross. The trend tapers (near-
// term demand high, the Assigned line dropping off sharply), and a deterministic,
// multi-frequency wiggle (no Math.random, so it is stable across reloads) gives the
// lines irregular rolling hills with peaks and drops of noticeably different size.
const POINTS_PER_MONTH = 4
const POINT_COUNT = 24 * POINTS_PER_MONTH

function hill(index: number, seed: number, amplitude: number) {
  return (
    Math.sin(index * 0.55 + seed) * 0.45 +
    Math.sin(index * 1.1 + seed * 1.7) * 0.33 +
    Math.sin(index * 1.9 + seed * 0.6) * 0.22
  ) * amplitude
}
// per-point trend curves (point p is month p / POINTS_PER_MONTH)
function assignedTrend(point: number) {
  const month = point / POINTS_PER_MONTH
  if (month <= 1) return 108 + month * 6
  if (month <= 4) return 114 - (month - 1) * 23
  return Math.max(23, 45 - (month - 4) * 1.0)
}
function progressGapTrend(point: number) {
  const month = point / POINTS_PER_MONTH
  if (month <= 1) return 12 - month * 2
  if (month <= 4) return 10 + (month - 1) * 13
  return Math.max(26, 49 - (month - 4) * 1.1)
}
// thin at the near edge, widest a few months in, then tapering to the far future
function upperGapTrend(point: number, peak: number) {
  const month = point / POINTS_PER_MONTH
  if (month <= 4) return 4 + (peak - 4) * (month / 4)
  return Math.max(4, peak - (month - 4) * ((peak - 4) / 20))
}

const FN_ASSIGNED = Array.from({ length: POINT_COUNT }, (_, p) => Math.round(assignedTrend(p) + hill(p, 0, 4)))
const FN_PROGRESS = FN_ASSIGNED.map((value, p) => value + Math.max(4, Math.round(progressGapTrend(p) + hill(p, 1, 9))))
const FN_WIN90 = FN_PROGRESS.map((value, p) => value + Math.max(3, Math.round(upperGapTrend(p, 13) + hill(p, 2, 6))))
const FN_WIN60 = FN_WIN90.map((value, p) => value + Math.max(3, Math.round(upperGapTrend(p, 15) + hill(p, 3, 6))))
const FN_POTENTIAL = FN_WIN60.map((value, p) => value + Math.max(3, Math.round(upperGapTrend(p, 11) + hill(p, 4, 5))))

const SERIES = [
  { id: "assigned", label: "Assigned workers", color: "#352e29", values: FN_ASSIGNED },
  { id: "progress", label: "In-progress", color: "#4169D6", values: FN_PROGRESS },
  { id: "win90", label: "90% win", color: "#129457", values: FN_WIN90 },
  { id: "win60", label: "60% win", color: "#E59C0E", values: FN_WIN60 },
  { id: "potential", label: "Potential", color: "#DB4C86", values: FN_POTENTIAL },
]

const RANGE_OPTIONS = ["1W", "2W", "1M", "3M", "6M", "1Y", "1.5Y", "2Y", "All"] as const
type RangeOption = (typeof RANGE_OPTIONS)[number]

// how many of the 24 months each range shows (from now forward). the week ranges
// zoom below a month, so they render off WEEK_RANGE_DAYS instead of this table.
const RANGE_MONTHS: Record<RangeOption, number> = {
  "1W": 2,
  "2W": 2,
  "1M": 2,
  "3M": 3,
  "6M": 6,
  "1Y": 12,
  "1.5Y": 18,
  "2Y": 24,
  All: 24,
}
// week ranges show a day-level window: the monthly series is sampled once per day
const WEEK_RANGE_DAYS: Partial<Record<RangeOption, number>> = { "1W": 7, "2W": 14 }
// The plot fills its column edge to edge (no internal side margins); the y-axis
// numbers live in a fixed CSS gutter beside it and the x labels sit below it, each
// held a constant 8px off the plot (see the render).
const PLOT = { left: 0, top: 6.5, width: 1096, height: 363 }
const SVG_WIDTH = PLOT.left + PLOT.width
const SVG_HEIGHT = 397
const MAX_Y = 220
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

function timelineDate(year: number, month: number, day = 1) {
  return new Date(Date.UTC(year, month, day))
}

function toTimelineDate(date: Date) {
  return timelineDate(date.getFullYear(), date.getMonth(), date.getDate())
}

function addTimelineMonths(date: Date, months: number) {
  return timelineDate(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate())
}

function timelineMonthKey(date: Date) {
  return date.getUTCFullYear() * 12 + date.getUTCMonth()
}

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY))
}

function monthsBetweenInclusive(start: Date, end: Date) {
  return Math.max(2, timelineMonthKey(end) - timelineMonthKey(start) + 1)
}

function daysInUtcMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
}

// fractional month position of a date measured from the timeline start (month 0),
// so a day-level window can sample the monthly series between its points
function timelineMonthIndex(date: Date) {
  const startKey = TIMELINE_START_YEAR * 12 + TIMELINE_START_MONTH
  const monthKey = date.getUTCFullYear() * 12 + date.getUTCMonth()
  return monthKey - startKey + (date.getUTCDate() - 1) / daysInUtcMonth(date)
}

function monthlyValueAt(values: number[], monthIndex: number) {
  // values are sampled POINTS_PER_MONTH per month, so a month maps to that many points
  const position = clamp(monthIndex * POINTS_PER_MONTH, 0, values.length - 1)
  const low = Math.floor(position)
  const high = Math.min(low + 1, values.length - 1)
  return values[low] + (values[high] - values[low]) * (position - low)
}

// sample the monthly series once per day across a short (week-scale) window so the
// near-term view reads as a real daily line instead of one flat month-to-month jump
function dailyValuesForWindow(values: number[], start: Date, spanDays: number) {
  return Array.from({ length: spanDays + 1 }, (_, day) =>
    monthlyValueAt(values, timelineMonthIndex(new Date(start.getTime() + day * MS_PER_DAY))),
  )
}

function defaultChartWindow(monthCount: number) {
  return {
    start: timelineDate(TIMELINE_START_YEAR, TIMELINE_START_MONTH, 1),
    end: timelineDate(TIMELINE_START_YEAR, TIMELINE_START_MONTH + monthCount - 1, 1),
  }
}

function weekChartWindow(spanDays: number) {
  return {
    start: timelineDate(TIMELINE_START_YEAR, TIMELINE_START_MONTH, 1),
    end: timelineDate(TIMELINE_START_YEAR, TIMELINE_START_MONTH, 1 + spanDays),
  }
}

function selectedChartWindow(start: Date, end: Date) {
  const rangeStart = toTimelineDate(start)
  const rangeEnd = toTimelineDate(end)
  return rangeStart.getTime() <= rangeEnd.getTime()
    ? { start: rangeStart, end: rangeEnd }
    : { start: rangeEnd, end: rangeStart }
}

function pointCountForWindow(start: Date, end: Date) {
  return clamp(monthsBetweenInclusive(start, end), 2, SERIES[0].values.length)
}

function valuesForPointCount(values: number[], pointCount: number) {
  if (pointCount <= values.length) return values.slice(0, pointCount)

  return Array.from({ length: pointCount }, (_, index) => values[index % values.length])
}

function positionForDate(date: Date, start: Date, end: Date) {
  return PLOT.left + ((date.getTime() - start.getTime()) / Math.max(1, end.getTime() - start.getTime())) * PLOT.width
}

function dateLabelFor(date: Date, includeDay: boolean) {
  const month = MONTH_LABELS[date.getUTCMonth()]
  return includeDay ? `${month} ${date.getUTCDate()}` : month
}

function axisLabelForDate(date: Date, start: Date, end: Date, key: string, includeDay: boolean): AxisLabel {
  return {
    key,
    label: dateLabelFor(date, includeDay),
    year: date.getUTCFullYear(),
    position: clamp(positionForDate(date, start, end), PLOT.left, PLOT.left + PLOT.width),
  }
}

function weekRangeForX(x: number, start: Date, end: Date) {
  const progress = clamp((x - PLOT.left) / PLOT.width, 0, 1)
  const currentDate = new Date(start.getTime() + progress * (end.getTime() - start.getTime()))
  const dayOffset = Math.floor((currentDate.getTime() - start.getTime()) / MS_PER_DAY)
  const weekStart = new Date(start.getTime() + Math.floor(dayOffset / 7) * 7 * MS_PER_DAY)

  return formatWeekRangeFromDate(weekStart)
}

function formatWeekRangeFromDate(start: Date) {
  const rangeEnd = new Date(start.getTime() + 6 * MS_PER_DAY)
  const startMonth = MONTH_LABELS[start.getUTCMonth()]
  const endMonth = MONTH_LABELS[rangeEnd.getUTCMonth()]
  const startDay = start.getUTCDate()
  const endDay = rangeEnd.getUTCDate()

  return startMonth === endMonth ? `${startMonth} ${startDay} - ${endDay}` : `${startMonth} ${startDay} - ${endMonth} ${endDay}`
}

function dateAtTimelineOffset(dayOffset: number) {
  return new Date(Date.UTC(TIMELINE_START_YEAR, TIMELINE_START_MONTH, 1 + dayOffset))
}

type AxisLabel = {
  key: string
  label: string
  year: number
  position: number
  priority?: number
}

function dateAxisLabels(visibleCount: number, intervalDays: number): AxisLabel[] {
  const start = Date.UTC(TIMELINE_START_YEAR, TIMELINE_START_MONTH, 1)
  const end = Date.UTC(TIMELINE_START_YEAR, TIMELINE_START_MONTH + visibleCount - 1, 1)
  const totalDays = Math.max(1, Math.round((end - start) / MS_PER_DAY))
  const dayOffsets: number[] = []

  for (let day = 0; day < totalDays; day += intervalDays) {
    dayOffsets.push(day)
  }

  if (dayOffsets[dayOffsets.length - 1] !== totalDays) {
    const lastGap = totalDays - dayOffsets[dayOffsets.length - 1]
    if (lastGap < intervalDays * 0.6) {
      dayOffsets.pop()
    }
    dayOffsets.push(totalDays)
  }

  return dayOffsets.map((dayOffset) => {
    const date = dateAtTimelineOffset(dayOffset)
    return {
      key: `date-${dayOffset}`,
      label: `${MONTH_LABELS[date.getUTCMonth()]} ${date.getUTCDate()}`,
      year: date.getUTCFullYear(),
      position: PLOT.left + (dayOffset / totalDays) * PLOT.width,
    }
  })
}

function monthAxisLabelAt(month: string, index: number, total: number, priority = 0): AxisLabel {
  const absoluteMonth = TIMELINE_START_MONTH + index
  const isEdgeLabel = index === 0 || index === total - 1

  return {
    key: `${month}-${index}`,
    label: month,
    year: TIMELINE_START_YEAR + Math.floor(absoluteMonth / 12),
    position: xAt(index, total),
    priority: isEdgeLabel ? 3 : priority,
  }
}

function steppedMonthAxisLabels(visibleMonths: string[], interval: number): AxisLabel[] {
  const indexes: number[] = []
  const lastIndex = visibleMonths.length - 1

  for (let index = 0; index < visibleMonths.length; index += interval) {
    indexes.push(index)
  }

  if (indexes[indexes.length - 1] !== lastIndex) {
    const lastGap = lastIndex - indexes[indexes.length - 1]
    if (lastGap < 2) {
      indexes[indexes.length - 1] = lastIndex
    } else {
      indexes.push(lastIndex)
    }
  }

  const labels = indexes.map((index) => monthAxisLabelAt(visibleMonths[index], index, visibleMonths.length))
  const lastLabelIndex = labels.length - 1

  return labels.map((label, index) => ({
    ...label,
    position: PLOT.left + (lastLabelIndex <= 0 ? 0 : (index / lastLabelIndex) * PLOT.width),
  }))
}

function monthAxisLabels(visibleMonths: string[], labelStep: number): AxisLabel[] {
  const labels = visibleMonths.flatMap((month, index) => {
    const absoluteMonth = TIMELINE_START_MONTH + index
    const isYearAnchor = index === 0 || absoluteMonth % 12 === 0
    if (index % labelStep !== 0 && index !== visibleMonths.length - 1 && !isYearAnchor) return []
    return [monthAxisLabelAt(month, index, visibleMonths.length, isYearAnchor ? 2 : 0)]
  })

  return spacedAxisLabels(labels, labelStep > 1 ? 88 : 64)
}

function spacedAxisLabels(labels: AxisLabel[], minGap: number) {
  const selected: AxisLabel[] = []
  const candidates = [...labels].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.position - b.position)

  candidates.forEach((candidate) => {
    const hasCollision = selected.some((label) => Math.abs(label.position - candidate.position) < minGap)
    if (!hasCollision) {
      selected.push(candidate)
    }
  })

  return selected.sort((a, b) => a.position - b.position)
}

function axisLabelsForRange(range: RangeOption, visibleMonths: string[], labelStep: number) {
  if (range === "1M") return dateAxisLabels(visibleMonths.length, 7)
  if (range === "3M") return dateAxisLabels(visibleMonths.length, 14)
  if (range === "1.5Y") return steppedMonthAxisLabels(visibleMonths, 2)
  if (range === "2Y" || range === "All") return steppedMonthAxisLabels(visibleMonths, 3)
  return monthAxisLabels(visibleMonths, labelStep)
}

// Thin axis labels to the plot's real width, keeping them EVENLY spaced. The SVG
// stretches to its container, so a fixed SVG-space gap shrinks in real pixels on
// narrow screens and the month labels collide. Keep every label while neighbours
// clear `keepGapPx`; once that fails, drop to an evenly-spaced subset (first and
// last always kept) sized to the wider `pickGapPx`, so labels never bunch unevenly.
function pickEvenAxisLabels(labels: AxisLabel[], count: number) {
  if (labels.length <= count) return labels
  const clampedCount = Math.max(2, Math.min(count, labels.length))
  const picked = Array.from(
    { length: clampedCount },
    (_, i) => labels[Math.round((i * (labels.length - 1)) / (clampedCount - 1))],
  )
  return picked.filter((label, index) => index === 0 || label.key !== picked[index - 1].key)
}

function fitAxisLabels(
  labels: AxisLabel[],
  plotWidthPx: number,
  keepGapPx: number,
  pickGapPx: number,
  maxLabels = Number.POSITIVE_INFINITY,
) {
  if (labels.length <= 2) return labels
  if (labels.length > maxLabels) return pickEvenAxisLabels(labels, maxLabels)
  if (plotWidthPx <= 0) return labels
  const toPx = (position: number) => (position / SVG_WIDTH) * plotWidthPx
  const allClear = labels.every(
    (label, index) => index === 0 || toPx(label.position) - toPx(labels[index - 1].position) >= keepGapPx,
  )
  if (allClear) return labels
  const count = Math.max(2, Math.floor(plotWidthPx / pickGapPx))
  return pickEvenAxisLabels(labels, count)
}

function customDateAxisLabels(start: Date, end: Date): AxisLabel[] {
  const totalDays = daysBetween(start, end)
  if (totalDays <= 110) {
    const intervalDays = totalDays <= 45 ? 7 : 14
    const offsets: number[] = []
    for (let day = 0; day < totalDays; day += intervalDays) offsets.push(day)
    if (offsets[offsets.length - 1] !== totalDays) {
      const lastGap = totalDays - offsets[offsets.length - 1]
      if (lastGap < intervalDays * 0.6) offsets.pop()
      offsets.push(totalDays)
    }

    return offsets.map((offset) => {
      const date = new Date(start.getTime() + offset * MS_PER_DAY)
      return axisLabelForDate(date, start, end, `custom-day-${offset}`, true)
    })
  }

  const totalMonths = monthsBetweenInclusive(start, end)
  const intervalMonths = totalMonths <= 12 ? 1 : totalMonths <= 24 ? 2 : 3
  const labels: AxisLabel[] = [axisLabelForDate(start, start, end, "custom-start", start.getUTCDate() !== 1)]
  const firstMonth = timelineDate(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)

  for (let date = firstMonth, index = 1; date.getTime() < end.getTime(); date = addTimelineMonths(date, intervalMonths), index += 1) {
    labels.push(axisLabelForDate(date, start, end, `custom-month-${index}`, false))
  }

  const endLabel = axisLabelForDate(end, start, end, "custom-end", end.getUTCDate() !== 1)
  const lastLabel = labels[labels.length - 1]
  if (lastLabel && Math.abs(lastLabel.position - endLabel.position) < 64) labels.pop()
  labels.push(endLabel)

  return spacedAxisLabels(labels, 64)
}

const DATE_LABEL_FMT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })

/** the date-picker trigger label: "Date range" empty, one date, or a start - end pair */
function formatDateRange(range: { start: Date | null; end: Date | null }) {
  if (!range.start) return "Date range"
  if (!range.end) return DATE_LABEL_FMT.format(range.start)
  return `${DATE_LABEL_FMT.format(range.start)} - ${DATE_LABEL_FMT.format(range.end)}`
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

// a closed area from a curve straight down to the plot's baseline
function areaPath(values: number[]) {
  const points = pointsFor(values)
  const firstX = points[0][0]
  const lastX = points[points.length - 1][0]
  return `${smoothPath(points)} L ${lastX} ${PLOT.top + PLOT.height} L ${firstX} ${PLOT.top + PLOT.height} Z`
}

// mix a hex colour toward white; returns an rgb() string for a solid, lighter fill
function lighten(hex: string, whiteFraction: number) {
  const value = parseInt(hex.slice(1), 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  const mixed = channels.map((channel) => Math.round(channel + (255 - channel) * whiteFraction))
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`
}

export interface DashboardForecastChartProps {
  className?: string
}

export function DashboardForecastChart({ className }: DashboardForecastChartProps) {
  const isMobileAxis = useMediaQuery("(max-width: 767px)")
  const isMobile = isMobileAxis
  const [selectedRange, setSelectedRange] = useState<RangeOption>("2Y")
  const [selectedSeries, setSelectedSeries] = useState<string[]>(SERIES.map((series) => series.id))
  const [graphOpen, setGraphOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const dateFilterRef = useRef<HTMLDivElement>(null)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const graphFilterRef = useRef<HTMLDivElement>(null)
  // the plot's rendered width, used to thin the x-axis labels so they never collide
  const plotRef = useRef<HTMLDivElement>(null)
  const [plotWidth, setPlotWidth] = useState(0)

  const fallbackVisibleCount = RANGE_MONTHS[selectedRange]
  const rangeStart = dateRange.start
  const rangeEnd = dateRange.end
  const dateRangeComplete = rangeStart != null && rangeEnd != null
  // a custom date range wins; otherwise 1W/2W zoom to a day-level window
  const weekSpan = WEEK_RANGE_DAYS[selectedRange] ?? 0
  const isWeekView = !dateRangeComplete && weekSpan > 0
  const nearTermLabel = weekSpan === 7 ? "week" : "2 weeks"
  const chartWindow = dateRangeComplete
    ? selectedChartWindow(rangeStart, rangeEnd)
    : isWeekView
      ? weekChartWindow(weekSpan)
      : defaultChartWindow(fallbackVisibleCount)
  const visibleCount = dateRangeComplete
    ? pointCountForWindow(chartWindow.start, chartWindow.end)
    : isWeekView
      ? weekSpan + 1
      : fallbackVisibleCount
  const visibleMonths = MONTHS.slice(0, visibleCount)
  const allSeriesSelected = selectedSeries.length === SERIES.length
  const activeSeries = SERIES.filter((series) => selectedSeries.includes(series.id))
  const graphButtonLabel = allSeriesSelected
    ? "All graph"
    : selectedSeries.length === 0
      ? "No graphs"
      : `${selectedSeries.length} graph${selectedSeries.length === 1 ? "" : "s"}`
  const toggleSeries = (id: string) => {
    setSelectedSeries((prev) => (prev.includes(id) ? prev.filter((seriesId) => seriesId !== id) : [...prev, id]))
    clearHover()
  }
  const toggleAllSeries = () => {
    setSelectedSeries(allSeriesSelected ? [] : SERIES.map((series) => series.id))
    clearHover()
  }
  const visibleSeries = activeSeries.map((series) => ({
    ...series,
    values: isWeekView
      ? dailyValuesForWindow(series.values, chartWindow.start, weekSpan)
      : valuesForPointCount(series.values, visibleCount * POINTS_PER_MONTH),
  }))
  const labelStep = visibleCount > 14 ? 2 : 1
  const xAxisLabels =
    dateRangeComplete || isWeekView
      ? customDateAxisLabels(chartWindow.start, chartWindow.end)
      : axisLabelsForRange(selectedRange, visibleMonths, labelStep)
  // mobile uses a maximum of four labels, evenly distributed across the axis.
  const displayLabels = fitAxisLabels(xAxisLabels, plotWidth, 52, 68, isMobileAxis ? 4 : Number.POSITIVE_INFINITY)
  const hoverWeekRange = hoverX == null ? null : weekRangeForX(hoverX, chartWindow.start, chartWindow.end)
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

  useEffect(() => {
    if (!dateOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!dateFilterRef.current?.contains(event.target as Node)) {
        setDateOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDateOpen(false)
      }
    }

    // the mobile modal is portaled outside dateFilterRef and closes via its own
    // backdrop, so only the anchored dropdown needs the document outside-click listener
    if (!isMobile) document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [dateOpen, isMobile])

  // Track the plot's rendered width so the x-axis labels can thin to fit it.
  // The SVG stretches to its container, so we must re-thin whenever that width
  // changes. ResizeObserver + resize cover real browsers; the interval is a cheap
  // fallback for embedded webviews that reflow layout without emitting either
  // event. setPlotWidth bails out when the width is unchanged, so idle ticks do
  // not cause re-renders.
  useLayoutEffect(() => {
    const el = plotRef.current
    if (!el) return
    const measure = () => {
      const width = el.clientWidth
      setPlotWidth((prev) => (Math.abs(prev - width) > 1 ? width : prev))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener("resize", measure)
    const poll = window.setInterval(measure, 250)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
      window.clearInterval(poll)
    }
  }, [])

  function clearHover() {
    setHoverX(null)
  }

  function updateHoverFromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const pointerX = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH
    setHoverX(clamp(pointerX, PLOT.left, PLOT.left + PLOT.width))
  }

  function handleChartPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    updateHoverFromPointer(event)
  }

  function handleChartPointerMove(event: PointerEvent<HTMLDivElement>) {
    updateHoverFromPointer(event)
  }

  function handleChartPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (event.pointerType !== "mouse") clearHover()
  }

  function handleChartPointerCancel(event: PointerEvent<HTMLDivElement>) {
    handleChartPointerUp(event)
    clearHover()
  }

  function handleChartPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") clearHover()
  }

  return (
    <section
      data-node-id="forecast-worker-need-chart"
      className={cn(
        "flex w-full flex-col overflow-visible rounded-[6px] border-[0.5px] border-black/10 bg-white md:h-[570px] md:overflow-hidden",
        "shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-black/10 px-3">
        <h2 className="text-sm leading-5 font-medium text-primary">Forecast worker need</h2>
        <a
          href="#forecast-graph"
          className="hidden items-center gap-0.5 text-xs leading-4 font-normal text-secondary underline underline-offset-2 md:flex"
        >
          Open Forecast Graph
          <ChevronRight size={14} className="text-secondary" />
        </a>
        <a
          href="#forecast-graph"
          aria-label="Open Forecast Graph"
          title="Open Forecast Graph"
          className="flex size-7 shrink-0 items-center justify-center rounded-[4px] text-secondary outline-none hover:bg-[#f5f5f5] hover:text-primary focus-visible:ring-2 focus-visible:ring-[#CFC7BC] md:hidden"
        >
          <LinkExternal01 size={14} />
        </a>
      </header>

      <div className="flex flex-col gap-3 p-3 md:h-[526px] md:gap-8">
        <div className="relative flex items-center md:h-[26px]">
          <div className="flex w-full flex-wrap items-center gap-2">
            <SegmentedButton
              fill
              size="small"
              className="w-full md:w-[351px]"
              value={selectedRange}
              onChange={(v) => {
                setSelectedRange(v as RangeOption)
                setDateRange({ start: null, end: null })
                clearHover()
              }}
              options={RANGE_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
            <div ref={dateFilterRef} className="relative shrink-0">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={dateOpen}
                onClick={() => setDateOpen((open) => !open)}
                className={cn(
                  "flex h-[26px] items-center justify-center gap-1 whitespace-nowrap rounded-[6px] border-[0.5px] border-black/10 bg-white py-1 pr-2 pl-2.5 text-xs leading-[14px] font-normal text-primary shadow-[inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.2),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.25)] hover:border-black/30",
                  dateOpen && "border-black/30",
                )}
              >
                <Calendar className="size-3 shrink-0 text-primary" />
                {formatDateRange(dateRange)}
                <ChevronDown size={12} className={cn("text-primary", dateOpen && "rotate-180")} />
              </button>
              {/* mobile: a centred modal with a backdrop (single-month range picker);
                  tablet/desktop: a dropdown anchored to the button (centred on tablet) */}
              {dateOpen &&
                (isMobile ? (
                  // portal to <body> so the modal escapes the frame's stacking context
                  // and covers the frame header (z-30); z-[80] clears the app chrome
                  createPortal(
                  <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-4"
                    onClick={() => setDateOpen(false)}
                  >
                    <div onClick={(event) => event.stopPropagation()}>
                      <DatePicker
                        variant="range"
                        singleMonth
                        defaultMonth={dateRange.start ?? undefined}
                        range={dateRange}
                        defaultRange={dateRange}
                        onApplyRange={(range) => {
                          setDateRange(range)
                          setDateOpen(false)
                          clearHover()
                        }}
                        onClearRange={() => {
                          setDateRange({ start: null, end: null })
                          setDateOpen(false)
                          clearHover()
                        }}
                      />
                    </div>
                  </div>,
                  document.body,
                  )
                ) : (
                  <div className="absolute left-0 top-full z-30 mt-1 md:left-1/2 md:-translate-x-1/2 lg:left-0 lg:translate-x-0">
                    <DatePicker
                      variant="range"
                      defaultMonth={dateRange.start ?? undefined}
                      range={dateRange}
                      defaultRange={dateRange}
                      onApplyRange={(range) => {
                        setDateRange(range)
                        setDateOpen(false)
                        clearHover()
                      }}
                      onClearRange={() => {
                        setDateRange({ start: null, end: null })
                        setDateOpen(false)
                        clearHover()
                      }}
                    />
                  </div>
                ))}
            </div>
            <div ref={graphFilterRef} className="relative shrink-0">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={graphOpen}
                onClick={() => setGraphOpen((open) => !open)}
                className={cn(
                  "flex h-[26px] items-center justify-center gap-1 whitespace-nowrap rounded-[6px] border-[0.5px] border-black/10 bg-white py-1 pr-2 pl-2.5 text-xs leading-[14px] font-normal text-primary shadow-[inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.2),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.25)] hover:border-black/30",
                  graphOpen && "border-black/30",
                )}
              >
                {graphButtonLabel}
                <ChevronDown size={12} className={cn("text-primary", graphOpen && "rotate-180")} />
              </button>
              {graphOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-30 mt-1 flex w-[176px] flex-col gap-0.5 rounded-[6px] border-[0.5px] border-black/10 bg-white p-1 shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_4px_8px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.05)]"
                >
                  {/* select-all row: toggles every series on / off */}
                  <ListBase
                    role="menuitemcheckbox"
                    aria-checked={allSeriesSelected}
                    leading={<Checkbox size="small" checked={allSeriesSelected} tabIndex={-1} className="pointer-events-none" />}
                    className={cn("w-full cursor-pointer rounded-[2px]", allSeriesSelected && "text-black")}
                    onClick={toggleAllSeries}
                  >
                    All graph
                  </ListBase>
                  {SERIES.map((series) => {
                    const checked = selectedSeries.includes(series.id)
                    return (
                      <ListBase
                        key={series.id}
                        role="menuitemcheckbox"
                        aria-checked={checked}
                        leading={
                          <span className="flex items-center gap-2">
                            <Checkbox size="small" checked={checked} tabIndex={-1} className="pointer-events-none" />
                            <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: series.color }} />
                          </span>
                        }
                        className={cn("w-full cursor-pointer rounded-[2px]", checked && "text-black")}
                        onClick={() => toggleSeries(series.id)}
                      >
                        {series.label}
                      </ListBase>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pb-2 md:h-[444px]">
          {/* plot row: a fixed y-axis gutter + the plotting column. The gutter reserves
              the value labels' space so they cannot overlap the plot once the SVG is
              compressed on a narrow screen. The row is shorter on phones so the curves
              read landscape rather than portrait; desktop keeps the Figma height. */}
          <div className="flex h-[220px] w-full md:h-[397px]">
            <div className="relative w-[29px] shrink-0">
              {Y_TICKS.map((tick, index) => (
                <span
                  key={tick}
                  className={cn(
                    // left-align the numbers; the 30px gutter = widest label (~22px) + 8px,
                    // so the widest number clears the plot by 8px
                    "absolute left-0 w-[29px] text-left text-[11px] leading-[13px] font-normal text-secondary",
                    // phone: the plot is short, so label every 40 (drop the odd 20-steps:
                    // 220/180/140/100/60/20) to keep the axis from crowding
                    index % 2 === 0 && "hidden md:block",
                  )}
                  style={{ top: `calc(${(((PLOT.top + index * 33) / SVG_HEIGHT) * 100).toFixed(3)}% - 6px)` }}
                >
                  {tick}
                </span>
              ))}
            </div>
            <div ref={plotRef} className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute inset-0 z-10">
                <div className="absolute left-0 right-0 top-[calc(93.07%_+_8px)] h-[13px]">
                {displayLabels.map((axisLabel, index) => {
                  const isFirstLabel = index === 0
                  const isLastLabel = index === displayLabels.length - 1
                  const desktopPosition = (axisLabel.position / SVG_WIDTH) * 100
                  const mobilePosition =
                    displayLabels.length <= 1 ? 0 : (index / (displayLabels.length - 1)) * 100
                  return (
                    <span
                      key={axisLabel.key}
                      className={cn(
                        "absolute left-[var(--axis-left-mobile)] top-0 whitespace-nowrap text-[11px] leading-[13px] font-normal text-secondary md:left-[var(--axis-left-desktop)]",
                        isFirstLabel && "text-left",
                        isLastLabel && "-translate-x-full text-right",
                        !isFirstLabel && !isLastLabel && "-translate-x-1/2 text-center",
                      )}
                      style={
                        {
                          "--axis-left-mobile": `${mobilePosition}%`,
                          "--axis-left-desktop": `${desktopPosition}%`,
                        } as CSSProperties
                      }
                    >
                      {axisLabel.label}
                      <span className="text-[#8f8f8f]">{` '${String(axisLabel.year).slice(-2)}`}</span>
                    </span>
                  )
                })}
              </div>
            </div>
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="absolute inset-0 h-full w-full overflow-visible"
              role="img"
              aria-label={
                dateRangeComplete
                  ? `Forecast worker need line chart from ${DATE_LABEL_FMT.format(chartWindow.start)} to ${DATE_LABEL_FMT.format(chartWindow.end)}`
                  : isWeekView
                    ? `Forecast worker need line chart over the next ${nearTermLabel}`
                    : `Forecast worker need line chart over the next ${visibleCount} months`
              }
              preserveAspectRatio="none"
            >
              {/* solid fill from each line straight down to the baseline, tinted a
                  bit lighter than that line. Drawn top tier first so each lower tier
                  paints over it, leaving each line on its own colour. Assigned gets no
                  fill, so the In-Progress fill shows through beneath the Assigned line. */}
              {visibleSeries
                .filter((series) => series.id !== "assigned")
                .reverse()
                .map((series) => (
                  <path key={`${series.id}-fill`} d={areaPath(series.values)} fill={lighten(series.color, 0.55)} />
                ))}

              {/* gridlines are drawn after the fills so they stay visible on top of the
                  coloured chart at every breakpoint (still under the data lines below) */}
              {Y_TICKS.map((tick, index) => (
                // phone: hide the in-between gridlines so they match the 40-step labels
                <g key={tick} className={cn(index % 2 === 0 && "hidden md:block")}>
                  <line
                    x1={PLOT.left}
                    x2={PLOT.left + PLOT.width}
                    y1={PLOT.top + index * 33}
                    y2={PLOT.top + index * 33}
                    stroke="#000000"
                    strokeOpacity="0.05"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}

              <line
                x1={PLOT.left}
                x2={PLOT.left + PLOT.width}
                y1={yAt(127)}
                y2={yAt(127)}
                stroke="#e51d31"
                strokeWidth="1.5"
                strokeDasharray="7 7"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={PLOT.left}
                x2={PLOT.left + PLOT.width}
                y1={yAt(97)}
                y2={yAt(97)}
                stroke="#1fb06b"
                strokeWidth="1.5"
                strokeDasharray="7 7"
                vectorEffect="non-scaling-stroke"
              />

              {visibleSeries.map((series) => (
                <path
                  key={`${series.id}-line`}
                  d={smoothPath(pointsFor(series.values))}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              <rect x={PLOT.left} y={PLOT.top} width={PLOT.width} height={PLOT.height} fill="transparent" pointerEvents="none" />
            </svg>
            <div
              className="absolute inset-0 z-20 cursor-crosshair"
              style={{ touchAction: "pan-y" }}
              onPointerDown={handleChartPointerDown}
              onPointerMove={handleChartPointerMove}
              onPointerUp={handleChartPointerUp}
              onPointerCancel={handleChartPointerCancel}
              onPointerLeave={handleChartPointerLeave}
            />
            {hoverX != null && (
              <div className="pointer-events-none absolute inset-0 z-30">
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
                      className="absolute rounded-full"
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
                    items={visibleSeries
                      .map((series) => ({
                        color: series.color,
                        label: series.label,
                        value: valueOnSmoothPath(series.values, hoverX),
                      }))
                      // rank rows by value at the cursor, highest first
                      .sort((a, b) => b.value - a.value)}
                    className="absolute top-3"
                    style={{
                      left: `calc(${(hoverX / SVG_WIDTH) * 100}% + ${tooltipOnLeft ? -TOOLTIP_WIDTH - 12 : 12}px)`,
                    }}
                  />
                )}
              </div>
            )}
            </div>
          </div>

          <div aria-label="Forecast chart legend" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:h-[15px] md:gap-5">
            {activeSeries.map((series) => (
              <Legend key={series.id} variant="square" color={series.color} label={series.label} />
            ))}
            <Legend variant="line" color="#e51d31" label="Total workforce" lineStyle="dashed" />
            <Legend variant="line" color="#1fb06b" label="Carlton workforce" lineStyle="dashed" />
          </div>
        </div>
      </div>
    </section>
  )
}
