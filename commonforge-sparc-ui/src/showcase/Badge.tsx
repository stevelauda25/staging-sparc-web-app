import type { ReactNode } from "react"
import { Badge, type BadgeProps } from "@/components/badge"

const VARIANTS: { variant: NonNullable<BadgeProps["variant"]>; label: string }[] = [
  { variant: "success", label: "Success" },
  { variant: "error", label: "Error" },
  { variant: "warning", label: "Warning" },
  { variant: "neutral", label: "Neutral" },
  { variant: "outline", label: "Outline" },
]

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export function BadgeShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">badge</h2>
      <p className="text-sm text-secondary mb-4">
        Status and role labels. Fill {"{color}"}-25, border {"{color}"}-200, text and dot{" "}
        {"{color}"}-500. Two sizes, optional dot and leading icon.
      </p>

      <div className="space-y-6">
        <Group label="Small — with dot">
          {VARIANTS.map((v) => (
            <Badge key={v.variant} variant={v.variant} size="sm" dot>
              {v.label}
            </Badge>
          ))}
        </Group>

        <Group label="Medium — with dot">
          {VARIANTS.map((v) => (
            <Badge key={v.variant} variant={v.variant} size="md" dot>
              {v.label}
            </Badge>
          ))}
        </Group>

        <Group label="No dot (plain label)">
          {VARIANTS.map((v) => (
            <Badge key={v.variant} variant={v.variant} size="md">
              {v.label}
            </Badge>
          ))}
        </Group>

        <Group label="Purple (role) — used by the profile">
          <Badge variant="purple" size="sm">
            Admin
          </Badge>
          <Badge variant="purple" size="md">
            Admin
          </Badge>
        </Group>
      </div>
    </section>
  )
}
