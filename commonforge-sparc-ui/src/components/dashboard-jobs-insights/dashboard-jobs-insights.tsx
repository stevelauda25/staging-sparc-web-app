import { type ReactNode } from "react"
import { ChevronDown, ChevronRight, ChevronSelectorVertical } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { SearchField } from "@/components/search-field"
import { Legend } from "@/components/legend"

const NEEDS_JOBS = [
  { name: "Holly Hills Repl ES", id: "#25011", status: "In-Progress", needed: "23 needed", actualHours: "12,025h", projectedHours: "30,197h", actualPercent: 40, calendarPercent: 34 },
  { name: "BVSD Fairview HS", id: "#25012", status: "In-Progress", needed: "16 needed", actualHours: "6,908h", projectedHours: "10,460h", actualPercent: 66, calendarPercent: 39 },
  { name: "BVSD Critical Needs CTE", id: "#25013", status: "At Risk", needed: "19 needed", actualHours: "12,435h", projectedHours: "30,197h", actualPercent: 41, calendarPercent: 30 },
  { name: "WIC HQ Expansion", id: "#25014", status: "In-Progress", needed: "8 needed", actualHours: "1,215h", projectedHours: "4,820h", actualPercent: 25, calendarPercent: 34 },
  { name: "Titan Compark N. Bldg", id: "#25015", status: "Planning", needed: "12 needed", actualHours: "2,340h", projectedHours: "18,600h", actualPercent: 13, calendarPercent: 12 },
  { name: "CCSD Academics Ph1", id: "#25016", status: "In-Progress", needed: "27 needed", actualHours: "9,880h", projectedHours: "15,200h", actualPercent: 65, calendarPercent: 58 },
  { name: "Falcon Bldg B Mods", id: "#25017", status: "At Risk", needed: "31 needed", actualHours: "14,600h", projectedHours: "22,400h", actualPercent: 65, calendarPercent: 44 },
  { name: "Clear Creek Crossing", id: "#25018", status: "In-Progress", needed: "6 needed", actualHours: "3,120h", projectedHours: "8,900h", actualPercent: 35, calendarPercent: 41 },
  { name: "DCSD Legacy CIP", id: "#25019", status: "On Track", needed: "14 needed", actualHours: "7,450h", projectedHours: "12,000h", actualPercent: 62, calendarPercent: 67 },
  { name: "Redstone HVAC Ph2", id: "#25020", status: "In-Progress", needed: "21 needed", actualHours: "5,280h", projectedHours: "19,750h", actualPercent: 27, calendarPercent: 22 },
  { name: "Skyline MEP Upgrade", id: "#25021", status: "Planning", needed: "9 needed", actualHours: "1,940h", projectedHours: "11,300h", actualPercent: 17, calendarPercent: 15 },
  { name: "Meadow View Sitework", id: "#25022", status: "In-Progress", needed: "18 needed", actualHours: "8,760h", projectedHours: "13,500h", actualPercent: 65, calendarPercent: 52 },
  { name: "North Ridge ES Addition", id: "#25023", status: "At Risk", needed: "25 needed", actualHours: "11,200h", projectedHours: "16,800h", actualPercent: 67, calendarPercent: 48 },
  { name: "Summit Lab Renovation", id: "#25024", status: "On Track", needed: "11 needed", actualHours: "4,640h", projectedHours: "9,400h", actualPercent: 49, calendarPercent: 55 },
]

const PROJECTED_JOBS = [
  { name: "Titan Compark N. Bldg 1-2", operationHours: 3280, planningHours: 4 },
  { name: "CCSD-CCHS - Academics Ph1", operationHours: 3280, planningHours: 350 },
  { name: "Falcon Bldg B Mods-ACCO", operationHours: 1440, planningHours: 1620 },
  { name: "Izzio ASI 5", operationHours: 760, planningHours: 920 },
  { name: "WIC Blast Tunnel Exten.", operationHours: 2410, planningHours: 1980 },
  { name: "PH 2 Lookout Improvements", operationHours: 1320, planningHours: 1650 },
  { name: "Clear Creek Crossing", operationHours: 2980, planningHours: 2450 },
  { name: "DCSD Legacy CIP", operationHours: 2145, planningHours: 2300 },
  { name: "DCHS Security Vestibules", operationHours: 1280, planningHours: 1420 },
  { name: "Boulder Creek Re-Roof", operationHours: 940, planningHours: 880 },
  { name: "Mapleton Admin TI", operationHours: 1775, planningHours: 1540 },
  { name: "North Ridge ES Addition", operationHours: 690, planningHours: 840 },
  { name: "Pine Grove Gym Lighting", operationHours: 2840, planningHours: 2260 },
  { name: "Skyline MEP Upgrade", operationHours: 1185, planningHours: 1325 },
  { name: "Meadow View Sitework", operationHours: 2190, planningHours: 2010 },
  { name: "Carlton Workforce Yard", operationHours: 520, planningHours: 610 },
  { name: "Redstone HVAC Phase 2", operationHours: 3650, planningHours: 2920 },
  { name: "Summit Lab Renovation", operationHours: 1460, planningHours: 1390 },
  { name: "Aurora Safety Vestibule", operationHours: 980, planningHours: 1210 },
]

