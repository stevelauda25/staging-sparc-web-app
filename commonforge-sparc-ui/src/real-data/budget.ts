// Real budget health from local tenant_carltonelectric. GIT-IGNORED, local preview.
// All figures are over the 115 active forecast jobs (In-Progress + 90/60% Win + Potentials),
// comparing projected-hours-at-completion vs labor-hours bid (dollar budgets are all zero in the dump).
//  - On track 20, Over budget 33, No data 62 (no bid or projection on file).
export const REAL_BUDGET = [
  { label: "On track", value: "20", percent: "(17%)", color: "#00a97f" },
  { label: "Over budget", value: "33", percent: "(29%)", color: "#e51d31" },
  { label: "No data", value: "62", percent: "(54%)", color: "#b8b8b8" },
]

export const REAL_BUDGET_KPIS = [
  { label: "Active jobs", value: "115", description: "Jobs in the forecast" },
  { label: "Staffed jobs", value: "28", description: "Jobs with crew assigned" },
  { label: "Jobs over budget", value: "33", description: "Jobs projected over bid" },
]

export const REAL_ACTIVE_TOTAL = 115
export const REAL_OVER_BUDGET = 33

export const REAL_BUDGET_UTILIZATION = [
  { job: "Izzio ASI 5", value: "546%", fill: 82.6 },
  { job: "Weld 7 New Central Office", value: "476%", fill: 75.0 },
  { job: "Denver Zoo Sea Lions", value: "233%", fill: 48.5 },
  { job: "DPS Schmitt Elevator Reno", value: "219%", fill: 47.0 },
  { job: "Falcon Bldg B Mods-ACCO", value: "200%", fill: 44.9 },
  { job: "Griswold WPF HVAC Repl", value: "180%", fill: 42.7 },
  { job: "Falcon Comm Ctr Bldg B", value: "175%", fill: 42.2 },
  { job: "Falcon Comm Ctr Bldg A", value: "170%", fill: 41.6 },
  { job: "BVSD Critical Needs CTE", value: "168%", fill: 41.4 },
  { job: "Brighton Fire Training", value: "159%", fill: 40.4 },
  { job: "Arrupe Jesuit HS", value: "149%", fill: 39.3 },
  { job: "Picadilly Crossing", value: "148%", fill: 39.2 },
  { job: "Clear Creek Crossing", value: "142%", fill: 38.6 },
  { job: "Aspen Birch Chiller", value: "136%", fill: 37.9 },
  { job: "Highlands Ranch HS Auto", value: "134%", fill: 37.7 },
  { job: "Holly Hills Repl ES", value: "131%", fill: 37.4 },
  { job: "Mountain View Fire ST #15", value: "130%", fill: 37.3 },
  { job: "WPS SHAW/FLYNN-Summer Wrk", value: "130%", fill: 37.3 },
  { job: "Clinica Family Heath Reno", value: "129%", fill: 37.2 },
  { job: "AERO 70", value: "128%", fill: 37.1 },
  { job: "Altus Westminster", value: "125%", fill: 36.7 },
  { job: "DCSD Legacy Ph II", value: "123%", fill: 36.5 },
  { job: "27J Talon Ridge MS", value: "122%", fill: 36.4 },
  { job: "DCHS Cosmetology CTE", value: "120%", fill: 36.2 },
  { job: "Izzio Bakery - Thornton", value: "119%", fill: 36.1 },
  { job: "WPS Shaw Heights MS", value: "116%", fill: 35.7 },
  { job: "Mountain View Fire W.Mead", value: "111%", fill: 35.2 },
  { job: "Academy of Charters Reno", value: "110%", fill: 35.1 },
  { job: "Mountain Vista HS", value: "107%", fill: 34.8 },
  { job: "Erie Police Dept Add Reno", value: "104%", fill: 34.4 },
  { job: "WIC HQ Expansion", value: "104%", fill: 34.4 },
  { job: "Signature Aviate APA Hang", value: "103%", fill: 34.3 },
  { job: "DPS Central Kitchen", value: "102%", fill: 34.2 },
]
