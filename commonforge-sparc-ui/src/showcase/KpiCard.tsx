import { KpiCard } from "@/components/kpi-card"

// the Figma uses a circle placeholder for the icon slot
const circle = <span className="block size-5 rounded-full border-2 border-black" />

export function KpiCardShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">kpi-card</h2>
      <p className="text-sm text-secondary mb-4">
        A KPI tile. Default size (label + optional icon, value with an optional trend or unit, plus a
        description) and a compact size (leading icon, label + value, no description). Trend is a green
        up or red down triangle; a unit like /hr renders as a muted suffix. Text sizes reuse the
        dashboard cards (label 14, value 20, desc 12).
      </p>

      {/* default size: 206px wide per the Figma */}
      <div className="flex flex-wrap gap-3 mb-3">
        <KpiCard className="w-[206px]" label="Label" value="90" description="Desc" trend={{ direction: "down", value: "6" }} icon={circle} />
        <KpiCard className="w-[206px]" label="Label" value="90" description="Desc" trend={{ direction: "up", value: "6" }} icon={circle} />
        <KpiCard className="w-[206px]" label="Label" value="90" description="Desc" suffix="/hr" icon={circle} />
        <KpiCard className="w-[206px]" label="Label" value="90" description="Desc" icon={circle} />
      </div>

      {/* compact size: hugs its content */}
      <div className="flex flex-wrap items-start gap-3">
        <KpiCard size="compact" label="Label" value="90" trend={{ direction: "down", value: "6" }} icon={circle} />
        <KpiCard size="compact" label="Label" value="90" trend={{ direction: "up", value: "6" }} icon={circle} />
        <KpiCard size="compact" label="Label" value="90" suffix="/hr" icon={circle} />
        <KpiCard size="compact" label="Label" value="90" icon={circle} />
      </div>
    </section>
  )
}
