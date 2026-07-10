import { cn } from "@/lib/utils"

const DEFAULT_KPIS = [
  {
    label: "Forecast need",
    value: "182",
    description: "Workers needed this week",
  },
  {
    label: "Assigned",
    value: "144",
    description: "Workers assigned so far",
  },
  {
    label: "Total workforce",
    value: "142",
    description: "Your total available crew",
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
        <article
          key={item.label}
          className="flex min-w-0 flex-1 basis-0 flex-col items-start overflow-hidden rounded-[0.375rem] border-[0.5px] border-black/10 bg-white p-3 shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1)]"
        >
          <div className="flex h-20 w-full flex-col items-start justify-between">
            <p className="text-[0.6875rem] leading-[1.2] font-normal text-[#525252]">
              {item.label}
            </p>
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-end gap-0.5">
                <p className="font-sans text-xl leading-[1.2] font-medium tracking-normal text-black tabular-nums">
                  {item.value}
                </p>
              </div>
              <p className="text-[0.625rem] leading-[0.875rem] font-normal text-[#525252]">
                {item.description}
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
