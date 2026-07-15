import { ChevronRight, LinkExternal01 } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { KpiCard } from "@/components/kpi-card"
import { Legend } from "@/components/legend"
import { ProgressValueBar } from "@/components/progress-value-bar"

// the shared card shadow (shadow-003)
const CARD_SHADOW =
  "shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1)]"

const KPIS = [
  { label: "Worker missing skills", value: "110", description: "Workers missing a skill" },
  { label: "Avg. skill level", value: "2.9", description: "Average rating, 0 to 5" },
  { label: "Verified skills", value: "80%", description: "Share of skills verified" },
  { label: "Never assessed", value: "11", description: "Workers with no records" },
]

// the 5 skill levels, indexed 0..4. `onDark` marks fills that need white text.
const LEVELS = [
  { color: "#E51D31", label: "Level 1 (Novice)", onDark: true },
  { color: "#EB6214", label: "Level 2 (Basic)", onDark: true },
  { color: "#EFAD20", label: "Level 3 (Intermediate)", onDark: false },
  { color: "#129457", label: "Level 4 (Advanced)", onDark: true },
  { color: "#0072E4", label: "Level 5 (Expert)", onDark: true },
]

const TRADE = [
  { name: "Fire Alarm", value: 1.8 },
  { name: "Distribution Gear", value: 2.0 },
  { name: "Lighting Control System", value: 2.5 },
]
const PROFESSIONAL = [
  { name: "Project Leadership experience", value: 2.4 },
  { name: "Print Reading", value: 0.9 },
  { name: "Labor Productivity & Tracking", value: 2.8 },
]

interface Skill {
  name: string
  value: number
}

/** one horizontal skill bar: a colored fill (its width = value / 5) on a recessed track, value on the right */
function SkillBar({ name, value }: Skill) {
  const level = LEVELS[Math.min(4, Math.max(0, Math.floor(value)))]
  const pct = (value / 5) * 100
  return (
    <ProgressValueBar
      label={name}
      valueLabel={value.toFixed(1)}
      percent={pct}
      color={level.color}
      fillTextClassName={level.onDark ? "text-white" : "text-primary"}
      trackTextClassName="text-primary"
      valueClassName="text-primary"
    />
  )
}

/** a "Bottom 3" panel: title, subtitle, three skill bars, and a 0..5 axis */
function BottomPanel({ title, skills }: { title: string; skills: Skill[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-[6px] border-[0.5px] border-black/10 bg-white p-3 sm:flex-1">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] leading-[18px] font-normal text-primary">{title}</p>
        <p className="text-[12px] leading-4 font-normal text-secondary">
          Lowest average ratings, priority for training
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {skills.map((s) => (
            <SkillBar key={s.name} {...s} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <span key={n} className="text-[11px] leading-[15px] font-normal text-secondary">
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export interface DashboardSkillsInsightsProps {
  className?: string
}

/**
 * dashboard-skills-insights — the "Skills Management" panel (Figma 2494:7804).
 *
 * A card with the standard header (title + "Open Skill Dashboard" link), a row
 * of four KPI tiles (the shared kpi-card, no icon), two "Bottom 3" skill bar
 * charts, and a level legend.
 */
export function DashboardSkillsInsights({ className }: DashboardSkillsInsightsProps) {
  return (
    <section
      data-node-id="2494:7804"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-white",
        CARD_SHADOW,
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2.5 border-b-[0.5px] border-black/10 p-3">
        <h2 className="text-[14px] leading-5 font-medium text-primary">Skills Management</h2>
        <a
          href="#skill-dashboard"
          className="hidden items-center gap-0.5 text-[12px] leading-4 font-normal text-secondary underline underline-offset-2 md:flex"
        >
          Open Skill Dashboard
          <ChevronRight size={14} className="text-secondary" />
        </a>
        <a
          href="#skill-dashboard"
          aria-label="Open Skill Dashboard"
          title="Open Skill Dashboard"
          className="flex size-7 shrink-0 items-center justify-center rounded-[4px] text-secondary outline-none hover:bg-[#f5f5f5] hover:text-primary focus-visible:ring-2 focus-visible:ring-[#CFC7BC] md:hidden"
        >
          <LinkExternal01 size={14} />
        </a>
      </header>

      <div className="flex flex-col gap-3 px-3 pb-3">
        <div className="flex flex-col gap-3 pt-3">
          <div className="grid grid-cols-2 gap-3 md:flex">
            {KPIS.map((k) => (
              <KpiCard key={k.label} className="min-w-0 md:flex-1 md:basis-0 shadow-none" {...k} />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <BottomPanel title="Bottom 3 Trade Skills" skills={TRADE} />
            <BottomPanel title="Bottom 3 Professional Skills" skills={PROFESSIONAL} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LEVELS.map((l) => (
            <Legend key={l.label} variant="square" color={l.color} label={l.label} />
          ))}
        </div>
      </div>
    </section>
  )
}
