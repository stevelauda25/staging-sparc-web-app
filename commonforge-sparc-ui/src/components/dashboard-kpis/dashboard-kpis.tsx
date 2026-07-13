import { cn } from "@/lib/utils"
import { KpiCard } from "@/components/kpi-card"

const DEFAULT_KPIS = [
  {
    label: "Forecast need",
    value: "182",
    description: "38 workers still need coverage",
  },
  {
    label: "Assigned",
    value: "144",
    description: "79% of forecast covered",
  },
  {
    label: "Total workforce",
    value: "142",
    description: "40 more needed than available",
  },
]

export interface DashboardKpi {
  label: string
  value: string
  description: string
}

export interface DashboardKpiGroupProps {
  items?: DashboardKpi[]
  className?: string
}

/**
 * dashboard-kpis — the row of summary tiles at the top of the dashboard.
 *
 * Composes the shared kpi-card (default size, no icon). Each card stretches to
 * an equal share of the row; on narrow widths the row stacks.
 */
export function DashboardKpiGroup({
  items = DEFAULT_KPIS,
  className,
}: DashboardKpiGroupProps) {
  return (
    <section
      data-node-id="2498:1362"
      aria-label="Dashboard KPI summary"
      className={cn("flex w-full flex-col gap-3 md:flex-row", className)}
    >
      {items.map((item) => (
        <KpiCard
          key={item.label}
          label={item.label}
          value={item.value}
          description={item.description}
          className="min-w-0 flex-1 basis-0"
        />
      ))}
    </section>
  )
}
