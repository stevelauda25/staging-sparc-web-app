import { ChartTooltip } from "@/components/chart-tooltip"

export function ChartTooltipShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">chart tooltip</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Shared dark tooltip for chart hovers. Rows accept color, label, and value.
      </p>

      <ChartTooltip
        title="Aug 1 - 7"
        items={[
          { color: "#352e29", label: "Assigned workers", value: 114 },
          { color: "#00c3d2", label: "In-progress", value: 180 },
          { color: "#ff4aa2", label: "90% win", value: 148 },
        ]}
      />
    </section>
  )
}
