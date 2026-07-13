import { ProgressBarBase, type ProgressBarBaseSize } from "@/components/progress-bar-base"

const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

const sizes: Array<{ label: string; size: ProgressBarBaseSize; height: string }> = [
  { label: "Small", size: "sm", height: "4px" },
  { label: "Medium", size: "md", height: "6px" },
  { label: "Large", size: "lg", height: "8px" },
]

export function ProgressBarBaseShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">progress bar base</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Regular progress primitive with sizing variants only. Percent and color stay adjustable as
        data inputs.
      </p>

      <div className="grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {sizes.map(({ label, size, height }) => (
          <div key={size}>
            <div className="mb-3 font-mono text-[9px] font-bold tracking-wider text-neutral-500 uppercase">
              {label} — {height}
            </div>
            <div className="flex flex-col gap-5">
              {values.map((value) => (
                <ProgressBarBase
                  key={`${size}-${value}`}
                  aria-label={`${label} progress ${value}%`}
                  percent={value}
                  size={size}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
