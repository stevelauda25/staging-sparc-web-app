import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import { ChevronRight, LinkExternal01 } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { SegmentedButton } from "@/components/segmented-button"
import { Legend } from "@/components/legend"
import { ChartTooltip } from "@/components/chart-tooltip"
import { OverlayScrollArea } from "@/components/overlay-scroll-area"

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
  { label: "PG", status: "staffed", job: "Pine Grove Gym Lighting", id: "#25034", crew: 10, lat: 39.7404, lng: -105.1573 },
  { label: "SL", status: "staffed", job: "Skyline MEP Upgrade", id: "#25021", crew: 9, lat: 39.7392, lng: -104.9903 },
  { label: "FR", status: "staffed", job: "Fossil Ridge Upgrade", id: "#25035", crew: 16, lat: 40.5032, lng: -105.0125 },
  { label: "HL", status: "staffed", job: "Holly Hills Repl ES", id: "#25011", crew: 23, lat: 39.6642, lng: -104.9151 },
  { label: "FV", status: "staffed", job: "BVSD Fairview HS", id: "#25012", crew: 16, lat: 39.9968, lng: -105.2641 },
  { label: "RH", status: "staffed", job: "Redstone HVAC Phase 2", id: "#25020", crew: 21, lat: 39.5667, lng: -105.0697 },
  { label: "SV", status: "in-progress", job: "Summit Lab Renovation", id: "#25024", crew: 11, lat: 39.7555, lng: -105.2211 },
  { label: "MS", status: "in-progress", job: "Mason Street Retrofit", id: "#25036", crew: 5, lat: 40.5898, lng: -105.077 },
  { label: "HC", status: "in-progress", job: "Harmony Lab Buildout", id: "#25037", crew: 13, lat: 40.515, lng: -105.025 },
  { label: "PS", status: "in-progress", job: "Prospect Shop Fitout", id: "#25038", crew: 4, lat: 40.567, lng: -105.092 },
  { label: "TM", status: "in-progress", job: "Timnath Service Wing", id: "#25039", crew: 15, lat: 40.5292, lng: -104.985 },
  { label: "LV", status: "staffed", job: "Loveland Medical Wing", id: "#25040", crew: 12, lat: 40.3978, lng: -105.075 },
  { label: "GR", status: "staffed", job: "Greeley Admin Center", id: "#25041", crew: 18, lat: 40.4233, lng: -104.7091 },
  { label: "WN", status: "staffed", job: "Windsor Field Office", id: "#25042", crew: 7, lat: 40.4775, lng: -104.9014 },
  { label: "JT", status: "staffed", job: "Johnstown Service Yard", id: "#25043", crew: 6, lat: 40.3369, lng: -104.9122 },
  { label: "BT", status: "staffed", job: "Berthoud Shop Retrofit", id: "#25044", crew: 9, lat: 40.3083, lng: -105.0811 },
  { label: "LG", status: "staffed", job: "Longmont Career Tech", id: "#25045", crew: 17, lat: 40.1643, lng: -105.1036 },
  { label: "LF", status: "staffed", job: "Lafayette Elementary", id: "#25046", crew: 10, lat: 39.9936, lng: -105.0897 },
  { label: "ER", status: "staffed", job: "Erie Campus Addition", id: "#25047", crew: 14, lat: 40.0503, lng: -105.05 },
  { label: "SU", status: "staffed", job: "Superior Fire Alarm", id: "#25048", crew: 5, lat: 39.9525, lng: -105.1677 },
  { label: "AR", status: "staffed", job: "Arvada Learning Center", id: "#25049", crew: 15, lat: 39.8028, lng: -105.0875 },
  { label: "WT", status: "staffed", job: "Westminster Yard", id: "#25050", crew: 8, lat: 39.8367, lng: -105.0372 },
  { label: "BR", status: "staffed", job: "Brighton High School", id: "#25051", crew: 19, lat: 39.9853, lng: -104.8205 },
  { label: "LC", status: "staffed", job: "Littleton Civic HVAC", id: "#25052", crew: 11, lat: 39.6133, lng: -105.0166 },
  { label: "CM", status: "staffed", job: "Castle Rock Middle", id: "#25053", crew: 16, lat: 39.3727, lng: -104.8561 },
  { label: "MO", status: "staffed", job: "Monument Athletic Fields", id: "#25054", crew: 13, lat: 39.0917, lng: -104.8728 },
  { label: "CS", status: "staffed", job: "Colorado Springs Lab", id: "#25055", crew: 20, lat: 38.8339, lng: -104.8214 },
  { label: "FY", status: "in-progress", job: "Fort Collins Yard", id: "#25056", crew: 6, lat: 40.5853, lng: -105.0844 },
  { label: "LW", status: "in-progress", job: "Loveland West ES", id: "#25057", crew: 9, lat: 40.3972, lng: -105.0749 },
  { label: "GV", status: "in-progress", job: "Greeley Vocational", id: "#25058", crew: 8, lat: 40.423, lng: -104.7095 },
  { label: "BD", status: "in-progress", job: "Boulder District Office", id: "#25059", crew: 11, lat: 40.015, lng: -105.2705 },
  { label: "LM", status: "in-progress", job: "Louisville Mechanical", id: "#25060", crew: 7, lat: 39.9778, lng: -105.1319 },
  { label: "BM", status: "in-progress", job: "Broomfield Modular", id: "#25061", crew: 10, lat: 39.92, lng: -105.086 },
  { label: "TH", status: "in-progress", job: "Thornton Security", id: "#25062", crew: 12, lat: 39.8684, lng: -104.9711 },
  { label: "CY", status: "in-progress", job: "Commerce City Ops", id: "#25063", crew: 5, lat: 39.8083, lng: -104.9339 },
  { label: "LK", status: "in-progress", job: "Lakewood Controls", id: "#25064", crew: 8, lat: 39.7047, lng: -105.0814 },
  { label: "CN", status: "in-progress", job: "Centennial Tech Lab", id: "#25065", crew: 14, lat: 39.5807, lng: -104.8772 },
  { label: "HR", status: "in-progress", job: "Highlands Ranch Wing", id: "#25066", crew: 12, lat: 39.5447, lng: -104.9706 },
  { label: "PK", status: "in-progress", job: "Parker East Wing", id: "#25067", crew: 9, lat: 39.5186, lng: -104.7614 },
  { label: "FG", status: "in-progress", job: "Fountain Generator", id: "#25068", crew: 6, lat: 38.6822, lng: -104.7008 },
  { label: "PB", status: "in-progress", job: "Pueblo West Yard", id: "#25069", crew: 13, lat: 38.35, lng: -104.7228 },
  { label: "PC", status: "in-progress", job: "Pueblo Central HS", id: "#25070", crew: 18, lat: 38.263, lng: -104.612 },
  { label: "WD", status: "in-progress", job: "Woodland Park HS", id: "#25071", crew: 7, lat: 38.9939, lng: -105.0569 },
  { label: "EP", status: "in-progress", job: "Estes Park Visitor Remodel", id: "#25072", crew: 8, lat: 40.3772, lng: -105.5217 },
  { label: "LY", status: "in-progress", job: "Lyons School Controls", id: "#25073", crew: 5, lat: 40.2247, lng: -105.2714 },
  { label: "ND", status: "in-progress", job: "Nederland Field Shop", id: "#25074", crew: 6, lat: 39.9614, lng: -105.5108 },
  { label: "EV", status: "in-progress", job: "Evergreen Mechanical", id: "#25075", crew: 11, lat: 39.6333, lng: -105.3172 },
  { label: "CF", status: "in-progress", job: "Conifer Elementary", id: "#25076", crew: 9, lat: 39.5228, lng: -105.3053 },
  { label: "ID", status: "in-progress", job: "Idaho Springs Ops", id: "#25077", crew: 7, lat: 39.7425, lng: -105.5136 },
  { label: "GT", status: "in-progress", job: "Georgetown Lighting", id: "#25078", crew: 4, lat: 39.7061, lng: -105.6975 },
  { label: "SX", status: "in-progress", job: "Silverthorne Service", id: "#25079", crew: 10, lat: 39.6321, lng: -106.0743 },
  { label: "DL", status: "in-progress", job: "Dillon Admin Center", id: "#25080", crew: 6, lat: 39.6303, lng: -106.0434 },
  { label: "BN", status: "in-progress", job: "Breckenridge Field Lab", id: "#25081", crew: 12, lat: 39.4817, lng: -106.0384 },
  { label: "VA", status: "in-progress", job: "Vail Fire Alarm", id: "#25082", crew: 8, lat: 39.6403, lng: -106.3742 },
  { label: "ED", status: "in-progress", job: "Edwards School Wing", id: "#25083", crew: 13, lat: 39.6425, lng: -106.5942 },
  { label: "AV", status: "in-progress", job: "Avon Rec Center", id: "#25084", crew: 9, lat: 39.6314, lng: -106.5222 },
  { label: "GS", status: "in-progress", job: "Glenwood Springs Health", id: "#25085", crew: 14, lat: 39.5505, lng: -107.3248 },
  { label: "RI", status: "in-progress", job: "Rifle Workforce Yard", id: "#25086", crew: 7, lat: 39.5347, lng: -107.7831 },
  { label: "GJ", status: "in-progress", job: "Grand Junction Campus", id: "#25087", crew: 18, lat: 39.0639, lng: -108.5506 },
  { label: "FT", status: "in-progress", job: "Fruita Service Annex", id: "#25088", crew: 5, lat: 39.1589, lng: -108.7289 },
  { label: "MT", status: "in-progress", job: "Montrose Field Office", id: "#25089", crew: 10, lat: 38.4783, lng: -107.8762 },
  { label: "DV", status: "in-progress", job: "Delta Vocational Lab", id: "#25090", crew: 8, lat: 38.7422, lng: -108.0689 },
  { label: "GU", status: "in-progress", job: "Gunnison College Shop", id: "#25091", crew: 13, lat: 38.5458, lng: -106.9253 },
  { label: "CB", status: "in-progress", job: "Crested Butte HVAC", id: "#25092", crew: 6, lat: 38.8697, lng: -106.9878 },
  { label: "SA", status: "in-progress", job: "Salida School Remodel", id: "#25093", crew: 11, lat: 38.5347, lng: -105.9989 },
  { label: "BA", status: "in-progress", job: "Buena Vista Shop", id: "#25094", crew: 8, lat: 38.8422, lng: -106.1311 },
  { label: "CE", status: "in-progress", job: "Canon City Controls", id: "#25095", crew: 12, lat: 38.4494, lng: -105.2253 },
  { label: "TN", status: "in-progress", job: "Trinidad District Office", id: "#25096", crew: 7, lat: 37.1695, lng: -104.5005 },
  { label: "AL", status: "in-progress", job: "Alamosa Career Center", id: "#25097", crew: 9, lat: 37.4694, lng: -105.87 },
  { label: "DR", status: "in-progress", job: "Durango Campus Wing", id: "#25098", crew: 15, lat: 37.2753, lng: -107.8801 },
  { label: "CO", status: "in-progress", job: "Cortez Service Center", id: "#25099", crew: 6, lat: 37.3489, lng: -108.5859 },
  { label: "TL", status: "in-progress", job: "Telluride Mountain School", id: "#25100", crew: 5, lat: 37.9375, lng: -107.8123 },
  { label: "OR", status: "in-progress", job: "Ouray Facilities Yard", id: "#25101", crew: 4, lat: 38.0228, lng: -107.6714 },
  { label: "EA", status: "in-progress", job: "Eagle County Annex", id: "#25102", crew: 10, lat: 39.6553, lng: -106.8287 },
  { label: "LD", status: "in-progress", job: "Leadville High School", id: "#25103", crew: 8, lat: 39.2508, lng: -106.2925 },
  { label: "WP", status: "in-progress", job: "Winter Park Lift Shop", id: "#25104", crew: 6, lat: 39.8917, lng: -105.7631 },
  { label: "GN", status: "in-progress", job: "Granby Service Garage", id: "#25105", crew: 7, lat: 40.0861, lng: -105.9395 },
  { label: "ST", status: "in-progress", job: "Steamboat Springs Lab", id: "#25106", crew: 11, lat: 40.485, lng: -106.8317 },
  { label: "CR", status: "in-progress", job: "Craig Operations Center", id: "#25107", crew: 9, lat: 40.5152, lng: -107.5464 },
  { label: "HD", status: "in-progress", job: "Hayden School Controls", id: "#25108", crew: 5, lat: 40.4953, lng: -107.257 },
  { label: "WL", status: "in-progress", job: "Walsenburg District Yard", id: "#25109", crew: 8, lat: 37.6242, lng: -104.7803 },
  { label: "LJ", status: "in-progress", job: "La Junta Vocational", id: "#25110", crew: 6, lat: 37.985, lng: -103.5438 },
  { label: "LR", status: "in-progress", job: "Lamar High School", id: "#25111", crew: 10, lat: 38.0872, lng: -102.6208 },
  { label: "BU", status: "in-progress", job: "Burlington Field Office", id: "#25112", crew: 4, lat: 39.3061, lng: -102.2694 },
  { label: "FM", status: "in-progress", job: "Fort Morgan Warehouse", id: "#25113", crew: 12, lat: 40.2503, lng: -103.7999 },
  { label: "SG", status: "in-progress", job: "Sterling Campus Upgrade", id: "#25114", crew: 9, lat: 40.6255, lng: -103.2077 },
  { label: "AK", status: "in-progress", job: "Akron Maintenance Yard", id: "#25115", crew: 5, lat: 40.1605, lng: -103.2144 },
  { label: "YC", status: "in-progress", job: "Yuma Community School", id: "#25116", crew: 7, lat: 40.1222, lng: -102.7252 },
  { label: "WY", status: "in-progress", job: "Wray District Shop", id: "#25117", crew: 6, lat: 40.0758, lng: -102.2232 },
  { label: "KT", status: "in-progress", job: "Kit Carson Field House", id: "#25118", crew: 4, lat: 38.7644, lng: -102.7957 },
  { label: "SP", status: "in-progress", job: "Springfield Controls", id: "#25119", crew: 5, lat: 37.4083, lng: -102.6144 },
] as const

