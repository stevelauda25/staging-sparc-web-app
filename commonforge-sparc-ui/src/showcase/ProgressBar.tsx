import { ProgressBar, type ProgressBarSize, type ProgressBarVariant } from "@/components/progress-bar"

const sizes: Array<{ label: string; size: ProgressBarSize }> = [
  { label: "Small", size: "small" },
  { label: "Medium", size: "medium" },
  { label: "Large", size: "large" },
]

const variants: Array<{ label: string; variant: ProgressBarVariant }> = [
  { label: "Default", variant: "default" },
  { label: "Labeled", variant: "labeled" },
  { label: "Indeterminate", variant: "indeterminate" },
]

export function ProgressBarShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">progress bar</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Progress bar variants built from the progress bar base primitive.
      </p>

      <div className="grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {variants.map(({ label, variant }) => (
          <div key={variant}>
            <div className="mb-3 font-mono text-[9px] font-bold tracking-wider text-neutral-500 uppercase">
              {label}
            </div>
            <div className="flex flex-col gap-5">
              {sizes.map(({ label: sizeLabel, size }) => (
                <ProgressBar
                  key={`${variant}-${size}`}
                  variant={variant}
                  size={size}
                  value={60}
                  label={`${sizeLabel} progress`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
