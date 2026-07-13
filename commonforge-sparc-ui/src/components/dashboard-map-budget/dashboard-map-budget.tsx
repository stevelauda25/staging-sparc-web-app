import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import { ChevronRight } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { SegmentedButton } from "@/components/segmented-button"
import { Legend } from "@/components/legend"
import { ChartTooltip } from "@/components/chart-tooltip"

const CARD_SHADOW =
  "shadow-[0_2px_6px_-4px_rgba(0,0,0,0.05),0_1px_3px_-2px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),inset_0_-0.5px_0.5px_0_rgba(0,0,0,0.1),inset_0_0.5px_0.5px_0_rgba(255,255,255,0.1)]"
const CHART_TOOLTIP_WIDTH = 168
const CHART_TOOLTIP_HEIGHT = 72
const CHART_TOOLTIP_GAP = 12
const CHART_TOOLTIP_VIEWPORT_PADDING = 8
const PIN_TOOLTIP_WIDTH = 188
const PIN_TOOLTIP_HEIGHT = 80
const PIN_TOOLTIP_GAP = 10
const PIN_COLOR = { staffed: "#0d76f2", "in-progress": "#8b8175" } as const
const PIN_STATUS_LABEL = { staffed: "Staffed", "in-progress": "In-progress" } as const

const BUDGET_KPIS = [
  { label: "Active jobs", value: "104", description: "Jobs in the forecast" },
  { label: "Staffed jobs", value: "29", description: "Jobs with crew assigned" },
  { label: "Jobs over budget", value: "24", description: "Jobs projected over bid" },
]

const BUDGET_LEGEND = [
  { label: "On track", value: "61", percent: "(57%)", color: "#00a97f" },
  { label: "Over budget", value: "14", percent: "(12%)", color: "#e51d31" },
  { label: "No data", value: "27", percent: "(31%)", color: "#b8b8b8" },
]

const BUDGET_STATUS_SEGMENTS = [
  {
    ...BUDGET_LEGEND[0],
    path: "M59.7956 25.6919C60.8476 25.5772 61.6727 24.7078 61.6727 23.6496V1.97027C61.6727 0.837674 60.7327 -0.0720278 59.6027 0.00468955C55.0266 0.315372 50.5824 1.10725 46.3204 2.33007C44.8225 2.75975 43.347 3.24286 41.8963 3.77684C17.4421 12.7795 0 36.2905 0 63.8767C0 98.4552 27.4045 126.631 61.6727 127.856C62.4451 127.884 63.2209 127.897 64 127.897C64.7791 127.897 65.5549 127.884 66.3273 127.856C71.0448 127.687 75.6323 127.008 80.0361 125.871C81.1312 125.588 81.7363 124.431 81.3817 123.357L74.5841 102.771C74.2515 101.764 73.1912 101.197 72.1544 101.421C70.2603 101.831 68.3141 102.101 66.3273 102.22C65.5574 102.266 64.7814 102.289 64 102.289C63.2186 102.289 62.4426 102.266 61.6727 102.22C41.5487 101.016 25.6 84.3095 25.6 63.8767C25.6 47.6286 35.6851 33.7363 49.9352 28.1225C51.3706 27.557 52.8483 27.0756 54.3622 26.6843C56.1273 26.2279 57.9416 25.8939 59.7956 25.6919Z",
  },
  {
    ...BUDGET_LEGEND[1],
    path: "M116.717 96.4279C117.693 96.9917 118.013 98.2526 117.39 99.1926C110.369 109.793 100.277 118.181 88.3829 123.087C87.3331 123.52 86.1501 122.952 85.794 121.873L78.9917 101.273C78.6614 100.273 79.1664 99.1926 80.1222 98.7498C86.183 95.9412 91.3884 91.5983 95.2398 86.2193C95.8611 85.3517 97.0371 85.0623 97.9612 85.596L116.717 96.4279Z",
  },
  {
    ...BUDGET_LEGEND[2],
    path: "M68.2044 25.6919C67.1524 25.5772 66.3271 24.7078 66.3271 23.6496V1.97026C66.3271 0.837663 67.2709 -0.0718425 68.4009 0.00493105C101.694 2.26695 128 29.9986 128 63.8767C128 73.7849 125.75 83.1677 121.733 91.541C121.24 92.5678 119.975 92.9342 118.989 92.3647L100.197 81.5119C99.29 80.9879 98.9463 79.8546 99.356 78.8903C101.316 74.2783 102.4 69.204 102.4 63.8767C102.4 44.0836 87.4341 27.7868 68.2044 25.6919Z",
  },
]