const HOUR_FORMATTER = new Intl.NumberFormat("en-US")

function formatHours(hours: number) {
  return `${HOUR_FORMATTER.format(hours)}h`
}

function getDeltaPercent(operationHours: number, planningHours: number) {
  if (planningHours === 0) {
    return operationHours === 0 ? 0 : 100
  }

  return Math.round(((operationHours - planningHours) / planningHours) * 100)
}

function formatDelta(delta: number) {
  return `${delta > 0 ? "+" : ""}${delta}%`
}

function getProgressPercent(value: number, max: number) {
  if (value <= 0 || max <= 0) {
    return 0
  }

  return Math.max(3, Math.round((value / max) * 100))
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "relative flex h-[704px] min-w-0 flex-col overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-white",
        "shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1)]",
        className,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-black/10 px-3">
        <h2 className="text-sm leading-5 font-medium text-black">{title}</h2>
        {action && (
          <a
            href="#jobs-cards"
            className="flex items-center gap-0.5 text-xs leading-4 font-normal text-[#525252] underline underline-offset-2"
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

function TimePhaseBar({
  label,
  percent,
  color,
}: {
  label: string
  percent: number
  color: string
}) {
  return (
    <div className="relative h-6 w-full overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-black/[0.05]">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-20 overflow-hidden rounded-[6px]"
        style={{ width: `${percent}%`, backgroundColor: color }}
      >
        <span className="absolute top-1/2 left-2 -translate-y-1/2 whitespace-nowrap text-xs leading-4 font-normal text-white">
          {label}
        </span>
      </div>
      <div className="relative z-10 flex h-full items-center justify-between px-2 text-xs leading-4 font-normal text-black">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 text-black">{percent}%</span>
      </div>
    </div>
  )
}

function NeedsJobRow({ job }: { job: (typeof NEEDS_JOBS)[number] }) {
  return (
    <article className="flex h-[134px] flex-col gap-3 border-b-[0.5px] border-black/10 pt-3 pb-5">
      <div className="flex h-[38px] items-center justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-[13px] leading-[18px] font-normal text-black">{job.name}</h3>
          <p className="flex items-center gap-1.5 text-xs leading-4 font-normal text-[#525252]">
            <span>{job.id}</span>
            <span aria-hidden="true">•</span>
            <span>{job.status}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
          <p className="text-[13px] leading-[18px] font-medium text-black">{job.needed}</p>
          <p className="flex items-center gap-1.5 text-xs leading-4 font-normal text-[#525252]">
            <span>{job.actualHours}</span>
            <span>/</span>
            <span className="text-[#8f8f8f]">{job.projectedHours}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <TimePhaseBar label="Actuals vs Projected" percent={job.actualPercent} color="#0072e4" />
        <TimePhaseBar label="Calendar complete" percent={job.calendarPercent} color="#00a97f" />
      </div>
    </article>
  )
}

function ThinProgress({
  color,
  value,
  label,
}: {
  color: string
  value: number
  label: string
}) {
  return (
    <div className="flex h-[15px] items-center gap-1">
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full border-[0.5px] border-black/10 bg-black/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-14 shrink-0 text-right text-[11px] leading-[15px] font-normal text-[#525252]">
        {label}
      </span>
    </div>
  )
}

function ProjectedRow({ job }: { job: (typeof PROJECTED_JOBS)[number] }) {
  const delta = getDeltaPercent(job.operationHours, job.planningHours)
  const maxHours = Math.max(job.operationHours, job.planningHours)
  const isPositive = delta >= 0

  return (
    <div className="grid h-[50px] grid-cols-[160px_120px_minmax(0,1fr)] border-b-[0.5px] border-black/10 bg-white">
      <div className="flex min-w-0 items-center px-4 py-2">
        <span className="truncate text-xs leading-4 font-normal text-[#525252]">{job.name}</span>
      </div>
      <div className="flex items-center px-4 py-2">
        <span
          className={cn(
            "text-xs leading-4 font-normal",
            isPositive ? "text-[#1a9f64]" : "text-[#e51d31]",
          )}
        >
          {formatDelta(delta)}
        </span>
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-0.5 px-4 py-0.5">
        <ThinProgress
          color="#c0180c"
          value={getProgressPercent(job.operationHours, maxHours)}
          label={formatHours(job.operationHours)}
        />
        <ThinProgress
          color="#6b6259"
          value={getProgressPercent(job.planningHours, maxHours)}
          label={formatHours(job.planningHours)}
        />
      </div>
    </div>
  )
}

function SortHint() {
  return (
    <ChevronSelectorVertical size={12} className="ml-1 shrink-0 text-[#8f8f8f]" aria-hidden="true" />
  )
}

function JobsTimePhasedPanel() {
  return (
    <Panel title="Jobs Time-Phased Value & Needs" action="Open Jobs Cards">
      <div className="relative flex h-[660px] flex-col px-3 pb-3">
        <div
          tabIndex={0}
          className="h-[609px] overflow-y-auto overscroll-contain outline-none scrollbar-hide"
        >
          {NEEDS_JOBS.map((job) => (
            <NeedsJobRow key={job.name} job={job} />
          ))}
        </div>
        <div className="mt-3 border-t-[0.5px] border-[#d6d6d6] pt-3">
          <p className="text-[11px] leading-[15px] font-normal text-[#525252]">
            {NEEDS_JOBS.length} jobs with forecast needs this week
          </p>
        </div>
      </div>
    </Panel>
  )
}

function ForecastProjectedPanel() {
  return (
    <Panel title="Forecast vs Projected">
      <div className="relative flex h-[660px] flex-col px-3 pb-3">
        <div className="flex h-[609px] flex-col gap-3 pt-3">
          <div className="flex h-8 items-center">
            <div className="flex shrink-0 items-center gap-2">
              <div className="w-[224px] shrink-0">
                <SearchField
                  size="sm"
                  placeholder="Search projects"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                className="flex h-8 w-fit shrink-0 items-center gap-2 rounded-[6px] border-[0.5px] border-black/10 bg-white py-2 pr-2 pl-3 text-xs leading-4 font-normal text-black shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)]"
              >
                <span className="text-[#525252]">Δ%</span>
                <span className="flex items-center gap-0.5 whitespace-nowrap">
                  <span>All jobs</span>
                  <ChevronDown size={14} className="text-black" />
                </span>
              </button>
            </div>
            <span className="ml-auto shrink-0 text-[11px] leading-[15px] font-normal text-[#8f8f8f]">
              {PROJECTED_JOBS.length} of {PROJECTED_JOBS.length} jobs
            </span>
          </div>

          <div className="relative h-[596px] overflow-hidden">
            <div className="grid h-8 grid-cols-[160px_120px_minmax(0,1fr)] bg-[#fafafa]">
              <div className="flex items-center px-4 py-2 text-xs leading-4 font-normal text-[#525252]">
                Job <SortHint />
              </div>
              <div className="flex items-center px-4 py-2 text-xs leading-4 font-normal text-[#525252]">
                Δ% <SortHint />
              </div>
              <div className="flex items-center px-4 py-2 text-xs leading-4 font-normal text-[#525252]">
                Operation vs Planning
              </div>
            </div>
            <div
              tabIndex={0}
              className="h-[564px] overflow-y-auto overscroll-contain outline-none scrollbar-hide"
            >
              {PROJECTED_JOBS.map((job) => (
                <ProjectedRow key={job.name} job={job} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 border-t-[0.5px] border-[#d6d6d6] pt-3">
          <div className="flex h-[15px] items-center gap-5">
            <Legend variant="square" color="#c0180c" label="Operation" />
            <Legend variant="square" color="#6b6259" label="Planning" />
          </div>
        </div>
      </div>
    </Panel>
  )
}

export interface DashboardJobsInsightsProps {
  className?: string
}

export function DashboardJobsInsights({ className }: DashboardJobsInsightsProps) {
  return (
    <section
      data-node-id="2494:7426"
      className={cn("grid w-full grid-cols-1 gap-3 min-[900px]:grid-cols-2", className)}
    >
      <JobsTimePhasedPanel />
      <ForecastProjectedPanel />
    </section>
  )
}
