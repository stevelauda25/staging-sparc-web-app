// Shared project list used by the global "Search projects" field in the rail.
// Names mirror the jobs used across the dashboard panels so search feels real.

export type ProjectStatus = "In-Progress" | "At Risk" | "Planning" | "On Track"

export interface Project {
  id: string
  name: string
  status: ProjectStatus
}

export const PROJECTS: Project[] = [
  { id: "#25011", name: "Holly Hills Repl ES", status: "In-Progress" },
  { id: "#25012", name: "BVSD Fairview HS", status: "In-Progress" },
  { id: "#25013", name: "BVSD Critical Needs CTE", status: "At Risk" },
  { id: "#25014", name: "WIC HQ Expansion", status: "In-Progress" },
  { id: "#25015", name: "Titan Compark N. Bldg", status: "Planning" },
  { id: "#25016", name: "CCSD Academics Ph1", status: "In-Progress" },
  { id: "#25017", name: "Falcon Bldg B Mods", status: "At Risk" },
  { id: "#25018", name: "Clear Creek Crossing", status: "In-Progress" },
  { id: "#25019", name: "DCSD Legacy CIP", status: "On Track" },
  { id: "#25020", name: "Redstone HVAC Ph2", status: "In-Progress" },
  { id: "#25021", name: "Skyline MEP Upgrade", status: "Planning" },
  { id: "#25022", name: "Meadow View Sitework", status: "In-Progress" },
  { id: "#25023", name: "North Ridge ES Addition", status: "At Risk" },
  { id: "#25024", name: "Summit Lab Renovation", status: "On Track" },
  { id: "#25025", name: "Izzio ASI 5", status: "Planning" },
  { id: "#25026", name: "Boulder Creek Re-Roof", status: "On Track" },
  { id: "#25027", name: "Mapleton Admin TI", status: "In-Progress" },
  { id: "#25028", name: "Pine Grove Gym Lighting", status: "Planning" },
  { id: "#25029", name: "DCHS Security Vestibules", status: "In-Progress" },
  { id: "#25030", name: "Aurora Safety Vestibule", status: "At Risk" },
  { id: "#25031", name: "Carlton Workforce Yard", status: "On Track" },
  { id: "#25032", name: "Aspen Birch Chiller", status: "Planning" },
  { id: "#25033", name: "Poudre Admin Remodel", status: "In-Progress" },
  { id: "#25034", name: "Fossil Ridge Upgrade", status: "On Track" },
]

/** Case-insensitive substring match on the project name, capped to `limit`. */
export function searchProjects(query: string, limit = 6): Project[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return PROJECTS.filter((project) => project.name.toLowerCase().includes(q)).slice(0, limit)
}
