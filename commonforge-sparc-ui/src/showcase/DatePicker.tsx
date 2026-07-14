import type { ReactNode } from "react"
import { DatePicker } from "@/components/date-picker"

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">
        {label}
      </div>
      {children}
    </div>
  )
}

// June 2026, to match the Figma frame
const JUNE_2026 = new Date(2026, 5, 1)

export function DatePickerShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">date-picker</h2>
      <p className="text-sm text-secondary mb-4">
        The full calendar (Figma component-set <code>Date</code>), composing the base <code>day</code>{" "}
        cell. Two variants: <code>Default</code> (a single 320px month with single-date selection) and{" "}
        <code>Range</code> (two months side by side for a start/end range). Both are interactive —
        click days and use the month arrows.
      </p>

      <div className="flex flex-col items-start gap-8">
        <Row label="Default — single date">
          <DatePicker defaultMonth={JUNE_2026} defaultSelected={new Date(2026, 5, 12)} />
        </Row>

        <Row label="Range — two months, start / end">
          <DatePicker
            variant="range"
            defaultMonth={JUNE_2026}
            defaultRange={{ start: new Date(2026, 5, 10), end: new Date(2026, 6, 2) }}
          />
        </Row>
      </div>
    </section>
  )
}
