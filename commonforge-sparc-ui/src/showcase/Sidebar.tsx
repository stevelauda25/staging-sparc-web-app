import { Sidebar } from "@/components/sidebar"

export function SidebarShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">sidebar</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The full navigation rail assembled from nav-section, nav-item, and separator. Current page
        and expandable rows are interactive. Click an item to select it, click an expandable row
        (chevron) to open or close it.
      </p>

      {/* fixed height frames the rail so the footer pins to the bottom (justify-between) */}
      <div className="h-[880px] w-60 overflow-hidden rounded-lg border border-border shadow-elev-1">
        <Sidebar className="h-full" />
      </div>
    </section>
  )
}
