import type { ReactNode } from "react"
import { Circle, Check, Briefcase01, ChevronDown, LogOut01 } from "@untitledui/icons"
import { ListBase } from "@/components/list-base"

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-16 font-mono text-[9px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="w-[200px]">{children}</div>
    </div>
  )
}

export function ListBaseShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">list-base</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The shared row primitive. Leading + label + trailing slots, four states, and its use as a sidebar item.
      </p>

      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-3">States</div>
      <div className="space-y-1.5">
        <Row label="default">
          <ListBase state="default" leading={<Circle size={14} />} trailing={<Circle size={14} />}>
            Option A
          </ListBase>
        </Row>
        <Row label="hover">
          <ListBase state="hover" leading={<Circle size={14} />} trailing={<Circle size={14} />}>
            Option A
          </ListBase>
        </Row>
        <Row label="disabled">
          <ListBase state="disabled" leading={<Circle size={14} />} trailing={<Circle size={14} />}>
            Option A
          </ListBase>
        </Row>
        <Row label="selected">
          <ListBase state="selected" leading={<Circle size={14} />} trailing={<Check size={14} />}>
            Option A
          </ListBase>
        </Row>
      </div>

      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mt-6 mb-3">
        Tone: danger (destructive)
      </div>
      <div className="space-y-1.5">
        <Row label="default">
          <ListBase tone="danger" state="default" leading={<Circle size={14} />} trailing={<Circle size={14} />}>
            Destructive
          </ListBase>
        </Row>
        <Row label="hover">
          <ListBase tone="danger" state="hover" leading={<Circle size={14} />} trailing={<Circle size={14} />}>
            Destructive
          </ListBase>
        </Row>
        <Row label="pressed">
          <ListBase tone="danger" state="selected" leading={<Circle size={14} />} trailing={<Circle size={14} />}>
            Destructive
          </ListBase>
        </Row>
        <Row label="disabled">
          <ListBase tone="danger" state="disabled" leading={<Circle size={14} />} trailing={<Circle size={14} />}>
            Destructive
          </ListBase>
        </Row>
      </div>

      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mt-6 mb-3">
        Sidebar implementation
      </div>
      <div className="w-[220px] space-y-0.5 rounded-md bg-background p-1.5">
        <ListBase leading={<Briefcase01 size={14} />} trailing={<ChevronDown size={14} />}>
          Workforce
        </ListBase>
        <ListBase tone="danger" leading={<LogOut01 size={14} />}>
          Log out
        </ListBase>
      </div>
    </section>
  )
}
