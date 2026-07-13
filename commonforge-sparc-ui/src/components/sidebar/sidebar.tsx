import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import {
  BarChartSquare03,
  Building03,
  Briefcase01,
  Map01,
  PresentationChart01,
  UsersCheck,
  Calendar,
  LineChartUp01,
  Certificate01,
  Trophy01,
  PieChart01,
  ClipboardCheck,
  User01,
  Bell03,
  Star06,
  Settings01,
  HelpCircle,
  File06,
  LogOut01,
} from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { NavItem, type IconComponent } from "@/components/nav-item"
import { NavSection } from "@/components/nav-section"
import { Separator } from "@/components/separator"
import { AccountSwitcher } from "@/components/account-switcher"
import { SearchField } from "@/components/search-field"
import { searchProjects } from "@/data/projects"
// deep import (not the barrel) so the sidebar does not import back through app-shell
import { useShell, SidebarToggle } from "@/components/app-shell/shell"

interface NavSub {
  id: string
  label: string
}

interface NavEntry {
  id: string
  label: string
  icon: IconComponent
  /** expandable rows show a chevron; children render when expanded */
  expandable?: boolean
  children?: NavSub[]
}

interface NavGroup {
  id: string
  label: string
  items: NavEntry[]
}

/** The SPARC sidebar structure. Icon names mirror the Figma layer names 1:1
 *  (Whiteboard Assignment uses PresentationChart01, a stand-in for the Figma
 *  "stand" glyph which the icon package does not export). */
const GROUPS: NavGroup[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", icon: BarChartSquare03 },
      {
        id: "jobs",
        label: "Jobs",
        icon: Building03,
        children: [
          { id: "jobs-cards", label: "Cards" },
          { id: "jobs-table", label: "Table" },
          { id: "jobs-forecast", label: "Forecast" },
          { id: "jobs-forecast-graph", label: "Forecast Graph" },
        ],
      },
      {
        id: "workforce",
        label: "Workforce",
        icon: Briefcase01,
        children: [
          { id: "cards", label: "Cards" },
          { id: "assignments", label: "Assignments" },
          { id: "notifications", label: "Notifications" },
        ],
      },
      { id: "map", label: "Map", icon: Map01 },
      { id: "whiteboard", label: "Whiteboard Assignment", icon: PresentationChart01 },
      {
        id: "leadership",
        label: "Leadership Assignments",
        icon: UsersCheck,
        children: [
          { id: "leadership-table", label: "Table" },
          { id: "leadership-gantt", label: "Gantt" },
          { id: "leadership-summary", label: "Summary" },
        ],
      },
    ],
  },
  {
    id: "labor-tools",
    label: "Labor Tools",
    items: [
      {
        id: "project-planning",
        label: "Project Planning",
        icon: Calendar,
        children: [
          { id: "pp-scheduling", label: "Scheduling" },
          { id: "pp-staffing", label: "Staffing" },
        ],
      },
      {
        id: "historical-analysis",
        label: "Historical Analysis",
        icon: LineChartUp01,
        children: [
          { id: "ha-job-analysis", label: "Job Analysis" },
          { id: "ha-group-builder", label: "Group Builder" },
        ],
      },
    ],
  },
  {
    id: "field",
    label: "Field",
    items: [
      {
        id: "qualification",
        label: "Qualifications Management",
        icon: Certificate01,
        children: [
          { id: "qm-skills-entry", label: "Skills Entry" },
          { id: "qm-assessment-tracker", label: "Assessment Tracker" },
          { id: "qm-certifications-entry", label: "Certifications Entry" },
        ],
      },
      {
        id: "skill-dashboard",
        label: "Skills Dashboard",
        icon: Trophy01,
        children: [
          { id: "sd-individual", label: "Individual" },
          { id: "sd-enterprise", label: "Enterprise" },
        ],
      },
      { id: "project-analysis", label: "Project Analysis", icon: PieChart01 },
      { id: "report", label: "Report", icon: ClipboardCheck },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { id: "user-access", label: "User Access", icon: User01 },
      { id: "notification-lists", label: "Notification Lists", icon: Bell03 },
      { id: "ai-observability", label: "AI Observability", icon: Star06 },
      { id: "tenan-config", label: "Tenan Config", icon: Settings01 },
    ],
  },
]

const FOOTER: { id: string; label: string; icon: IconComponent; danger?: boolean }[] = [
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "release-note", label: "Release note", icon: File06 },
  { id: "logout", label: "Log out", icon: LogOut01, danger: true },
]

export interface SidebarProps {
  /** extra fixed-header content (e.g. the search-field) rendered under the account-switcher */
  header?: ReactNode
  /** floating-overlay styling (shadow), used when peeked from a collapsed rail */
  floating?: boolean
  className?: string
}

/**
 * sidebar — the full navigation rail.
 *
 * Three zones: a fixed header (account-switcher, plus the `header` slot for the
 * search-field), a scrolling nav, and a fixed footer. Composes account-switcher,
 * nav-section, nav-item, and separator, and manages the current page and which
 * expandable rows are open. Initialised to match the Figma: Dashboard is current
 * and Workforce is expanded.
 */
