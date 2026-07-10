import { useState, type ReactNode } from "react"
import { ChevronRight } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { SegmentedButton } from "@/components/segmented-button"
import { Legend } from "@/components/legend"
import jobMapImage from "@/assets/dashboard/job-map-fort-collins-base.png"

const CARD_SHADOW =
  "shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1)]"

const BUDGET_KPIS = [
  { label: "Active jobs", value: "104", description: "Jobs in the forecast" },
  { label: "Staffed jobs", value: "29", description: "Jobs with crew assigned" },
  { label: "Jobs over budget", value: "24", description: "Jobs projected over bid" },
]

const BUDGET_LEGEND = [
  { label: "On track", value: "61", percent: "(57%)", color: "#00a97f" },
  { label: "Over budget", value: "14", percent: "(12%)", color: "#e51d31" },
  { label: "No data", value: "27", percent: "(31%)", color: "#b8b8b8" },
]

const BUDGET_UTILIZATION_ROWS = [
  { job: "Izzio ASI 5", value: "546%", fill: 82.6 },
  { job: "Falcon Bldg BMods", value: "511%", fill: 78.8 },
  { job: "BVSD Critical Needs", value: "486%", fill: 76.0 },
  { job: "Arrupe Jesuit HS", value: "458%", fill: 72.9 },
  { job: "Picadilly Crossing", value: "432%", fill: 70.1 },
  { job: "Clear Creek Crossing", value: "408%", fill: 67.5 },
  { job: "Aspen Birch Chiller", value: "386%", fill: 65.1 },
  { job: "WIC Blast Tunnel Ext.", value: "364%", fill: 62.7 },
  { job: "DCSD Legacy CIP", value: "342%", fill: 60.3 },
  { job: "Boulder Creek Re-Roof", value: "321%", fill: 58.0 },
  { job: "PH 2 Lookout Improve.", value: "304%", fill: 56.1 },
  { job: "CCSD-CCHS Academy", value: "286%", fill: 54.2 },
  { job: "Titan Compark N. Bldg", value: "269%", fill: 52.3 },
  { job: "Holly Hills Repl ES", value: "252%", fill: 50.5 },
  { job: "BVSD Fairview HS", value: "236%", fill: 48.8 },
  { job: "WIC HQ Expansion", value: "221%", fill: 47.1 },
  { job: "North Ridge Addition", value: "207%", fill: 45.6 },
  { job: "Timnath Service Wing", value: "194%", fill: 44.2 },
  { job: "Mason Street Retrofit", value: "182%", fill: 42.9 },
  { job: "Poudre Admin Remodel", value: "171%", fill: 41.7 },
  { job: "Fossil Ridge Upgrade", value: "160%", fill: 40.5 },
  { job: "Harmony Lab Buildout", value: "149%", fill: 39.3 },
  { job: "Prospect Shop Fitout", value: "138%", fill: 38.1 },
]

const MAP_PINS = [
  { label: "DC", status: "staffed", x: 391.9, y: 57.9 },
  { label: "BK", status: "staffed", x: 436.9, y: 157.9 },
  { label: "2", status: "staffed", x: 396.8, y: 225.9 },
  { label: "6", status: "staffed", x: 328.7, y: 186.9 },
  { label: "3", status: "staffed", x: 279.9, y: 174.7 },
  { label: "RF", status: "staffed", x: 183.8, y: 201.9 },
  { label: "MD", status: "staffed", x: 146.6, y: 304.9 },
  { label: "JL", status: "in-progress", x: 183.8, y: 105.8 },
  { label: "TR", status: "in-progress", x: 222.7, y: 121.9 },
  { label: "2", status: "in-progress", x: 299.8, y: 154.7 },
  { label: "8", status: "in-progress", x: 305.2, y: 205.7 },
  { label: "AP", status: "in-progress", x: 287.7, y: 245.9 },
  { label: "MP", status: "in-progress", x: 104.7, y: 288.9 },
] as const

type BudgetView = "status" | "utilization"
type BudgetLegendItem = (typeof BUDGET_LEGEND)[number]

interface PanelProps {
  title: string
  action?: string
  actionHref?: string
  children: ReactNode
}