const TOTAL_ACTIVE_JOBS = 104
const STAFFED_PIN_COUNT = MAP_PINS.filter((pin) => pin.status === "staffed").length
const UNMAPPED_JOB_COUNT = Math.max(0, TOTAL_ACTIVE_JOBS - MAP_PINS.length)

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
        "flex min-w-0 flex-col overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-white md:h-[549px]",
        CARD_SHADOW,
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between border-b-[0.5px] border-black/10 px-3">
        <h2 className="text-[14px] leading-5 font-medium text-primary">{title}</h2>
        {action != null && (
          <a
            href={actionHref}
            className="hidden items-center gap-0.5 text-[12px] leading-4 font-normal text-secondary underline underline-offset-2 md:flex"
          >
            {action}
            <ChevronRight size={14} className="text-secondary" />
          </a>
        )}
        {action != null && (
          <a
            href={actionHref}
            aria-label={action}
            title={action}
            className="flex size-7 shrink-0 items-center justify-center rounded-[4px] text-secondary outline-none hover:bg-[#f5f5f5] hover:text-primary focus-visible:ring-2 focus-visible:ring-[#CFC7BC] md:hidden"
          >
            <LinkExternal01 size={14} />
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
        { value: "active", label: "All active", count: MAP_PINS.length },
        { value: "staffed", label: "Staffed", count: STAFFED_PIN_COUNT },
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
      <div className="flex flex-col px-3 pb-3 md:h-[505px]">
        <div className="flex flex-col gap-3 pt-3 md:h-[470px]">
          <div className="flex items-center gap-3 sm:h-7">
            <div className="shrink-0">
              <MapTabs value={view} onChange={(next) => setView(next as "active" | "staffed")} />
            </div>
            {/* tablet/desktop: legend rides next to the tabs (mobile shows it at the bottom instead) */}
            <div className="ml-auto hidden shrink-0 items-center gap-3 md:flex">
              <Legend variant="square" color="#0d76f2" label="Staffed" />
              <Legend variant="square" color="#8b8175" label="In-progress" />
            </div>
          </div>
          {/* live map: Leaflet + free CARTO Positron raster tiles. `isolate`
              keeps the map's z-index stack from fighting the hover tooltip */}
          <div
            ref={mapFrame}
            role="group"
            aria-label={`Map of ${MAP_PINS.length} job sites across Colorado. Site list follows.`}
            className={cn(
              "relative isolate h-[414px] w-full overflow-hidden rounded-[6px] border-[0.5px] border-black/10 bg-[#f5f5f5]",
              ZOOM_CONTROL_CLASS,
            )}
          >
            <div ref={mapHost} className="h-full w-full" />
            {/* text alternative: the Leaflet pins are not exposed to assistive tech,
                so mirror the same data as a visually-hidden list */}
            <ul className="sr-only">
              {MAP_PINS.map((pin) => (
                <li key={pin.id}>
                  {pin.job} ({pin.id}), {PIN_STATUS_LABEL[pin.status]}, {pin.crew} crew
                </li>
              ))}
            </ul>
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
        {/* mobile: legend lives at the bottom (top row is tabs-only) */}
        <div className="mt-2 flex items-center gap-3 md:hidden">
          <Legend variant="square" color="#0d76f2" label="Staffed" />
          <Legend variant="square" color="#8b8175" label="In-progress" />
        </div>
        {/* tablet/desktop: original caption sits at the bottom, legend rides up top */}
        <p className="mt-2 hidden text-[11px] font-normal leading-[15px] text-secondary md:block">
          {MAP_PINS.length} of {TOTAL_ACTIVE_JOBS} active jobs mapped ({UNMAPPED_JOB_COUNT} have no mappable
          address). Hover a pin for details.
        </p>
      </div>
    </Panel>
  )
}