const BUDGET_UTILIZATION_ROWS = [
  { job: "Izzio ASI 5", value: "546%", fill: 82.6 },
  { job: "Falcon Bldg BMods", value: "511%", fill: 78.8 },
  { job: "BVSD Critical Needs", value: "486%", fill: 76.0 },
  { job: "Arrupe Jesuit HS", value: "458%", fill: 72.9 },
  { job: "Picadilly Crossing", value: "432%", fill: 70.1 },
  { job: "Clear Creek Crossing", value: "408%", fill: 67.5 },
  { job: "Aspen Birch Chiller", value: "386%", fill: 65.1 },
  { job: "WIC Blast Tunnel Ext.", value: "364%", fill: 62.7 },
  { job: "DCSD Legacy CIP", value: "342%", fill: 60.3 },
  { job: "Boulder Creek Re-Roof", value: "321%", fill: 58.0 },
  { job: "PH 2 Lookout Improve.", value: "304%", fill: 56.1 },
  { job: "CCSD-CCHS Academy", value: "286%", fill: 54.2 },
  { job: "Titan Compark N. Bldg", value: "269%", fill: 52.3 },
  { job: "Holly Hills Repl ES", value: "252%", fill: 50.5 },
  { job: "BVSD Fairview HS", value: "236%", fill: 48.8 },
  { job: "WIC HQ Expansion", value: "221%", fill: 47.1 },
  { job: "North Ridge Addition", value: "207%", fill: 45.6 },
  { job: "Timnath Service Wing", value: "194%", fill: 44.2 },
  { job: "Mason Street Retrofit", value: "182%", fill: 42.9 },
  { job: "Poudre Admin Remodel", value: "171%", fill: 41.7 },
  { job: "Fossil Ridge Upgrade", value: "160%", fill: 40.5 },
  { job: "Harmony Lab Buildout", value: "149%", fill: 39.3 },
  { job: "Prospect Shop Fitout", value: "138%", fill: 38.1 },
]

// real Front Range coordinates (lat/lng). The Denver job sits on the real
// address 1284 S Cherokee St, Denver CO 80223 (39.69336, -104.99123).
const MAP_PINS = [
  { label: "DC", status: "staffed", job: "DCSD Legacy CIP", id: "#25019", crew: 14, lat: 39.3722, lng: -104.8561 },
  { label: "BK", status: "staffed", job: "Boulder Creek Re-Roof", id: "#25031", crew: 9, lat: 40.0176, lng: -105.2811 },
  { label: "CC", status: "staffed", job: "Clear Creek Crossing", id: "#25018", crew: 6, lat: 39.7861, lng: -105.105 },
  { label: "CA", status: "staffed", job: "CCSD Academics Ph1", id: "#25016", crew: 27, lat: 39.6112, lng: -104.8506 },
  { label: "BV", status: "staffed", job: "BVSD Critical Needs CTE", id: "#25013", crew: 19, lat: 40.015, lng: -105.21 },
  { label: "RF", status: "staffed", job: "Redstone HVAC Ph2", id: "#25020", crew: 21, lat: 39.9528, lng: -105.1686 },
  { label: "MD", status: "staffed", job: "Meadow View Sitework", id: "#25022", crew: 18, lat: 40.1672, lng: -105.1019 },
  { label: "JL", status: "in-progress", job: "Izzio ASI 5", id: "#25027", crew: 8, lat: 39.69336, lng: -104.99123 },
  { label: "TR", status: "in-progress", job: "Titan Compark N. Bldg", id: "#25015", crew: 12, lat: 39.5486, lng: -104.8807 },
  { label: "NR", status: "in-progress", job: "North Ridge ES Addition", id: "#25023", crew: 25, lat: 40.3772, lng: -105.0844 },
  { label: "WH", status: "in-progress", job: "WIC HQ Expansion", id: "#25014", crew: 8, lat: 39.9205, lng: -105.0867 },
  { label: "AP", status: "in-progress", job: "Aurora Safety Vestibule", id: "#25033", crew: 11, lat: 39.7294, lng: -104.8319 },
  { label: "MP", status: "in-progress", job: "Mapleton Admin TI", id: "#25030", crew: 7, lat: 39.868, lng: -104.9719 },
] as const

