import { useState, type ReactNode } from "react"
import { SegmentedButton } from "@/components/segmented-button"

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

const RANGES = ["1M", "3M", "6M", "1Y", "1.5Y", "2Y", "All"].map((v) => ({ value: v, label: v }))

export function SegmentedButtonShowcase() {
  const [range, setRange] = useState("1M")
  const [medium, setMedium] = useState("all")
  const [smallCount, setSmallCount] = useState("cards")

  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">segmented-button</h2>
      <p className="text-sm text-secondary mb-4">
        A single-select button group. Two sizes: medium (14px) and small (12px). Selected fills
        #3d3d3d, idle is #525252, hover a subtle gray. Each segment can carry an optional count badge
        (its color follows the state). Dividers hide on either side of the selected segment.
      </p>

      <div className="flex flex-col items-start gap-6">
        <Row label="Small (chart range tabs, no count)">
          <SegmentedButton size="small" options={RANGES} value={range} onChange={setRange} />
        </Row>

        <Row label="Medium (with count badge)">
          <SegmentedButton
            size="medium"
            value={medium}
            onChange={setMedium}
            options={[
              { value: "all", label: "All", count: 12 },
              { value: "active", label: "Active", count: 8 },
              { value: "archived", label: "Archived", count: 3 },
            ]}
          />
        </Row>

        <Row label="Small (with count badge)">
          <SegmentedButton
            size="small"
            value={smallCount}
            onChange={setSmallCount}
            options={[
              { value: "cards", label: "Cards", count: 24 },
              { value: "table", label: "Table", count: 6 },
              { value: "map", label: "Map", count: 2 },
            ]}
          />
        </Row>
      </div>
    </section>
  )
}