export function Sidebar({ header, floating = false, className }: SidebarProps) {
  const { collapsed } = useShell()
  // the toggle lives in the rail whenever the rail is on screen: expanded, or
  // peeked out as a floating overlay. Collapsed-and-hidden, it lives in the header.
  const showToggle = !collapsed || floating

  const [currentId, setCurrentId] = useState("dashboard")
  const [open, setOpen] = useState<Record<string, boolean>>({ workforce: true })

  // global project search: filter the shared project list as the user types
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchResults = searchProjects(searchQuery).map((project) => ({
    id: project.id,
    label: project.name,
    trailing: <span className="text-[11px] leading-[15px] text-secondary">{project.id}</span>,
  }))

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }))

  // fade the nav's scroll edges only where there is more content
  const navRef = useRef<HTMLElement>(null)
  const [fade, setFade] = useState({ top: false, bottom: false })

  const updateFade = useCallback(() => {
    const el = navRef.current
    if (!el) return
    const top = el.scrollTop > 1
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1
    setFade((f) => (f.top === top && f.bottom === bottom ? f : { top, bottom }))
  }, [])

  useEffect(() => {
    const el = navRef.current
    if (!el) return
    updateFade()
    el.addEventListener("scroll", updateFade, { passive: true })
    window.addEventListener("resize", updateFade)
    const observer = new ResizeObserver(updateFade)
    observer.observe(el)
    Array.from(el.children).forEach((child) => observer.observe(child))
    // content height settles a frame later and again once fonts load, recheck
    const raf = requestAnimationFrame(updateFade)
    document.fonts?.ready.then(updateFade).catch(() => {})
    return () => {
      el.removeEventListener("scroll", updateFade)
      window.removeEventListener("resize", updateFade)
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [updateFade])

  // expanding/collapsing changes the content height, so recompute
  useEffect(() => {
    updateFade()
  }, [open, updateFade])

  return (
    <aside
      className={cn(
        // fixed header, scrolling nav, pinned footer. Width in rem so it tracks
        // the root-font-size knob. `floating` styles it as an overlay panel.
        "flex h-full min-h-0 w-[15rem] flex-col bg-background p-2",
        floating && "border-r-[0.5px] border-black/10 shadow-[6px_0_24px_-6px_rgba(32,27,24,0.18)]",
        className,
      )}
    >
      {/* fixed header: account-switcher + compact search */}
      <div className="shrink-0">
        {/* the collapse toggle is a real child here while the rail is shown, so it
            scrolls/pins with the account-switcher (a clone carries the slide) */}
        <AccountSwitcher
          name="Jason Heim"
          initials="JH"
          role="Admin"
          toggle={showToggle ? <SidebarToggle /> : undefined}
        />
        <div className="mt-3">
          {/* small search-field, tuned to the sidebar's compact 26px density */}
          <SearchField
            size="sm"
            shortcut="⌘K"
            placeholder="Search projects"
            fieldClassName="py-1 pl-2 !pr-1"
            containerClassName="h-[26px] border-[0.5px] shadow-[0_0.5px_2px_rgba(0,0,0,0.05)]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            open={searchOpen}
            results={searchResults}
            onSelectResult={(result) => {
              setSearchQuery(result.label)
              setSearchOpen(false)
            }}
          />
        </div>
        {header}
      </div>

      <div className="relative mt-4 min-h-0 flex-1 self-stretch overflow-hidden">
        <nav
          ref={navRef}
          className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto overscroll-y-none scrollbar-hide"
        >
          {GROUPS.map((group) => (
            <NavSection key={group.id} label={group.label}>
              {group.items.map((item) => {
                const expandable = item.expandable || (item.children?.length ?? 0) > 0
                const expanded = !!open[item.id]
                return (
                  <Fragment key={item.id}>
                    <NavItem
                      icon={item.icon}
                      label={item.label}
                      current={currentId === item.id}
                      expandable={expandable}
                      expanded={expanded}
                      onClick={() => (expandable ? toggle(item.id) : setCurrentId(item.id))}
                    />
                    {expandable &&
                      expanded &&
                      item.children?.map((sub) => (
                        <NavItem
                          key={sub.id}
                          label={sub.label}
                          sub
                          current={currentId === sub.id}
                          onClick={() => setCurrentId(sub.id)}
                        />
                      ))}
                  </Fragment>
                )
              })}
            </NavSection>
          ))}
        </nav>
        {fade.top && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-7 bg-gradient-to-b from-background to-transparent" />
        )}
        {fade.bottom && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      <div className="mt-2 flex shrink-0 flex-col gap-0.5 self-stretch">
        <Separator />
        {FOOTER.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            danger={item.danger}
            current={!item.danger && currentId === item.id}
            onClick={() => {
              if (!item.danger) setCurrentId(item.id)
            }}
          />
        ))}
      </div>
    </aside>
  )
}
