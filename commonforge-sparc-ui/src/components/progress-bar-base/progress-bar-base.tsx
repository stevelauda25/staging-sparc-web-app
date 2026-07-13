import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

export type ProgressBarBaseSize = "sm" | "md" | "lg"

export interface ProgressBarBaseProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  percent: number
  size?: ProgressBarBaseSize
  color?: string
  indeterminate?: boolean
  trackClassName?: string
  fillClassName?: string
}

const sizeClasses: Record<ProgressBarBaseSize, string> = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
}

export function ProgressBarBase({
  percent,
  size = "md",
  color = "#2d251f",
  indeterminate = false,
  className,
  trackClassName,
  fillClassName,
  ...props
}: ProgressBarBaseProps) {
  const width = Math.min(100, Math.max(0, percent))

  return (
    <div
      {...props}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(width)}
      aria-label={props["aria-label"] ?? "Progress"}
      className={cn(
        "relative w-full overflow-hidden rounded-full border-[0.5px] border-black/10 bg-black/[0.07]",
        sizeClasses[size],
        trackClassName,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn("h-full rounded-full", fillClassName)}
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  )
}
