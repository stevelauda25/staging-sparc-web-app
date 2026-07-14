import type { ReactNode } from "react"
import { Day } from "@/components/day"

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

export function DayShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">day</h2>
      <p className="text-sm text-secondary mb-4">
        The base cell of the date picker (Figma component-set <code>day</code>). Three core states —
        default, hover, and selected — plus in-range, muted (outside-month) and disabled. A 24px
        rounded square (6px radius, 12px number) that the month grid and the Default / Range picker
        variants compose.
      </p>

      <div className="flex flex-col items-start gap-6">
        <Row label="Core states — default · hover · selected">
          {/* the middle cell forces the hover fill so the state is visible without interaction */}
          <div className="flex items-center gap-3">
            <Day>1</Day>
            <Day className="bg-[#f5f5f5]">1</Day>
            <Day selected>1</Day>
          </div>
        </Row>

        <Row label="Muted (outside month) · disabled">
          <div className="flex items-center gap-3">
            <Day outsideMonth>1</Day>
            <Day disabled>1</Day>
          </div>
        </Row>

        <Row label="Composed — a week row">
          <div className="flex items-center gap-1">
            <Day outsideMonth>29</Day>
            <Day outsideMonth>30</Day>
            <Day>1</Day>
            <Day>2</Day>
            <Day selected>3</Day>
            <Day>4</Day>
            <Day>5</Day>
          </div>
        </Row>
      </div>
    </section>
  )
}
