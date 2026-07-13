import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ProgressBarBase, type ProgressBarBaseSize } from "@/components/progress-bar-base"

export type ProgressBarVariant = "default" | "labeled" | "indeterminate"
export type ProgressBarSize = "small" | "medium" | "large"

export interface ProgressBarProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  value?: number
  max?: number
  variant?: ProgressBarVariant
  size?: ProgressBarSize
  label?: string
  color?: string
  valueFormatter?: (value: number, max: number) => ReactNode
  trackClassName?: string
  fillClassName?: string
  labelRowClassName?: string
  labelClassName?: string
  valueClassName?: string
}

const sizeToBaseSize: Record<ProgressBarSize, ProgressBarBaseSize> = {
  small: "sm",
  medium: "md",
  large: "lg",
}

function getPercent(value: number, max: number) {
  if (max <= 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

function defaultValueFormatter(value: number, max: number) {
  return `${Math.round(getPercent(value, max))}%`
}

export function ProgressBar({
  value = 0,
  max = 100,
  variant = "default",
  size = "medium",
  label = "Progress",
  color = "#2d251f",
  valueFormatter = defaultValueFormatter,
  className,
  trackClassName,
  fillClassName,
  labelRowClassName,
  labelClassName,
  valueClassName,
  ...props
}: ProgressBarProps) {
  const percent = getPercent(value, max)
  const baseSize = sizeToBaseSize[size]

  if (variant === "indeterminate") {
    return (
      <div className={cn("w-full", className)} {...props}>
        <ProgressBarBase
          aria-label={label}
          percent={35}
          size={baseSize}
          color={color}
          indeterminate
          trackClassName={trackClassName}
          fillClassName={cn(
            "animate-[progress-bar-indeterminate_1.15s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:translate-x-0",
            fillClassName,
          )}
        />
      </div>
    )
  }

  if (variant === "labeled") {
    return (
      <div className={cn("w-full", className)} {...props}>
        <div
          className={cn(
            "mb-0.5 flex items-center justify-between gap-3 text-xs leading-4 text-secondary",
            labelRowClassName,
          )}
        >
          <span className={cn("min-w-0 truncate", labelClassName)}>{label}</span>
          <span className={cn("shrink-0 text-secondary", valueClassName)}>{valueFormatter(value, max)}</span>
        </div>
        <ProgressBarBase
          aria-label={label}
          percent={percent}
          size={baseSize}
          color={color}
          trackClassName={trackClassName}
          fillClassName={fillClassName}
        />
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <ProgressBarBase
        aria-label={label}
        percent={percent}
        size={baseSize}
        color={color}
        trackClassName={trackClassName}
        fillClassName={fillClassName}
      />
    </div>
  )
}
