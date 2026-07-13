import type { ReactNode } from "react"
import { Breadcrumb, type BreadcrumbItem } from "@/components/breadcrumb"

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">
        {label}
      </div>
      {children}
    </div>
  )
}

/** build a trail where ancestors are clickable and the last item is the current page */
const trail = (...labels: string[]): BreadcrumbItem[] =>
  labels.map((label, i) => (i < labels.length - 1 ? { label, onClick: () => {} } : { label }))

export function BreadcrumbShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">breadcrumb</h2>
      <p className="text-sm text-secondary mb-4">
        The page-location trail. 12px Geist, current page in black, ancestors in gray with a 12px
        chevron separator and a 14px gap. Long trails collapse the middle into an ellipsis dropdown,
        click the ... to open it.
      </p>

      <div className="flex flex-col gap-5">
        <Row label="1 level (current only)">
          <Breadcrumb items={trail("Menu 1")} />
        </Row>
        <Row label="2 levels">
          <Breadcrumb items={trail("Menu 1", "Menu 2")} />
        </Row>
        <Row label="3 levels">
          <Breadcrumb items={trail("Menu 1", "Menu 2", "Menu 3")} />
        </Row>
        <Row label="4 levels">
          <Breadcrumb items={trail("Menu 1", "Menu 2", "Menu 3", "Menu 4")} />
        </Row>
        <Row label="Collapsed (6 levels, click the ...)">
          <Breadcrumb items={trail("Menu 1", "Menu 2", "Menu 3", "Menu 4", "Menu 5", "Menu 6")} />
        </Row>
      </div>
    </section>
  )
}
