import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight, ChevronSelectorVertical, ChevronUp } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { SearchField } from "@/components/search-field"
import { Legend } from "@/components/legend"
import { ProgressValueBar } from "@/components/progress-value-bar"
import { ProgressBar } from "@/components/progress-bar"

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

// electrical phase mix. `weight` = share of a job's projected hours; `pace` =
// how far this phase runs vs the job's overall completion (early trades lead,
// finish trades lag). Tuned so Holly Hills reproduces its reference breakdown.
const PHASES = [
  { label: "13 — Distribution", weight: 1.7, pace: 2.35 },
  { label: "11 — Raceways", weight: 45, pace: 1.55 },
  { label: "12 — Wiring", weight: 17, pace: 0.45 },
  { label: "15 — Devices", weight: 4.25, pace: 0.06 },
  { label: "14 — Fixtures", weight: 12.7, pace: 0.22 },
  { label: "16 — Fire Alarm", weight: 5.6, pace: 0.06 },
  { label: "17 — Support", weight: 13.6, pace: 1.4 },
]
const PHASE_WEIGHT_SUM = PHASES.reduce((sum, phase) => sum + phase.weight, 0)

function parseHours(text: string) {
  return Number(text.replace(/[^\d]/g, "")) || 0
}

// deterministic 0..1 jitter, so each job's phases vary a little (no randomness)
function phaseJitter(seed: number) {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

/** derive a realistic per-phase hours breakdown for a job from its own totals */
function phasesFor(job: (typeof NEEDS_JOBS)[number]) {
  const totalProjected = parseHours(job.projectedHours)
  const totalActual = parseHours(job.actualHours)
  const seed = parseHours(job.id)
  const overall = totalProjected > 0 ? totalActual / totalProjected : 0

  // projected splits by phase weight (sums to the job's projected total)
  const projected = PHASES.map((phase) =>
    Math.max(1, Math.round((totalProjected * phase.weight) / PHASE_WEIGHT_SUM)),
  )
  // per-phase completion from its pace, then scale actuals so they add up to the
  // job's actual total (capped at each phase's projected)
  const raw = PHASES.map((phase, index) =>
    projected[index] * Math.min(1, overall * phase.pace * (0.85 + 0.3 * phaseJitter(seed + index))),
  )
  const rawSum = raw.reduce((sum, value) => sum + value, 0)
  const scale = rawSum > 0 ? totalActual / rawSum : 0

  return PHASES.map((phase, index) => ({
    label: phase.label,
    actual: Math.min(projected[index], Math.round(raw[index] * scale)),
    projected: projected[index],
  }))
}

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

function PhaseBreakdown({ id, phases }: { id: string; phases: ReturnType<typeof phasesFor> }) {
  return (
    <div id={id} className="border-t-[0.5px] border-black/10 pt-3">
      <h4 className="mb-2 text-[11px] leading-[15px] font-medium text-[#8f8f8f]">
        Hours by phase — Actual vs Projected
      </h4>
      <div className="flex flex-col gap-3">
        {phases.map((phase) => {
          const percent = Math.round((phase.actual / phase.projected) * 100)
          return (
            <ProgressBar
              key={phase.label}
              variant="labeled"
              size="large"
              label={phase.label}
              value={phase.actual}
              max={phase.projected}
              color="#0072e4"
              trackClassName="bg-black/[0.08]"
              labelClassName="text-black"
              valueClassName="font-medium text-[#525252]"
              valueFormatter={() => (
                // tight "actual / projected" (2px), a 20px gap, then the percent
                <span className="flex items-center justify-end gap-5 whitespace-nowrap">
                  <span className="flex items-center gap-[2px]">
                    <span className="font-normal">{formatHours(phase.actual)}</span>
                    <span className="font-normal text-[#525252]">/</span>
                    <span className="font-normal text-[#8f8f8f]">{formatHours(phase.projected)}</span>
                  </span>
                  <span className="w-8 text-right text-black">{percent}%</span>
                </span>
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

function NeedsJobRow({
  job,
  expanded,
  onToggle,
}: {
  job: (typeof NEEDS_JOBS)[number]
  expanded: boolean
  onToggle: () => void
}) {
  const phaseRegionId = `phase-breakdown-${job.id.slice(1)}`

  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-controls={phaseRegionId}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-3 border-b-[0.5px] border-black/10 px-3 pt-3 outline-none transition-colors hover:bg-black/[0.03] focus-visible:bg-black/[0.03] focus-visible:ring-1 focus-visible:ring-black/20",
        expanded ? "pb-4" : "h-[134px] pb-5",
      )}
    >
      <div className="flex h-[38px] items-center justify-between gap-2">
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
        <ProgressValueBar
          label="Actuals vs Projected"
          valueLabel={`${job.actualPercent}%`}
          percent={job.actualPercent}
          color="#0072e4"
        />
        <ProgressValueBar
          label="Calendar complete"
          valueLabel={`${job.calendarPercent}%`}
          percent={job.calendarPercent}
          color="#00a97f"
        />
      </div>
      {expanded && <PhaseBreakdown id={phaseRegionId} phases={phasesFor(job)} />}
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
      <ProgressBar
        variant="default"
        size="small"
        value={value}
        color={color}
        className="min-w-0 flex-1"
        trackClassName="bg-black/[0.08]"
      />
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

type ProjectedJob = (typeof PROJECTED_JOBS)[number]

const PROJECTED_FILTERS = [
  { id: "all", label: "All jobs", matches: (_job: ProjectedJob) => true },
  {
    id: "over",
    label: "Over projected",
    matches: (job: ProjectedJob) => getDeltaPercent(job.operationHours, job.planningHours) > 0,
  },
  {
    id: "under",
    label: "Under projected",
    matches: (job: ProjectedJob) => getDeltaPercent(job.operationHours, job.planningHours) < 0,
  },
] as const
type ProjectedFilterId = (typeof PROJECTED_FILTERS)[number]["id"]

type SortKey = "job" | "delta"
type SortState = { key: SortKey; dir: "asc" | "desc" } | null

/** cycle a header on click: unsorted -> ascending -> descending -> unsorted */
function nextSort(current: SortState, key: SortKey): SortState {
  if (!current || current.key !== key) return { key, dir: "asc" }
  if (current.dir === "asc") return { key, dir: "desc" }
  return null
}

/** idle shows the up/down selector; sorting swaps to a single directional chevron */
function SortHint({ active, dir }: { active?: boolean; dir?: "asc" | "desc" }) {
  if (active && dir === "asc") {
    return <ChevronUp size={12} className="ml-1 shrink-0 text-[#525252]" aria-hidden="true" />
  }
  if (active && dir === "desc") {
    return <ChevronDown size={12} className="ml-1 shrink-0 text-[#525252]" aria-hidden="true" />
  }
  return <ChevronSelectorVertical size={12} className="ml-1 shrink-0 text-[#8f8f8f]" aria-hidden="true" />
}

function JobsTimePhasedPanel() {
  const [expandedJob, setExpandedJob] = useState<string | null>(NEEDS_JOBS[0]?.name ?? null)

  return (
    <Panel title="Jobs Time-Phased Value & Needs" action="Open Jobs Cards">
      <div className="relative flex h-[660px] flex-col pb-3">
        <div
          tabIndex={0}
          className="h-[609px] overflow-y-auto overscroll-contain outline-none scrollbar-hide"
        >
          {NEEDS_JOBS.map((job) => (
            <NeedsJobRow
              key={job.name}
              job={job}
              expanded={expandedJob === job.name}
              onToggle={() => setExpandedJob((current) => (current === job.name ? null : job.name))}
            />
          ))}
        </div>
        <div className="mx-3 mt-3 border-t-[0.5px] border-[#d6d6d6] pt-3">
          <p className="text-[11px] leading-[15px] font-normal text-[#525252]">
            {NEEDS_JOBS.length} jobs with forecast needs this week
          </p>
        </div>
      </div>
    </Panel>
  )
}

function ForecastProjectedPanel() {
  const [query, setQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<ProjectedFilterId>("all")
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState<SortState>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const selectedFilterOption = PROJECTED_FILTERS.find((filter) => filter.id === selectedFilter) ?? PROJECTED_FILTERS[0]
  const searchedJobs = q
    ? PROJECTED_JOBS.filter((job) => job.name.toLowerCase().includes(q))
    : PROJECTED_JOBS
  const filteredJobs = searchedJobs.filter(selectedFilterOption.matches)
  const sortedJobs = sort
    ? [...filteredJobs].sort((a, b) => {
        const cmp =
          sort.key === "job"
            ? a.name.localeCompare(b.name)
            : getDeltaPercent(a.operationHours, a.planningHours) - getDeltaPercent(b.operationHours, b.planningHours)
        return sort.dir === "asc" ? cmp : -cmp
      })
    : filteredJobs

  // close the filter menu on outside-click or Escape
  useEffect(() => {
    if (!filterOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setFilterOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [filterOpen])

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
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div ref={filterRef} className="relative shrink-0">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen((open) => !open)}
                  className={cn(
                    "flex h-8 w-fit shrink-0 items-center gap-2 rounded-[6px] border-[0.5px] border-black/10 bg-white py-2 pr-2 pl-3 text-xs leading-4 font-normal text-black shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-black/30",
                    filterOpen && "border-black/30",
                  )}
                >
                  <span className="text-[#525252]">Δ%</span>
                  <span className="flex items-center gap-0.5 whitespace-nowrap">
                    <span>{selectedFilterOption.label}</span>
                    <ChevronDown size={14} className={cn("text-black transition-transform", filterOpen && "rotate-180")} />
                  </span>
                </button>
                {filterOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-30 mt-1 flex w-[176px] flex-col gap-0.5 rounded-[6px] border-[0.5px] border-black/10 bg-white p-1 shadow-[0_1px_1px_0_rgba(0,0,0,0.05),0_4px_8px_0_rgba(0,0,0,0.05),0_2px_4px_0_rgba(0,0,0,0.05)]"
                  >
                    {PROJECTED_FILTERS.map((filter) => {
                      const selected = filter.id === selectedFilter
                      const count = searchedJobs.filter(filter.matches).length
                      return (
                        <button
                          key={filter.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={selected}
                          onClick={() => {
                            setSelectedFilter(filter.id)
                            setFilterOpen(false)
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-[2px] px-2 py-1.5 text-left text-xs leading-4 outline-none hover:bg-[#f5f5f5]",
                            selected ? "bg-[#f5f5f5] font-medium text-black" : "font-normal text-[#525252]",
                          )}
                        >
                          <span>{filter.label}</span>
                          <span className="text-[11px] leading-[15px] text-[#8f8f8f]">{count}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <span className="ml-auto shrink-0 text-[11px] leading-[15px] font-normal text-[#8f8f8f]">
              {filteredJobs.length} of {PROJECTED_JOBS.length} jobs
            </span>
          </div>

          <div className="relative h-[596px] overflow-hidden">
            <div className="grid h-8 grid-cols-[160px_120px_minmax(0,1fr)] bg-[#fafafa]">
              <button
                type="button"
                onClick={() => setSort((current) => nextSort(current, "job"))}
                className="flex h-full items-center px-4 text-left text-xs leading-4 font-normal text-[#525252] outline-none transition-colors hover:text-black"
              >
                Job <SortHint active={sort?.key === "job"} dir={sort?.key === "job" ? sort.dir : undefined} />
              </button>
              <button
                type="button"
                onClick={() => setSort((current) => nextSort(current, "delta"))}
                className="flex h-full items-center px-4 text-left text-xs leading-4 font-normal text-[#525252] outline-none transition-colors hover:text-black"
              >
                Δ% <SortHint active={sort?.key === "delta"} dir={sort?.key === "delta" ? sort.dir : undefined} />
              </button>
              <div className="flex items-center px-4 py-2 text-xs leading-4 font-normal text-[#525252]">
                Operation vs Planning
              </div>
            </div>
            <div
              tabIndex={0}
              className="h-[564px] overflow-y-auto overscroll-contain outline-none scrollbar-hide"
            >
              {sortedJobs.length > 0 ? (
                sortedJobs.map((job) => <ProjectedRow key={job.name} job={job} />)
              ) : (
                <p className="px-4 py-8 text-center text-xs leading-4 font-normal text-[#525252]">
                  No projects match &ldquo;{query}&rdquo;
                </p>
              )}
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
