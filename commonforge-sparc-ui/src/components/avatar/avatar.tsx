import { cn } from "@/lib/utils"

export interface AvatarProps {
  /** image url; when omitted, the initials fallback is shown */
  src?: string
  alt?: string
  /** diameter, given in px at the base scale but rendered in rem so it scales
   *  with the app's root font-size (see index.css) */
  size?: number
  /** initials shown when there is no image (e.g. "JH") */
  fallback?: string
  className?: string
}

/**
 * avatar — a circular user image with an initials fallback.
 *
 * 1px black/10 ring per the Figma. Image is object-cover; without a src it
 * renders the initials on a neutral fill, sized proportionally to the avatar.
 */
export function Avatar({ src, alt, size = 24, fallback, className }: AvatarProps) {
  // render px-at-base as rem so the avatar scales with the root font-size
  const rem = (px: number) => `${px / 16}rem`
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-neutral-200 font-medium leading-none text-neutral-700 uppercase select-none",
        className,
      )}
      style={{ width: rem(size), height: rem(size), fontSize: rem(Math.round(size * 0.42)) }}
      aria-label={src ? undefined : alt}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : fallback}
    </span>
  )
}
