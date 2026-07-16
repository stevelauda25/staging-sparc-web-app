import { cn } from "@/lib/utils"
import { KpiCard } from "@/components/kpi-card"
import { REAL_KPIS } from "@/real-data/kpis"

const DEFAULT_KPIS_SAMPLE = [
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

// preview: real KPI numbers from the local DB (git-ignored file); falls back to the sample
const DEFAULT_KPIS = REAL_KPIS.length > 0 ? REAL_KPIS : DEFAULT_KPIS_SAMPLE

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
          className="min-w-0 md:flex-1 md:basis-0"
        />
      ))}
    </section>
  )
}
