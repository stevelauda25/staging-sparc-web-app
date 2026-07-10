import type { ReactNode } from "react"
import { BarChartSquare03, Briefcase01, LineChartUp01, PieChart01 } from "@untitledui/icons"
import { Separator } from "@/components/separator"
import { NavSection } from "@/components/nav-section"
import { NavItem } from "@/components/nav-item"

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">
        {label}
      </div>
      <div className="w-[224px] rounded-md bg-background p-1.5">{children}</div>
    </div>
  )
}

export function SeparatorShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">separator</h2>
      <p className="text-sm text-muted-foreground mb-4">
        A hairline divider. 12px row, 8px inset (aligns with row text), 1px line at black/10.
      </p>

      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        <Group label="On its own">
          <Separator />
        </Group>

        <Group label="Between sections">
          <NavSection label="Operations">
            <NavItem icon={BarChartSquare03} label="Dashboard" current />
            <NavItem icon={Briefcase01} label="Jobs" />
          </NavSection>
          <Separator />
          <NavSection label="Analytics">
            <NavItem icon={LineChartUp01} label="Forecast" />
            <NavItem icon={PieChart01} label="Reports" />
          </NavSection>
        </Group>
      </div>
    </section>
  )
}