type BudgetView = "status" | "utilization"
type BudgetLegendItem = (typeof BUDGET_LEGEND)[number]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

interface PanelProps {
  title: string
  action?: string
  actionHref?: string
  children: ReactNode
}

function Panel({ title, action, actionHref = "#", children }: PanelProps) {
  return (
    <section
      className={cn(
        "flex h-[549px] min-w-0 flex-col overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-white",
        CARD_SHADOW,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-black/10 px-3">
        <h2 className="text-[14px] leading-5 font-medium text-primary">{title}</h2>
        {action != null && (
          <a
            href={actionHref}
            className="flex items-center gap-0.5 text-[12px] leading-4 font-normal text-secondary underline underline-offset-2"
          >
            {action}
            <ChevronRight size={14} className="text-secondary" />
          </a>
        )}
      </header>
      {children}
    </section>
  )
}

function MapTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <SegmentedButton
      size="small"
      dividers={false}
      value={value}
      onChange={onChange}
      options={[
        { value: "active", label: "All active", count: 15 },
        { value: "staffed", label: "Staffed", count: 24 },
      ]}
    />
  )
}

type MapPin = (typeof MAP_PINS)[number]

/** a clean circular job pin as a Leaflet divIcon (no default white box) */
function pinIcon(pin: MapPin) {
  return L.divIcon({
    className: "sparc-pin-wrap",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div class="sparc-pin" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:9999px;border:1.5px solid #fff;color:#fff;font-size:13px;line-height:18px;background:${PIN_COLOR[pin.status]};box-shadow:0 2px 4px rgba(0,0,0,0.3),inset 0 -0.5px 1px rgba(0,0,0,0.25),inset 0 0.5px 1px rgba(255,255,255,0.18);transition:transform .15s ease;cursor:pointer;">${pin.label}</div>`,
  })
}

/** a cluster bubble: the count of nearby same-status jobs, in that status'
 *  color with a soft halo ring so it reads as a group, not a single pin */
function clusterIcon(status: MapPin["status"], count: number) {
  const color = PIN_COLOR[status]
  const size = count < 5 ? 36 : count < 10 ? 42 : 48
  return L.divIcon({
    className: "sparc-cluster-wrap",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="sparc-cluster" style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border-radius:9999px;border:2px solid #fff;color:#fff;font-size:13px;font-weight:600;line-height:1;background:${color};box-shadow:0 0 0 4px ${color}33,0 2px 5px rgba(0,0,0,0.35),inset 0 -0.5px 1px rgba(0,0,0,0.25),inset 0 0.5px 1px rgba(255,255,255,0.18);transition:transform .15s ease;cursor:pointer;">${count}</div>`,
  })
}

// brand restyle for Leaflet's +/- zoom control, scoped to this map's host.
// `!` beats Leaflet's own `.leaflet-touch .leaflet-bar a` rules.
const ZOOM_CONTROL_CLASS = cn(
  // container: hairline card + soft shadow, like the dashboard's small controls
  "[&_.leaflet-control-zoom]:overflow-hidden [&_.leaflet-control-zoom]:!rounded-md",
  "[&_.leaflet-control-zoom]:!border-[0.5px] [&_.leaflet-control-zoom]:!border-black/10",
  "[&_.leaflet-control-zoom]:!shadow-[0_1px_2px_-1px_rgba(0,0,0,0.2),0_2px_4px_-2px_rgba(0,0,0,0.12)]",
  // buttons: 28px, white, muted sans +/- glyphs with a hairline divider
  "[&_.leaflet-control-zoom_a]:!size-7 [&_.leaflet-control-zoom_a]:!leading-7",
  "[&_.leaflet-control-zoom_a]:!bg-white [&_.leaflet-control-zoom_a]:!border-black/10",
  "[&_.leaflet-control-zoom_a]:!font-sans [&_.leaflet-control-zoom_a]:!text-base [&_.leaflet-control-zoom_a]:!font-medium",
  "[&_.leaflet-control-zoom_a]:!text-[#525252]",
  // hover + disabled (min/max zoom) states
  "[&_.leaflet-control-zoom_a:hover]:!bg-[#f5f5f5] [&_.leaflet-control-zoom_a:hover]:!text-[#000000]",
  "[&_.leaflet-control-zoom_a.leaflet-disabled]:!bg-white [&_.leaflet-control-zoom_a.leaflet-disabled]:!text-[#cccccc]",
)