function BudgetKpi({ label, value, description }: (typeof BUDGET_KPIS)[number]) {
  return (
    <article className="flex h-[104px] min-w-0 flex-col justify-between rounded-[6px] border-[0.5px] border-black/10 bg-white p-3 sm:flex-1">
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

  useEffect(() => {
    if (tooltip == null) return

    function handleDocumentPointerDown(event: globalThis.PointerEvent) {
      if (event.pointerType !== "mouse") {
        setTooltip(null)
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown, true)
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown, true)
    }
  }, [tooltip])

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

  function handleSegmentPointerDown(event: PointerEvent<SVGPathElement>, item: BudgetLegendItem) {
    if (event.pointerType !== "mouse" && tooltip != null) {
      setTooltip(null)
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    handleSegmentPointerMove(event, item)
  }

  function handleSegmentPointerUp(event: PointerEvent<SVGPathElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function handleSegmentPointerCancel(event: PointerEvent<SVGPathElement>) {
    handleSegmentPointerUp(event)
    if (event.pointerType !== "mouse") setTooltip(null)
  }

  function handleSegmentPointerLeave(event: PointerEvent<SVGPathElement>) {
    if (event.pointerType === "mouse") setTooltip(null)
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
              style={{ touchAction: "none" }}
              onPointerDown={(event) => handleSegmentPointerDown(event, segment)}
              onPointerMove={(event) => handleSegmentPointerMove(event, segment)}
              onPointerUp={handleSegmentPointerUp}
              onPointerCancel={handleSegmentPointerCancel}
              onPointerLeave={handleSegmentPointerLeave}
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
    <OverlayScrollArea
      role="tabpanel"
      aria-label="Budget utilization"
      wrapperClassName="mt-[20px] min-h-0 flex-1"
      className="h-full"
      scrollbarRight={-7}
    >
      <div className="flex flex-col gap-[10px]">
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
      </OverlayScrollArea>
  )
}

function ForecastBudgetPanel() {
  const [view, setView] = useState<BudgetView>("status")

  return (
    <Panel title="Forecast to Budget">
      <div className="flex flex-col px-3 pb-3 md:h-[505px]">
        <div className="flex flex-col gap-3 pt-3 md:h-[466px]">
          <div className="flex flex-col gap-3 sm:h-[104px] sm:flex-row">
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
