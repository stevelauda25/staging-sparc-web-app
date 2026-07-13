import type { ReactNode } from "react"

const RAMPS: { name: string; shades: number[] }[] = [
  { name: "neutral", shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "crimson", shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "green", shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "amber", shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "red", shades: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
]

function Ramp({ name, shades }: { name: string; shades: number[] }) {
  return (
    <div className="mb-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">{name}</div>
      <div className="flex gap-1">
        {shades.map((s) => (
          <div key={s} className="flex-1 text-center">
            <div className="h-9 rounded-md border border-black/5" style={{ background: `var(--${name}-${s})` }} />
            <div className="font-mono text-[8px] text-neutral-500 mt-1">{s}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Label({ children }: { children: ReactNode }) {
  return <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2 mt-6 font-bold">{children}</div>
}

export function TokensShowcase() {
  return (
    <section>
      <h2 className="text-base font-bold mb-3">Tokens</h2>

      <Label>Color ramps</Label>
      {RAMPS.map((r) => (
        <Ramp key={r.name} {...r} />
      ))}

      <Label>Typography — Geist</Label>
      <div className="space-y-1">
        <div className="text-3xl font-extrabold">Display 30 / 800</div>
        <div className="text-xl font-bold">Heading 20 / 700</div>
        <div className="text-sm">Body 14 / 400 &middot; the quick brown fox</div>
        <div className="font-mono text-xs text-neutral-600">Mono &middot; Space Mono &middot; 12</div>
      </div>

      <Label>Radius</Label>
      <div className="flex gap-4 items-end">
        {([["sm", "rounded-sm"], ["md", "rounded-md"], ["lg", "rounded-lg"], ["xl", "rounded-xl"]] as const).map(([r, cls]) => (
          <div key={r} className="text-center">
            <div className={`w-14 h-10 bg-neutral-900 ${cls}`} />
            <div className="font-mono text-[9px] text-neutral-500 mt-1.5">{r}</div>
          </div>
        ))}
      </div>

      <Label>Elevation — layered shadow</Label>
      <div className="flex gap-6 items-end">
        {([["elev-1", "shadow-elev-1"], ["elev-2", "shadow-elev-2"], ["pop", "shadow-pop"]] as const).map(([s, cls]) => (
          <div key={s} className="text-center">
            <div className={`w-16 h-11 bg-surface rounded-lg ${cls} border border-black/5`} />
            <div className="font-mono text-[9px] text-neutral-500 mt-2">{s}</div>
          </div>
        ))}
      </div>

      <Label>Semantic + brand utilities (verifies theme)</Label>
      <div className="flex gap-2 items-center flex-wrap">
        <span className="rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-xs font-semibold">bg-brand</span>
        <span className="rounded-md bg-surface border border-border px-3 py-1.5 text-xs text-primary">text-primary</span>
        <span className="rounded-md bg-surface border border-border px-3 py-1.5 text-xs text-secondary">text-secondary</span>
        <span className="rounded-md bg-surface border border-border px-3 py-1.5 text-xs">bg-surface / border-border</span>
        <span className="rounded-md bg-green-50 text-green-700 px-3 py-1.5 text-xs font-semibold">green</span>
        <span className="rounded-md bg-amber-50 text-amber-700 px-3 py-1.5 text-xs font-semibold">amber</span>
        <span className="rounded-md bg-red-50 text-red-700 px-3 py-1.5 text-xs font-semibold">red</span>
      </div>
    </section>
  )
}
