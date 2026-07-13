import { cn } from "@/lib/utils"

export interface ProgressValueBarProps {
  label: string
  valueLabel: string
  percent: number
  color: string
  className?: string
  fillTextClassName?: string
  trackTextClassName?: string
  valueClassName?: string
}

export function ProgressValueBar({
  label,
  valueLabel,
  percent,
  color,
  className,
  fillTextClassName,
  trackTextClassName,
  valueClassName,
}: ProgressValueBarProps) {
  const width = Math.min(100, Math.max(0, percent))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className={cn(
        "relative h-6 w-full overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-black/[0.05]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-20 overflow-hidden rounded-[6px]"
        style={{ width: `${width}%`, backgroundColor: color }}
      >
        <span
          className={cn(
            "absolute top-1/2 left-2 -translate-y-1/2 whitespace-nowrap text-xs leading-4 font-normal text-white",
            fillTextClassName,
          )}
        >
          {label}
        </span>
      </div>
      <div
        className={cn(
          "relative z-10 flex h-full items-center justify-between px-2 text-xs leading-4 font-normal text-black",
          trackTextClassName,
        )}
      >
        <span className="min-w-0 truncate">{label}</span>
        <span className={cn("shrink-0 text-black", valueClassName)}>{valueLabel}</span>
      </div>
    </div>
  )
}