function JobMapPanel() {
  const [view, setView] = useState<"active" | "staffed">("active")
  const [tip, setTip] = useState<{ x: number; y: number; pin: MapPin } | null>(null)
  const mapFrame = useRef<HTMLDivElement>(null)
  const mapHost = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const staffedClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const inProgressClusterRef = useRef<L.MarkerClusterGroup | null>(null)

  // anchor the tooltip to the hovered pin, but clamp it inside the map frame so
  // it never overlaps the panel controls above the map
  function showTip(element: HTMLElement, pin: MapPin) {
    const frameRect = mapFrame.current?.getBoundingClientRect()
    if (!frameRect) return
    const rect = element.getBoundingClientRect()
    const minX = CHART_TOOLTIP_VIEWPORT_PADDING
    const minY = CHART_TOOLTIP_VIEWPORT_PADDING
    const maxX = Math.max(minX, frameRect.width - PIN_TOOLTIP_WIDTH - CHART_TOOLTIP_VIEWPORT_PADDING)
    const maxY = Math.max(minY, frameRect.height - PIN_TOOLTIP_HEIGHT - CHART_TOOLTIP_VIEWPORT_PADDING)
    const x = clamp(rect.left + rect.width / 2 - frameRect.left - PIN_TOOLTIP_WIDTH / 2, minX, maxX)
    const above = rect.top - frameRect.top - PIN_TOOLTIP_GAP - PIN_TOOLTIP_HEIGHT
    const below = rect.bottom - frameRect.top + PIN_TOOLTIP_GAP
    const y = clamp(above >= minY ? above : below, minY, maxY)
    setTip({ x, y, pin })
  }

  // set up the Leaflet map once, with free CARTO Positron raster tiles (no API
  // key), framed on the Colorado Front Range where these jobs live
  useEffect(() => {
    const host = mapHost.current
    if (!host || mapRef.current) return

    // scrollWheelZoom + touchZoom only fire while the pointer/fingers are over
    // the map, so wheel + trackpad-pinch zoom here without hijacking page scroll
    const map = L.map(host, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      touchZoom: true,
      wheelPxPerZoomLevel: 120,
    })
    mapRef.current = map

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map)

    // one cluster group per status, so staffed only groups with staffed and
    // in-progress only with in-progress. Nearby same-status pins collapse into
    // a colored count bubble; zoom in (or click a bubble) to split them apart.
    const clusterOptions: L.MarkerClusterGroupOptions = {
      maxClusterRadius: 44,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
    }
    const staffedCluster = L.markerClusterGroup({
      ...clusterOptions,
      iconCreateFunction: (cluster) => clusterIcon("staffed", cluster.getChildCount()),
    })
    const inProgressCluster = L.markerClusterGroup({
      ...clusterOptions,
      iconCreateFunction: (cluster) => clusterIcon("in-progress", cluster.getChildCount()),
    })
    staffedClusterRef.current = staffedCluster
    inProgressClusterRef.current = inProgressCluster

    MAP_PINS.forEach((pin) => {
      const marker = L.marker([pin.lat, pin.lng] as [number, number], {
        icon: pinIcon(pin),
        keyboard: false,
      })
      marker.on("mouseover", () => {
        const inner = marker.getElement()?.querySelector<HTMLElement>(".sparc-pin")
        if (inner) {
          inner.style.transform = "scale(1.12)"
          showTip(inner, pin)
        }
      })
      marker.on("mouseout", () => {
        const inner = marker.getElement()?.querySelector<HTMLElement>(".sparc-pin")
        if (inner) inner.style.transform = ""
        setTip(null)
      })
      ;(pin.status === "staffed" ? staffedCluster : inProgressCluster).addLayer(marker)
    })
    staffedCluster.addTo(map)
    inProgressCluster.addTo(map)

    // the panel can mount at 0px width, so frame the pins only once it has a
    // real size, and keep tiles correct when the panel/sidebar resizes it
    const bounds = L.latLngBounds(MAP_PINS.map((p) => [p.lat, p.lng] as [number, number]))
    let framed = false
    const sync = () => {
      map.invalidateSize()
      if (!framed && host.clientWidth > 0) {
        map.fitBounds(bounds, { padding: [30, 30] })
        framed = true
      }
    }
    const observer = new ResizeObserver(sync)
    observer.observe(host)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      staffedClusterRef.current = null
      inProgressClusterRef.current = null
    }
  }, [])

  // the tab toggles the in-progress group (staffed stays on)
  useEffect(() => {
    const map = mapRef.current
    const inProgress = inProgressClusterRef.current
    if (!map || !inProgress) return
    if (view === "active") {
      if (!map.hasLayer(inProgress)) inProgress.addTo(map)
    } else if (map.hasLayer(inProgress)) {
      map.removeLayer(inProgress)
    }
  }, [view])

  return (
    <Panel title="Job Map" action="Open Map" actionHref="#map">
      <div className="flex h-[505px] flex-col px-3 pb-3">
        <div className="flex h-[470px] flex-col gap-3 pt-3">
          <div className="flex h-7 items-center justify-between">
            <MapTabs value={view} onChange={(next) => setView(next as "active" | "staffed")} />
            <div className="flex items-center gap-5">
              <Legend variant="square" color="#0d76f2" label="Staffed" />
              <Legend variant="square" color="#8b8175" label="In-progress" />
            </div>
          </div>
          {/* live map: Leaflet + free CARTO Positron raster tiles. `isolate`
              keeps the map's z-index stack from fighting the hover tooltip */}
          <div
            ref={mapFrame}
            className={cn(
              "relative isolate h-[414px] w-full overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-[#f5f5f5]",
              ZOOM_CONTROL_CLASS,
            )}
          >
            <div ref={mapHost} className="h-full w-full" />
            {tip != null && (
              <ChartTooltip
                title={tip.pin.job}
                className="pointer-events-none absolute z-[1000] w-[188px]"
                style={{ left: tip.x, top: tip.y }}
                items={[
                  {
                    color: PIN_COLOR[tip.pin.status],
                    markerClassName: "rounded-full",
                    label: PIN_STATUS_LABEL[tip.pin.status],
                    value: tip.pin.id,
                  },
                ]}
              >
                <div className="mt-1 text-[12px] leading-4 text-[#b8b8b8]">{tip.pin.crew} crew assigned</div>
              </ChartTooltip>
            )}
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-[15px] font-normal text-secondary">
          95 of 104 active jobs mapped (9 have no mappable address). Hover a pin for details.
        </p>
      </div>
    </Panel>
  )
}

