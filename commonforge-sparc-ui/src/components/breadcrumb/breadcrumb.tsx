import { Fragment, useEffect, useRef, useState } from "react"
import { ChevronRight, DotsHorizontal } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { ListBase } from "@/components/list-base"

export interface BreadcrumbItem {
  /** the crumb label */
  label: string
  /** navigates when the crumb is an ancestor (not the current page) */
  href?: string
  onClick?: () => void
}

export interface BreadcrumbProps {
  /** the trail, first to last. The LAST item is the current page (black). */
  items: BreadcrumbItem[]
  /**
   * Collapse the middle of the trail into an ellipsis menu once there are more
   * than this many items. The first item and the last two always stay visible.
   */
  maxItems?: number
  className?: string
}

// 12px / 16px Geist per the Figma. Current page is black, ancestors are #8f8f8f.
const CRUMB = "text-[12px] leading-[16px] font-normal whitespace-nowrap"

function Crumb({ item, current }: { item: BreadcrumbItem; current: boolean }) {
  if (current) {
    return (
      <span aria-current="page" className={cn(CRUMB, "text-black")}>
        {item.label}
      </span>
    )
  }
  const cls = cn(
    CRUMB,
    "rounded-sm text-[#8f8f8f] outline-none hover:text-black focus-visible:ring-2 focus-visible:ring-[#CFC7BC]",
    (item.href || item.onClick) && "cursor-pointer",
  )
  return item.href ? (
    <a href={item.href} className={cls}>
      {item.label}
    </a>
  ) : (
    <button type="button" onClick={item.onClick} className={cls}>
      {item.label}
    </button>
  )
}

function ChevronSep() {
  return <ChevronRight size={12} className="shrink-0 text-[#8f8f8f]" aria-hidden />
}

/**
 * The "..." trigger plus its dropdown of the collapsed crumbs (Figma "Ellipsis").
 * The trigger takes a gray-50 fill while open; the menu rows reuse list-base.
 */
function EllipsisMenu({ items }: { items: BreadcrumbItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        aria-label="Show hidden breadcrumbs"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[#8f8f8f] outline-none hover:bg-[#f5f5f5] focus-visible:ring-2 focus-visible:ring-[#CFC7BC]",
          open && "bg-[#f5f5f5]",
        )}
      >
        <DotsHorizontal size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-1 flex w-[216px] flex-col gap-1 rounded-[6px] border-[0.5px] border-black/10 bg-white px-1 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.05),0_2px_3px_rgba(0,0,0,0.05),inset_0_0.5px_1px_rgba(255,255,255,0.25)]"
        >
          {items.map((item, i) => (
            <ListBase
              key={i}
              role="menuitem"
              className="w-full cursor-pointer"
              onClick={() => {
                setOpen(false)
                item.onClick?.()
              }}
            >
              {item.label}
            </ListBase>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * breadcrumb — the page-location trail used in the frame header.
 *
 * Renders items separated by a chevron, current page in black and ancestors in
 * gray. Long trails collapse to `first > ... > second-last > last`, where the
 * ellipsis is a dropdown of the hidden crumbs. Built 1:1 from the Figma
 * (nodes 2304:1546 breadcrumb, 2324:1506 ellipsis).
 */
export function Breadcrumb({ items, maxItems = 4, className }: BreadcrumbProps) {
  if (items.length === 0) return null

  const collapsed = items.length > maxItems
  const hidden = collapsed ? items.slice(1, -2) : []
  const nodes: (BreadcrumbItem | "ellipsis")[] = collapsed
    ? [items[0], "ellipsis", items[items.length - 2], items[items.length - 1]]
    : items

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-[14px]", className)}>
      {nodes.map((node, i) => {
        const last = i === nodes.length - 1
        return (
          <Fragment key={i}>
            {node === "ellipsis" ? (
              <EllipsisMenu items={hidden} />
            ) : (
              <Crumb item={node} current={last} />
            )}
            {!last && <ChevronSep />}
          </Fragment>
        )
      })}
    </nav>
  )
}
