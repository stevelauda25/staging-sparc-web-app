import { useEffect, useState, type MouseEvent, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { Day } from "@/components/day"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function sameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function monthKey(d: Date) {
  return d.getFullYear() * 12 + d.getMonth()
}
function monthLabel(d: Date) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

/** a 6x7 Sunday-first grid of dates covering (and surrounding) the given month */
function buildWeeks(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const weeks: Date[][] = []
  for (let w = 0; w < 6; w += 1) {
    const week: Date[] = []
    for (let d = 0; d < 7; d += 1) {
      week.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d))
    }
    weeks.push(week)
  }
  return weeks
}

function NavButton({
  children,
  label,
  onClick,
  disabled = false,
}: {
  children: ReactNode
  label: string
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-4 items-center justify-center rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-[#CFC7BC] motion-safe:transition-colors motion-reduce:transition-none",
        disabled ? "cursor-not-allowed text-[#c2c2c2]" : "text-black hover:bg-[#f5f5f5]",
      )}
    >
      {children}
    </button>
  )
}

interface MonthGridProps {
  month: Date
  onPrev: (event: MouseEvent<HTMLButtonElement>) => void
  onNext: (event: MouseEvent<HTMLButtonElement>) => void
  isSelected: (d: Date) => boolean
  isInRange: (d: Date) => boolean
  onPick: (d: Date) => void
  connectRange?: boolean
  prevDisabled?: boolean
  nextDisabled?: boolean
}