function BudgetKpi({ label, value, description }: (typeof BUDGET_KPIS)[number]) {
  return (
    <article className="flex h-[104px] min-w-0 flex-1 flex-col justify-between rounded-[6px] border-[0.5px] border-black/10 bg-white p-3">
      <p className="text-[12px] leading-4 font-normal text-secondary">{label}</p>
      <div className="flex flex-col gap-1">
        <p className="text-[20px] leading-6 font-medium text-primary">{value}</p>
        <p className="text-[12px] leading-4 font-normal text-secondary">{description}</p>
      </div>
    </article>
  )
}

function BudgetTabs({ view, onChange }: { view: BudgetView; onChange: (view: BudgetView) => void }) {
  return (
    <SegmentedButton
      size="small"
      dividers={false}
      value={view}
      onChange={(nextView) => onChange(nextView as BudgetView)}
      options={[
        { value: "status", label: "Budget status" },
        { value: "utilization", label: "Budget utilization" },
      ]}
    />
  )
}

function BudgetLegend({ items = BUDGET_LEGEND }: { items?: BudgetLegendItem[] }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-start gap-x-5 gap-y-2">
      {items.map((item) => (
        <Legend
          key={item.label}
          variant="square"
          bordered
          color={item.color}
          label={item.label}
          value={item.value}
          percent={item.percent}
        />
      ))}
    </div>
  )
}

