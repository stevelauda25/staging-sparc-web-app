import type { ReactNode } from "react"
import { Legend } from "@/components/legend"

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

export function LegendShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">legend</h2>
      <p className="text-sm text-muted-foreground mb-4">
        A single legend item: a swatch plus a label. Two swatch variants — <code>square</code> (a
        filled chip) and <code>line</code> (a dashed or solid stroke). Color is fully adjustable via
        the <code>color</code> prop. An optional trailing value + percent supports data legends.
      </p>

      <div className="flex flex-col items-start gap-6">
        <Row label="Square (default)">
          <div className="flex items-center gap-5">
            <Legend variant="square" color="#0d76f2" label="Staffed" />
            <Legend variant="square" color="#8b8175" label="In-progress" />
            <Legend variant="square" color="#00a97f" label="On track" />
          </div>
        </Row>

        <Row label="Line — dashed (default) and solid">
          <div className="flex items-center gap-5">
            <Legend variant="line" color="#e51d31" label="Total workforce" />
            <Legend variant="line" color="#129457" label="Carlton workforce" />
            <Legend variant="line" color="#0072e4" label="Solid line" dashed={false} />
          </div>
        </Row>

        <Row label="Square with trailing value + percent (bordered chip)">
          <div className="flex items-center gap-5">
            <Legend variant="square" bordered color="#00a97f" label="On track" value="61" percent="(57%)" />
            <Legend variant="square" bordered color="#e51d31" label="Over budget" value="14" percent="(12%)" />
            <Legend variant="square" bordered color="#b8b8b8" label="No data" value="27" percent="(31%)" />
          </div>
        </Row>

        <Row label="Adjustable color">
          <div className="flex items-center gap-5">
            <Legend color="#e51d31" label="#e51d31" />
            <Legend color="#efad20" label="#efad20" />
            <Legend color="#129457" label="#129457" />
            <Legend color="#0072e4" label="#0072e4" />
          </div>
        </Row>
      </div>
    </section>
  )
}
