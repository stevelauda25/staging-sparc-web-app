import type { ReactNode } from "react"
import {
  BarChartSquare03,
  Briefcase01,
  Users01,
  LineChartUp01,
  Settings01,
} from "@untitledui/icons"
import { NavItem } from "@/components/nav-item"

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">
        {label}
      </div>
      {/* the sidebar rail sits on the #FBFAF9 app background */}
      <div className="w-[220px] rounded-md bg-background p-1.5 space-y-0.5">{children}</div>
    </div>
  )
}

export function NavItemShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">nav-item</h2>
      <p className="text-sm text-secondary mb-4">
        A sidebar navigation row built on list-base. Leading icon, label, optional expand chevron.
        States: default, hover, current, disabled. Structural variants: expandable and sub.
      </p>

      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        <Group label="States">
          <NavItem icon={BarChartSquare03} label="Dashboard" />
          {/* forced hover fill so the state is always visible */}
          <NavItem icon={Briefcase01} label="Jobs (hover)" className="bg-[#F5F5F5]" />
          <NavItem icon={LineChartUp01} label="Forecast (current)" current />
          <NavItem icon={Settings01} label="Settings (disabled)" disabled />
        </Group>

        <Group label="Expandable">
          <NavItem icon={Users01} label="Workforce (collapsed)" expandable expanded={false} />
          <NavItem icon={Users01} label="Workforce (expanded)" expandable expanded />
        </Group>

        <Group label="Sub-list">
          <NavItem label="Cards" sub />
          <NavItem label="Roster" sub />
          <NavItem label="Availability (current)" sub current />
        </Group>

        <Group label="Usage — a nav tree">
          <NavItem icon={BarChartSquare03} label="Dashboard" current />
          <NavItem icon={Briefcase01} label="Jobs" />
          <NavItem icon={Users01} label="Workforce" expandable expanded />
          <NavItem label="Cards" sub />
          <NavItem label="Roster" sub />
          <NavItem icon={LineChartUp01} label="Forecast" />
          <NavItem icon={Settings01} label="Settings" />
        </Group>
      </div>
    </section>
  )
}