function BudgetStatusContent() {
  const chartRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; item: BudgetLegendItem } | null>(null)

  function handleSegmentPointerMove(event: PointerEvent<SVGPathElement>, item: BudgetLegendItem) {
    const chartRect = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (!chartRect) return

    const minX = CHART_TOOLTIP_VIEWPORT_PADDING
    const minY = CHART_TOOLTIP_VIEWPORT_PADDING
    const maxX = Math.max(minX, window.innerWidth - CHART_TOOLTIP_WIDTH - CHART_TOOLTIP_VIEWPORT_PADDING)
    const maxY = Math.max(minY, window.innerHeight - CHART_TOOLTIP_HEIGHT - CHART_TOOLTIP_VIEWPORT_PADDING)
    const shouldPlaceLeft = event.clientX < chartRect.left + chartRect.width / 2
    const x = clamp(
      shouldPlaceLeft
        ? chartRect.left - CHART_TOOLTIP_WIDTH - CHART_TOOLTIP_GAP
        : chartRect.right + CHART_TOOLTIP_GAP,
      minX,
      maxX,
    )
    const y = clamp(event.clientY - CHART_TOOLTIP_HEIGHT / 2, minY, maxY)

    setTooltip({
      x,
      y,
      item,
    })
  }

  return (
    <div role="tabpanel" aria-label="Budget status" className="mt-[20px] flex min-h-0 flex-1 flex-col items-center">
      <BudgetLegend />
      <div ref={chartRef} className="relative flex min-h-0 flex-1 items-center justify-center pt-4">
        <svg
          viewBox="0 0 128 127.897"
          preserveAspectRatio="xMidYMid meet"
          className="size-32 shrink-0 overflow-visible"
          role="img"
          aria-label="Budget status chart: 57% on track, 12% over budget, 31% no data"
        >
          <defs>
            <filter id="budget-status-shadow" x="-12%" y="-12%" width="124%" height="124%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.18" />
            </filter>
          </defs>
          {BUDGET_STATUS_SEGMENTS.map((segment) => (
            <path
              key={segment.label}
              d={segment.path}
              fill={segment.color}
              filter="url(#budget-status-shadow)"
              aria-label={`${segment.label}: ${segment.value} jobs ${segment.percent}`}
              className="cursor-default"
              onPointerMove={(event) => handleSegmentPointerMove(event, segment)}
              onPointerLeave={() => setTooltip(null)}
            />
          ))}
        </svg>
        {tooltip != null && (
          <ChartTooltip
            title="Budget status"
            className="fixed z-50"
            style={{ left: tooltip.x, top: tooltip.y }}
            items={[
              {
                color: tooltip.item.color,
                label: tooltip.item.label,
                value: `${tooltip.item.value} ${tooltip.item.percent}`,
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}

function BudgetUtilizationContent() {
  return (
    <div
      role="tabpanel"
      aria-label="Budget utilization"
      className="mt-[20px] flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto overscroll-contain scrollbar-hide"
    >
      {BUDGET_UTILIZATION_ROWS.map((row) => (
        <div
          key={row.job}
          aria-label={`${row.job} budget utilization ${row.value}`}
          className="relative h-[23px] shrink-0 overflow-hidden rounded-[4px] border-[0.5px] border-black/10 bg-black/[0.05]"
        >
          <div
            className="absolute inset-y-0 left-0 flex items-center rounded-[4px] bg-[#c0180c] px-[6px] py-1"
            style={{ width: `${row.fill}%` }}
          >
            <span className="truncate text-[11px] leading-[15px] font-normal text-white">{row.job}</span>
          </div>
          <span className="absolute inset-y-0 right-[6px] flex items-center py-1 text-[11px] leading-[15px] font-normal text-primary">
            {row.value}
          </span>
        </div>
      ))}
      </div>
  )
}

function ForecastBudgetPanel() {
  const [view, setView] = useState<BudgetView>("status")

  return (
    <Panel title="Forecast to Budget">
      <div className="flex h-[505px] flex-col px-3 pb-3">
        <div className="flex h-[466px] flex-col gap-3 pt-3">
          <div className="flex h-[104px] gap-3">
            {BUDGET_KPIS.map((kpi) => (
              <BudgetKpi key={kpi.label} {...kpi} />
            ))}
          </div>
          <div className="flex h-[338px] flex-col rounded-[6px] border-[0.5px] border-black/10 bg-white p-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-[13px] leading-[18px] font-normal text-primary">Budget status vs utilization</h3>
              <p className="text-[12px] leading-4 font-normal text-secondary">
                Spectrum projected vs labor hours bid across active jobs
              </p>
            </div>
            <div className="mt-3">
              <BudgetTabs view={view} onChange={setView} />
            </div>
            {view === "status" ? <BudgetStatusContent /> : <BudgetUtilizationContent />}
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-[15px] font-normal text-secondary">
          24 of 104 active jobs are trending over budget
        </p>
      </div>
    </Panel>
  )
}

export interface DashboardMapBudgetProps {
  className?: string
}

export function DashboardMapBudget({ className }: DashboardMapBudgetProps) {
  return (
    <section
      data-node-id="2494:7708"
      className={cn("grid w-full grid-cols-1 gap-3 min-[900px]:grid-cols-2", className)}
    >
      <JobMapPanel />
      <ForecastBudgetPanel />
    </section>
  )
}
