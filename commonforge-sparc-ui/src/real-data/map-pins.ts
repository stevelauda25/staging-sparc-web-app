// Real Job Map pins from local tenant_carltonelectric. GIT-IGNORED, local preview.
//
// Source: active In-Progress jobs with real lat/lng from the jobs table.
//  - status  = 'staffed' when the job has active crew assigned
//    (workers.current_job_number), otherwise 'in-progress'.
//  - crew    = count of active workers currently assigned to that job number.
//  - 85 of the 99 In-Progress jobs have coordinates; the other 14 have no mappable address.
export interface RealMapPin {
  label: string
  status: "staffed" | "in-progress"
  job: string
  id: string
  crew: number
  lat: number
  lng: number
}

export const REAL_TOTAL_ACTIVE_JOBS = 99

export const REAL_MAP_PINS: RealMapPin[] = [
  { label: "HH", status: "staffed", job: "Holly Hills Repl ES", id: "#25011", crew: 22, lat: 39.66339, lng: -104.91694 },
  { label: "BF", status: "staffed", job: "BVSD Fairview HS", id: "#25026", crew: 20, lat: 39.97295, lng: -105.24586 },
  { label: "AJ", status: "staffed", job: "Arrupe Jesuit HS", id: "#24031", crew: 10, lat: 39.77555, lng: -105.0455 },
  { label: "BC", status: "staffed", job: "BVSD Critical Needs CTE", id: "#24087", crew: 10, lat: 40.01246, lng: -105.2764 },
  { label: "MV", status: "staffed", job: "Mountain View Fire ST #15", id: "#24063", crew: 8, lat: 40.03561, lng: -105.07957 },
  { label: "RP", status: "staffed", job: "Roxborough Primary School", id: "#25063", crew: 8, lat: 39.47742, lng: -105.07647 },
  { label: "RI", status: "staffed", job: "Roxborough Intermediate", id: "#25062", crew: 7, lat: 39.46846, lng: -105.07106 },
  { label: "BS", status: "staffed", job: "BVSD Southern Hills MS", id: "#25027", crew: 6, lat: 39.97435, lng: -105.24526 },
  { label: "DL", status: "staffed", job: "DCSD Legacy Ph II", id: "#25033", crew: 6, lat: 39.5357, lng: -104.84415 },
  { label: "MV", status: "staffed", job: "Mountain View Fire W.Mead", id: "#25040", crew: 6, lat: 40.2005, lng: -105.00695 },
  { label: "MV", status: "staffed", job: "Mountain Vista HS", id: "#25060", crew: 6, lat: 39.52171, lng: -104.96546 },
  { label: "WH", status: "staffed", job: "WIC HQ Expansion", id: "#25051", crew: 6, lat: 39.81289, lng: -104.68537 },
  { label: "HR", status: "staffed", job: "Highlands Ranch HS Auto", id: "#25036", crew: 5, lat: 39.54445, lng: -104.93334 },
  { label: "A7", status: "staffed", job: "AERO 70", id: "#24084", crew: 4, lat: 39.74619, lng: -104.69238 },
  { label: "WS", status: "staffed", job: "WPS SHAW/FLYNN-Summer Wrk", id: "#26008", crew: 4, lat: 39.85568, lng: -105.03766 },
  { label: "DV", status: "staffed", job: "DPS Valdez Elem Sch Proj", id: "#25050", crew: 3, lat: 39.75903, lng: -105.01837 },
  { label: "P", status: "staffed", job: "Pre-Fab", id: "#RVT-38298", crew: 3, lat: 39.69328, lng: -104.99106 },
  { label: "DC", status: "staffed", job: "DCHS Cosmetology CTE", id: "#25035", crew: 2, lat: 39.38955, lng: -104.85671 },
  { label: "DB", status: "staffed", job: "DPS Bradley Mech Upgrades", id: "#25038", crew: 2, lat: 39.66388, lng: -104.93025 },
  { label: "SA", status: "staffed", job: "Signature Aviate APA Hang", id: "#25023", crew: 2, lat: 39.57942, lng: -104.84783 },
  { label: "TC", status: "staffed", job: "Titan Compark N. Bldg 1-2", id: "#26011", crew: 2, lat: 39.56214, lng: -104.8109 },
  { label: "AO", status: "staffed", job: "Academy of Charters Reno", id: "#25003", crew: 1, lat: 39.91157, lng: -105.03328 },
  { label: "C-", status: "staffed", job: "CCSD-CCHS - Academics Ph1", id: "#26007", crew: 1, lat: 39.62999, lng: -104.87903 },
  { label: "CC", status: "staffed", job: "Clear Creek Crossing", id: "#25045", crew: 1, lat: 39.7661, lng: -105.07721 },
  { label: "EP", status: "staffed", job: "Erie Police Dept Add Reno", id: "#25046", crew: 1, lat: 40.04461, lng: -105.05631 },
  { label: "2T", status: "in-progress", job: "27J Talon Ridge MS", id: "#24036", crew: 0, lat: 39.97208, lng: -104.92167 },
  { label: "AD", status: "in-progress", job: "ADCO Dining Conversion", id: "#25044", crew: 0, lat: 39.98998, lng: -104.79804 },
  { label: "AF", status: "in-progress", job: "APS Freezer-Warehouse Bld", id: "#25056", crew: 0, lat: 39.71827, lng: -104.79087 },
  { label: "A#", status: "in-progress", job: "Alta #6149", id: "#26016", crew: 0, lat: 40.47553, lng: -106.82577 },
  { label: "AW", status: "in-progress", job: "Altus Westminster", id: "#24088", crew: 0, lat: 39.89215, lng: -105.09371 },
  { label: "AB", status: "in-progress", job: "Aspen Birch Chiller", id: "#25021", crew: 0, lat: 39.71538, lng: -104.94728 },
  { label: "A", status: "in-progress", job: "Avient", id: "#25006", crew: 0, lat: 39.56474, lng: -104.82723 },
  { label: "BN", status: "in-progress", job: "Barber Nichols Building 1", id: "#26015", crew: 0, lat: 39.79814, lng: -105.06514 },
  { label: "BF", status: "in-progress", job: "Brighton Fire Training", id: "#24014", crew: 0, lat: 39.98637, lng: -104.79033 },
  { label: "C", status: "in-progress", job: "CEMCO", id: "#25054", crew: 0, lat: 39.86752, lng: -104.87319 },
  { label: "CP", status: "in-progress", job: "CEMCO Production Lighting", id: "#26014", crew: 0, lat: 39.86752, lng: -104.87319 },
  { label: "CB", status: "in-progress", job: "Catering by Design", id: "#26006", crew: 0, lat: 39.45058, lng: -104.73063 },
  { label: "CF", status: "in-progress", job: "Clinica Family Heath Reno", id: "#24029", crew: 0, lat: 39.82771, lng: -105.00747 },
  { label: "CP", status: "in-progress", job: "Colorado Premium Foods", id: "#25042", crew: 0, lat: 39.78958, lng: -104.96653 },
  { label: "CY", status: "in-progress", job: "Commerce Yards", id: "#26003", crew: 0, lat: 39.87066, lng: -104.87126 },
  { label: "CH", status: "in-progress", job: "Craig Hospital", id: "#26001", crew: 0, lat: 39.65425, lng: -104.97858 },
  { label: "DS", status: "in-progress", job: "DCHS Security Vestibules", id: "#25034", crew: 0, lat: 39.38955, lng: -104.85671 },
  { label: "DL", status: "in-progress", job: "DCSD Legacy CIP", id: "#25037", crew: 0, lat: 39.5357, lng: -104.84415 },
  { label: "DC", status: "in-progress", job: "DPS Central Kitchen", id: "#26009", crew: 0, lat: 39.77772, lng: -104.86371 },
  { label: "DS", status: "in-progress", job: "DPS Schmitt Elevator Reno", id: "#24011", crew: 0, lat: 39.68348, lng: -105.01244 },
  { label: "DA", status: "in-progress", job: "Denver Academy", id: "#26017", crew: 0, lat: 39.67406, lng: -104.93555 },
  { label: "DD", status: "in-progress", job: "Denver Dry Goods Elevator", id: "#25022", crew: 0, lat: 39.74492, lng: -104.99275 },
  { label: "DZ", status: "in-progress", job: "Denver Zoo Sea Lions", id: "#23050", crew: 0, lat: 39.7496, lng: -104.95078 },
  { label: "ES", status: "in-progress", job: "Everyday Store #5724", id: "#25052", crew: 0, lat: 38.8751, lng: -104.8266 },
  { label: "FB", status: "in-progress", job: "Falcon Bldg B Mods-ACCO", id: "#26004", crew: 0, lat: 39.05311, lng: -104.85507 },
  { label: "FC", status: "in-progress", job: "Falcon Comm Ctr Bldg A", id: "#24073", crew: 0, lat: 39.05145, lng: -104.85419 },
  { label: "FC", status: "in-progress", job: "Falcon Comm Ctr Bldg B", id: "#24074", crew: 0, lat: 39.05311, lng: -104.85507 },
  { label: "FC", status: "in-progress", job: "Flagler CO-Op Hugo", id: "#25053", crew: 0, lat: 39.13221, lng: -103.46255 },
  { label: "FP", status: "in-progress", job: "Forest Park Elevator", id: "#24056", crew: 0, lat: 39.70737, lng: -104.9263 },
  { label: "GR", status: "in-progress", job: "GWS Residential Office", id: "#26002", crew: 0, lat: 39.77229, lng: -104.96958 },
  { label: "GW", status: "in-progress", job: "Griswold WPF HVAC Repl", id: "#24032", crew: 0, lat: 39.65608, lng: -104.81973 },
  { label: "HL", status: "in-progress", job: "Hidden Lake Apt Elevator", id: "#25024", crew: 0, lat: 39.82067, lng: -105.03736 },
  { label: "IA", status: "in-progress", job: "Izzio ASI 5", id: "#25059", crew: 0, lat: 39.97146, lng: -104.98378 },
  { label: "IB", status: "in-progress", job: "Izzio Bakery - Thornton", id: "#25002", crew: 0, lat: 39.97146, lng: -104.98378 },
  { label: "IT", status: "in-progress", job: "Izzio Tavil Connections", id: "#25055", crew: 0, lat: 39.97146, lng: -104.98378 },
  { label: "KF", status: "in-progress", job: "Kaiser Franklin elevators", id: "#18039", crew: 0, lat: 39.74757, lng: -104.97091 },
  { label: "KS", status: "in-progress", job: "King Soopers Fuel #142", id: "#25041", crew: 0, lat: 39.96315, lng: -105.16709 },
  { label: "KS", status: "in-progress", job: "King Soopers Fuel #152", id: "#26012", crew: 0, lat: 39.51776, lng: -104.8439 },
  { label: "ML", status: "in-progress", job: "MSR Logistics Facility", id: "#26013", crew: 0, lat: 39.74807, lng: -104.41861 },
  { label: "MR", status: "in-progress", job: "Mountain Ridge MS", id: "#25061", crew: 0, lat: 39.52213, lng: -104.96258 },
  { label: "MU", status: "in-progress", job: "Murphy USA #23110", id: "#25048", crew: 0, lat: 39.41002, lng: -104.86074 },
  { label: "MU", status: "in-progress", job: "Murphy USA #7982", id: "#26018", crew: 0, lat: 38.81126, lng: -104.75696 },
  { label: "O", status: "in-progress", job: "Office", id: "#RVT-48892", crew: 0, lat: 39.69328, lng: -104.99106 },
  { label: "P2", status: "in-progress", job: "PH 2 Lookout Improvements", id: "#25047", crew: 0, lat: 39.76736, lng: -105.14538 },
  { label: "PC", status: "in-progress", job: "Picadilly Crossing", id: "#24077", crew: 0, lat: 39.72656, lng: -104.73973 },
  { label: "PV", status: "in-progress", job: "Poudre Valley CO-OP", id: "#25012", crew: 0, lat: 40.5828, lng: -104.7449 },
  { label: "PW", status: "in-progress", job: "Project Waterfall", id: "#25049", crew: 0, lat: 39.79111, lng: -104.70244 },
  { label: "RU", status: "in-progress", job: "RMMA UL Tank", id: "#25032", crew: 0, lat: 39.90963, lng: -105.11192 },
  { label: "SF", status: "in-progress", job: "Safeway Fuel #1877", id: "#26005", crew: 0, lat: 39.36422, lng: -104.86097 },
  { label: "SA", status: "in-progress", job: "Signature Aviation N.Bldg", id: "#25030", crew: 0, lat: 39.58083, lng: -104.84644 },
  { label: "SA", status: "in-progress", job: "Signature Aviation S.Bldg", id: "#25039", crew: 0, lat: 39.57013, lng: -104.84741 },
  { label: "SP", status: "in-progress", job: "Special Projects Template", id: "#SP", crew: 0, lat: 39.69328, lng: -104.99106 },
  { label: "S#", status: "in-progress", job: "Suncor #152", id: "#25058", crew: 0, lat: 39.7116, lng: -105.05373 },
  { label: "TC", status: "in-progress", job: "Thrive Castle Rock", id: "#25031", crew: 0, lat: 39.37558, lng: -104.86094 },
  { label: "UH", status: "in-progress", job: "UC Health Memorial Hosp.", id: "#26010", crew: 0, lat: 38.96704, lng: -104.75492 },
  { label: "WB", status: "in-progress", job: "WIC Blast Tunnel Exten.", id: "#25057", crew: 0, lat: 39.81521, lng: -104.68647 },
  { label: "WS", status: "in-progress", job: "WPS Shaw Heights MS", id: "#24006", crew: 0, lat: 39.85568, lng: -105.03766 },
  { label: "W7", status: "in-progress", job: "Weld 7 New Central Office", id: "#25007", crew: 0, lat: 40.39005, lng: -104.55502 },
  { label: "WF", status: "in-progress", job: "Wells Fargo Fire Pump", id: "#25043", crew: 0, lat: 39.65586, lng: -104.99058 },
  { label: "WF", status: "in-progress", job: "Windsor Fire Alarm Repl", id: "#24090", crew: 0, lat: 39.75081, lng: -104.99593 },
]
