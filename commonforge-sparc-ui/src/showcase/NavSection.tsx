import type { ReactNode } from "react"
import {
  BarChartSquare03,
  Briefcase01,
  Users01,
  LineChartUp01,
  PieChart01,
  Map01,
  Settings01,
} from "@untitledui/icons"
import { NavSection } from "@/components/nav-section"
import { NavItem } from "@/components/nav-item"

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">
        {label}
      </div>
      {/* the sidebar rail sits on the #FBFAF9 app background */}
      <div className="w-[220px] rounded-md bg-background p-1.5">{children}</div>
    </div>
  )
}

export function NavSectionShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">nav-section</h2>
      <p className="text-sm text-secondary mb-4">
        A labeled group of nav-items. The caption is a static list-base row (10px, #8F8F8F,
        uppercase). Children are the section's nav-items.
      </p>

      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        <Group label="Caption only">
          <NavSection label="Operations" />
        </Group>

        <Group label="Labeled section">
          <NavSection label="Operations">
            <NavItem icon={BarChartSquare03} label="Dashboard" current />
            <NavItem icon={Briefcase01} label="Jobs" />
            <NavItem icon={Users01} label="Workforce" expandable expanded />
            <NavItem label="Cards" sub />
            <NavItem label="Roster" sub />
          </NavSection>
        </Group>

        <Group label="Unlabeled group">
          <NavSection>
            <NavItem icon={Settings01} label="Settings" />
            <NavItem icon={Map01} label="Map" />
          </NavSection>
        </Group>

        <Group label="Stacked sections">
          <div className="space-y-3">
            <NavSection label="Operations">
              <NavItem icon={BarChartSquare03} label="Dashboard" current />
              <NavItem icon={Briefcase01} label="Jobs" />
              <NavItem icon={Users01} label="Workforce" expandable expanded={false} />
            </NavSection>
            <NavSection label="Analytics">
              <NavItem icon={LineChartUp01} label="Forecast" />
              <NavItem icon={PieChart01} label="Reports" />
            </NavSection>
          </div>
        </Group>
      </div>
    </section>
  )
}