/** one month: header (nav + label), weekday row, and the 6-week day grid */
function MonthGrid({
  month,
  onPrev,
  onNext,
  isSelected,
  isInRange,
  onPick,
  connectRange = false,
  prevDisabled = false,
  nextDisabled = false,
}: MonthGridProps) {
  const weeks = buildWeeks(month)
  return (
    <div className="flex w-60 flex-col">
      <header className="flex h-10 items-center justify-between border-b border-[#ebebeb] p-3">
        <NavButton label="Previous month" onClick={onPrev} disabled={prevDisabled}>
          <ChevronLeft className={cn("size-[14px]", prevDisabled ? "text-[#c2c2c2]" : "text-black")} />
        </NavButton>
        <span className="text-xs leading-4 font-medium text-black">{monthLabel(month)}</span>
        <NavButton label="Next month" onClick={onNext} disabled={nextDisabled}>
          <ChevronRight className={cn("size-[14px]", nextDisabled ? "text-[#c2c2c2]" : "text-black")} />
        </NavButton>
      </header>

      <div className="flex flex-col gap-1 py-3">
        <div className="grid grid-cols-7 px-3">
          {WEEKDAYS.map((w) => (
            <div key={w} className="flex h-6 items-center justify-center text-[11px] leading-[13px] font-normal text-[#8f8f8f]">
              {w}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 px-3">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const selected = isSelected(day)
                const inRange = isInRange(day)
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={cn("flex h-6 items-center justify-center", (inRange || (connectRange && selected)) && "bg-[#f5f5f5]")}
                  >
                    <Day
                      outsideMonth={day.getMonth() !== month.getMonth()}
                      selected={selected}
                      inRange={inRange}
                      aria-label={day.toDateString()}
                      onClick={() => onPick(day)}
                    >
                      {day.getDate()}
                    </Day>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export type DateRange = { start: Date | null; end: Date | null }

export interface DatePickerProps {
  /** `default` = one month, single date. `range` = two months, date range. */
  variant?: "default" | "range"
  /** the first month shown (defaults to the current month) */
  defaultMonth?: Date
  /** default variant: pre-selected date */
  defaultSelected?: Date | null
  /** range variant: externally controlled selected range */
  range?: DateRange
  /** range variant: pre-selected range */
  defaultRange?: DateRange
  /** default variant: fires when the selected date changes */
  onSelect?: (date: Date | null) => void
  /** range variant: fires when the draft range changes (either endpoint) */
  onRangeChange?: (range: DateRange) => void
  /** range variant: commits the current draft range */
  onApplyRange?: (range: DateRange) => void
  /** range variant: clears the committed and draft range */
  onClearRange?: () => void
  className?: string
}

/**
 * date-picker — the full calendar (Figma component-set "Date", node 2257:2234).
 *
 * Two variants: `default` (a single 320px month with single-date selection) and
 * `range` (two months side by side for picking a start/end range). Both compose
 * the base `Day` cell. A white 12px-radius card with a hairline border and a
 * soft shadow so it reads as a floating popover.
 */
export function DatePicker({
  variant = "default",
  defaultMonth,
  defaultSelected = null,
  range,
  defaultRange,
  onSelect,
  onRangeChange,
  onApplyRange,
  onClearRange,
  className,
}: DatePickerProps) {
  const initialRangeStart = range?.start ?? defaultRange?.start ?? null
  const initialRangeEnd = range?.end ?? defaultRange?.end ?? null
  const [leftMonth, setLeftMonth] = useState(() => {
    const base = initialRangeStart ?? defaultMonth ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [rightMonth, setRightMonth] = useState(() => {
    const base = initialRangeEnd ?? addMonths(initialRangeStart ?? defaultMonth ?? new Date(), 1)
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [selected, setSelected] = useState<Date | null>(defaultSelected)
  const [draftRange, setDraftRange] = useState<DateRange>(() => range ?? defaultRange ?? { start: null, end: null })

  const cardClass = cn(
    "inline-flex rounded-[6px] border-[0.5px] border-black/10 bg-white",
    "shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_4px_8px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.05)]",
    className,
  )

  useEffect(() => {
    setDraftRange(range ?? defaultRange ?? { start: null, end: null })
  }, [range, defaultRange])

  const leftNextDisabled = monthKey(addMonths(leftMonth, 1)) >= monthKey(rightMonth)
  const rightPrevDisabled = monthKey(addMonths(rightMonth, -1)) <= monthKey(leftMonth)
  const navStep = (event: MouseEvent<HTMLButtonElement>) => (event.shiftKey ? 12 : 1)
  const goLeftPrev = (event: MouseEvent<HTMLButtonElement>) => setLeftMonth((m) => addMonths(m, -navStep(event)))
  const goLeftNext = (event: MouseEvent<HTMLButtonElement>) => {
    setLeftMonth((m) => {
      const next = addMonths(m, navStep(event))
      return monthKey(next) >= monthKey(rightMonth) ? m : next
    })
  }
  const goRightPrev = (event: MouseEvent<HTMLButtonElement>) => {
    setRightMonth((m) => {
      const next = addMonths(m, -navStep(event))
      return monthKey(next) <= monthKey(leftMonth) ? m : next
    })
  }
  const goRightNext = (event: MouseEvent<HTMLButtonElement>) => setRightMonth((m) => addMonths(m, navStep(event)))

  if (variant === "range") {
    const currentRangeStart = draftRange.start
    const currentRangeEnd = draftRange.end
    const hasCompleteDraftRange = !!currentRangeStart && !!currentRangeEnd
    const setNextRange = (nextRange: DateRange) => {
      setDraftRange(nextRange)
      onRangeChange?.(nextRange)
    }
    const pickRange = (d: Date) => {
      const day = startOfDay(d)
      let nextStart: Date | null
      let nextEnd: Date | null
      if (!currentRangeStart || (currentRangeStart && currentRangeEnd)) {
        nextStart = day
        nextEnd = null
      } else if (day.getTime() < currentRangeStart.getTime()) {
        nextStart = day
        nextEnd = currentRangeStart
      } else {
        nextStart = currentRangeStart
        nextEnd = day
      }
      setNextRange({ start: nextStart, end: nextEnd })
    }
    const clearRange = () => {
      const emptyRange = { start: null, end: null }
      setDraftRange(emptyRange)
      onRangeChange?.(emptyRange)
      onClearRange?.()
    }
    const applyRange = () => {
      if (!hasCompleteDraftRange) return
      onApplyRange?.(draftRange)
    }
    const isSelected = (d: Date) => sameDay(d, currentRangeStart) || sameDay(d, currentRangeEnd)
    const isInRange = (d: Date) => {
      if (!currentRangeStart || !currentRangeEnd) return false
      const t = startOfDay(d).getTime()
      return t > currentRangeStart.getTime() && t < currentRangeEnd.getTime()
    }
    return (
      <div className={cn(cardClass, "flex-col")}>
        <div className="flex">
          <MonthGrid
            month={leftMonth}
            onPrev={goLeftPrev}
            onNext={goLeftNext}
            isSelected={isSelected}
            isInRange={isInRange}
            onPick={pickRange}
            connectRange={hasCompleteDraftRange}
            nextDisabled={leftNextDisabled}
          />
          <MonthGrid
            month={rightMonth}
            onPrev={goRightPrev}
            onNext={goRightNext}
            isSelected={isSelected}
            isInRange={isInRange}
            onPick={pickRange}
            connectRange={hasCompleteDraftRange}
            prevDisabled={rightPrevDisabled}
          />
        </div>
        <div className="flex items-center justify-end gap-1 border-t-[0.5px] border-black/10 p-3">
          <button
            type="button"
            className="rounded-[4px] px-2 py-1 text-xs leading-[14px] font-normal text-[#525252] hover:bg-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFC7BC]"
            onClick={clearRange}
          >
            Clear range
          </button>
          <button
            type="button"
            disabled={!hasCompleteDraftRange}
            className={cn(
              "overflow-hidden rounded-[4px] border-[0.5px] px-2 py-1 text-xs leading-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CFC7BC]",
              hasCompleteDraftRange
                ? "text-white"
                : "cursor-not-allowed border-transparent bg-[#f5f5f5] text-[#8f8f8f]",
            )}
            style={hasCompleteDraftRange ? {
              background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%), linear-gradient(0deg, #26201C 0%, #26201C 100%)",
              borderColor: "rgba(255,255,255,0.1)",
              boxShadow: "0px 4px 8px -4px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.15), 0px 1px 2px -1px rgba(0,0,0,0.2), inset 0px 0px 0px 0.5px rgba(0,0,0,0.1), inset 0px -0.5px 0.5px 0px rgba(0,0,0,0.1), inset 0px 0.5px 1px 0px rgba(255,255,255,0.25)",
            } : undefined}
            onClick={applyRange}
          >
            Apply
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      <MonthGrid
        month={leftMonth}
        onPrev={goLeftPrev}
        onNext={goLeftNext}
        isSelected={(d) => sameDay(d, selected)}
        isInRange={() => false}
        onPick={(d) => {
          const day = startOfDay(d)
          setSelected(day)
          onSelect?.(day)
        }}
      />
    </div>
  )
}
