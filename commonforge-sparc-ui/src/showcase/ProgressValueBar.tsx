import type { ReactNode } from "react"
import { ProgressValueBar } from "@/components/progress-value-bar"

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-2 font-mono text-[9px] font-bold tracking-wider text-neutral-500 uppercase">
        {label}
      </div>
      {children}
    </div>
  )
}

export function ProgressValueBarShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">progress value bar</h2>
      <p className="mb-4 text-sm text-neutral-500">
        One horizontal value bar component. Adjust <code>color</code>, <code>percent</code>, and
        <code>valueLabel</code> for different data contexts.
      </p>

      <div className="flex max-w-3xl flex-col items-start gap-6">
        <Row label="Default — adjustable color and value">
          <div className="flex flex-col gap-1">
            <ProgressValueBar
              label="Actuals vs Projected"
              valueLabel="40%"
              percent={40}
              color="#0072e4"
            />
            <ProgressValueBar
              label="Calendar complete"
              valueLabel="34%"
              percent={34}
              color="#00a97f"
            />
            <ProgressValueBar
              label="Fire Alarm"
              valueLabel="1.8"
              percent={36}
              color="#eb6214"
            />
            <ProgressValueBar
              label="Lighting Control System"
              valueLabel="2.5"
              percent={50}
              color="#efad20"
              fillTextClassName="text-black"
            />
          </div>
        </Row>
      </div>
    </section>
  )
}