function Panel({ title, action, actionHref = "#", children }: PanelProps) {
  return (
    <section
      className={cn(
        "flex h-[549px] min-w-0 flex-col overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-white",
        CARD_SHADOW,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-black/10 px-3">
        <h2 className="text-[14px] leading-5 font-medium text-black">{title}</h2>
        {action != null && (
          <a
            href={actionHref}
            className="flex items-center gap-0.5 text-[12px] leading-4 font-normal text-[#525252] underline underline-offset-2"
          >
            {action}
            <ChevronRight size={14} className="text-[#525252]" />
          </a>
        )}
      </header>
      {children}
    </section>
  )
}

function MapTabs() {
  const [view, setView] = useState("active")
  return (
    <SegmentedButton
      size="small"
      dividers={false}
      value={view}
      onChange={setView}
      options={[
        { value: "active", label: "All active", count: 15 },
        { value: "staffed", label: "Staffed", count: 24 },
      ]}
    />
  )
}

function JobMapPanel() {
  return (
    <Panel title="Job Map" action="Open Map" actionHref="#map">
      <div className="flex h-[505px] flex-col px-3 pb-3">
        <div className="flex h-[470px] flex-col gap-3 pt-3">
          <div className="flex h-7 items-center justify-between">
            <MapTabs />
            <div className="flex items-center gap-5">
              <Legend variant="square" color="#0d76f2" label="Staffed" />
              <Legend variant="square" color="#8b8175" label="In-progress" />
            </div>
          </div>
          <div className="relative h-[418px] overflow-hidden bg-[#f5f5f5]">
            <img
              src={jobMapImage}
              alt="Fort Collins job map background"
              className="block h-full w-full object-fill"
            />
            <div
              aria-hidden="true"
              className="absolute left-[11px] top-[7px] h-[42px] w-[124px] bg-[#f4ecdc]"
            >
              <span className="absolute inset-y-0 left-[58px] w-[2px] bg-[#d8e1e7]" />
              <span className="absolute inset-x-0 top-[31px] h-[2px] bg-[#d8e1e7]" />
              <span className="absolute left-[12px] top-[5px] h-[22px] w-[35px] rounded-[40%] bg-[#45cedc]" />
              <span className="absolute left-[74px] top-0 h-full w-[30px] bg-[#c9f3dc]" />
            </div>
            <div
              aria-hidden="true"
              className="absolute right-[6px] top-[6px] h-[43px] w-[40px] bg-[#f4ecdc]"
            >
              <span className="absolute left-[16px] top-0 h-full w-[5px] bg-[#8da9c0]" />
              <span className="absolute inset-x-0 top-[29px] h-[2px] bg-[#d8e1e7]" />
              <span className="absolute right-0 top-[5px] h-[26px] w-[12px] bg-[#c9f3dc]" />
            </div>
            {MAP_PINS.map((pin) => (
              <button
                key={`${pin.label}-${pin.status}-${pin.x}-${pin.y}`}
                type="button"
                aria-label={`${pin.label} ${pin.status} job marker`}
                className={cn(
                  "absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[14px] leading-5 font-normal text-white tabular-nums",
                  "shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_-0.5px_1px_rgba(0,0,0,0.25),inset_0_0.5px_1px_rgba(255,255,255,0.18)]",
                  pin.status === "staffed" ? "bg-[#0d76f2]" : "bg-[#8b8175]",
                )}
                style={{ left: `${(pin.x / 550) * 100}%`, top: `${(pin.y / 374) * 100}%` }}
              >
                {pin.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-[15px] font-normal text-[#525252]">
          95 of 104 active jobs mapped (9 have no mappable address). Hover a pin for details.
        </p>
      </div>
    </Panel>
  )
}

function BudgetKpi({ label, value, description }: (typeof BUDGET_KPIS)[number]) {
  return (
    <article className="flex h-[104px] min-w-0 flex-1 flex-col justify-between rounded-[6px] border-[0.5px] border-black/10 bg-white p-3">
      <p className="text-[12px] leading-4 font-normal text-[#525252]">{label}</p>
      <div className="flex flex-col gap-1">
        <p className="text-[20px] leading-6 font-medium text-black tabular-nums">{value}</p>
        <p className="text-[12px] leading-4 font-normal text-[#525252]">{description}</p>
      </div>
    </article>
  )
}

function BudgetTabs({ view, onChange }: { view: BudgetView; onChange: (view: BudgetView) => void }) {
  return (
    <SegmentedButton
      size="small"
      dividers={false}
      value={view}
      onChange={(nextView) => onChange(nextView as BudgetView)}
      options={[
        { value: "status", label: "Budget status" },
        { value: "utilization", label: "Budget utilization" },
      ]}
    />
  )
}

function BudgetLegend({ items = BUDGET_LEGEND }: { items?: BudgetLegendItem[] }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-start gap-x-5 gap-y-2">
      {items.map((item) => (
        <Legend
          key={item.label}
          variant="square"
          bordered
          color={item.color}
          label={item.label}
          value={item.value}
          percent={item.percent}
        />
      ))}
    </div>
  )
}

function BudgetStatusContent() {
  return (
    <div role="tabpanel" aria-label="Budget status" className="mt-[20px] flex min-h-0 flex-1 flex-col items-center">
      <BudgetLegend />
      <div className="flex min-h-0 flex-1 items-center justify-center pt-4">
        <svg
          viewBox="0 0 128 127.897"
          preserveAspectRatio="none"
          className="size-32 shrink-0"
          role="img"
          aria-label="Budget status chart: 57% on track, 12% over budget, 31% no data"
        >
          <path
            d="M59.7956 25.6919C60.8476 25.5772 61.6727 24.7078 61.6727 23.6496V1.97027C61.6727 0.837674 60.7327 -0.0720278 59.6027 0.00468955C55.0266 0.315372 50.5824 1.10725 46.3204 2.33007C44.8225 2.75975 43.347 3.24286 41.8963 3.77684C17.4421 12.7795 0 36.2905 0 63.8767C0 98.4552 27.4045 126.631 61.6727 127.856C62.4451 127.884 63.2209 127.897 64 127.897C64.7791 127.897 65.5549 127.884 66.3273 127.856C71.0448 127.687 75.6323 127.008 80.0361 125.871C81.1312 125.588 81.7363 124.431 81.3817 123.357L74.5841 102.771C74.2515 101.764 73.1912 101.197 72.1544 101.421C70.2603 101.831 68.3141 102.101 66.3273 102.22C65.5574 102.266 64.7814 102.289 64 102.289C63.2186 102.289 62.4426 102.266 61.6727 102.22C41.5487 101.016 25.6 84.3095 25.6 63.8767C25.6 47.6286 35.6851 33.7363 49.9352 28.1225C51.3706 27.557 52.8483 27.0756 54.3622 26.6843C56.1273 26.2279 57.9416 25.8939 59.7956 25.6919Z"
            fill="#00a97f"
          />
          <path
            d="M116.717 96.4279C117.693 96.9917 118.013 98.2526 117.39 99.1926C110.369 109.793 100.277 118.181 88.3829 123.087C87.3331 123.52 86.1501 122.952 85.794 121.873L78.9917 101.273C78.6614 100.273 79.1664 99.1926 80.1222 98.7498C86.183 95.9412 91.3884 91.5983 95.2398 86.2193C95.8611 85.3517 97.0371 85.0623 97.9612 85.596L116.717 96.4279Z"
            fill="#e51d31"
          />
          <path
            d="M68.2044 25.6919C67.1524 25.5772 66.3271 24.7078 66.3271 23.6496V1.97026C66.3271 0.837663 67.2709 -0.0718425 68.4009 0.00493105C101.694 2.26695 128 29.9986 128 63.8767C128 73.7849 125.75 83.1677 121.733 91.541C121.24 92.5678 119.975 92.9342 118.989 92.3647L100.197 81.5119C99.29 80.9879 98.9463 79.8546 99.356 78.8903C101.316 74.2783 102.4 69.204 102.4 63.8767C102.4 44.0836 87.4341 27.7868 68.2044 25.6919Z"
            fill="#b8b8b8"
          />
        </svg>
      </div>
    </div>
  )
}

function BudgetUtilizationContent() {
  return (
    <div
      role="tabpanel"
      aria-label="Budget utilization"
      className="mt-[20px] flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto overscroll-contain scrollbar-hide"
    >
      {BUDGET_UTILIZATION_ROWS.map((row) => (
        <div
          key={row.job}
          aria-label={`${row.job} budget utilization ${row.value}`}
          className="relative h-[23px] shrink-0 overflow-hidden rounded-[4px] border-[0.5px] border-black/10 bg-black/[0.05]"
        >
          <div
            className="absolute inset-y-0 left-0 flex items-center rounded-[4px] bg-[#c0180c] px-[6px] py-1"
            style={{ width: `${row.fill}%` }}
          >
            <span className="truncate text-[11px] leading-[15px] font-normal text-white">{row.job}</span>
          </div>
          <span className="absolute inset-y-0 right-[6px] flex items-center py-1 text-[11px] leading-[15px] font-normal text-black tabular-nums">
            {row.value}
          </span>
        </div>
      ))}
      </div>
  )
}

function ForecastBudgetPanel() {
  const [view, setView] = useState<BudgetView>("status")

  return (
    <Panel title="Forecast to Budget">
      <div className="flex h-[505px] flex-col px-3 pb-3">
        <div className="flex h-[466px] flex-col gap-3 pt-3">
          <div className="flex h-[104px] gap-3">
            {BUDGET_KPIS.map((kpi) => (
              <BudgetKpi key={kpi.label} {...kpi} />
            ))}
          </div>
          <div className="flex h-[338px] flex-col rounded-[6px] border-[0.5px] border-black/10 bg-white p-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-[13px] leading-[18px] font-normal text-black">Budget status vs utilization</h3>
              <p className="text-[12px] leading-4 font-normal text-[#525252]">
                Spectrum projected vs labor hours bid across active jobs
              </p>
            </div>
            <div className="mt-3">
              <BudgetTabs view={view} onChange={setView} />
            </div>
            {view === "status" ? <BudgetStatusContent /> : <BudgetUtilizationContent />}
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-[15px] font-normal text-[#525252]">
          24 of 104 active jobs are trending over budget
        </p>
      </div>
    </Panel>
  )
}

export interface DashboardMapBudgetProps {
  className?: string
}

export function DashboardMapBudget({ className }: DashboardMapBudgetProps) {
  return (
    <section
      data-node-id="2494:7708"
      className={cn("grid w-full grid-cols-1 gap-3 min-[900px]:grid-cols-2", className)}
    >
      <JobMapPanel />
      <ForecastBudgetPanel />
    </section>
  )
}
