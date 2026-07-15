import type { ReactNode } from "react"
import { Checkbox, type CheckboxProps } from "@/components/checkbox"

const SIZES: NonNullable<CheckboxProps["size"]>[] = ["small", "medium", "large"]

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">{label}</div>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  )
}

export function CheckboxShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">checkbox</h2>
      <p className="text-sm text-secondary mb-4">
        On/off control in three sizes (12 / 16 / 20). Off is a #b8b8b8 hairline, hover darkens the border to
        #000000, on fills #2b2b2b with a white check. Disabled dims to 50%. (Hover column below is forced for
        reference.)
      </p>

      <div className="space-y-6">
        {SIZES.map((size) => (
          <Group key={size} label={`${size} — off · hover · on · disabled off · disabled on`}>
            <Checkbox size={size} />
            <Checkbox size={size} className="border-[#000000]" />
            <Checkbox size={size} checked />
            <Checkbox size={size} disabled />
            <Checkbox size={size} checked disabled />
          </Group>
        ))}
      </div>
    </section>
  )
}
