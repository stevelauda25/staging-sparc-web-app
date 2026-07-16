// Real skills metrics from local tenant_carltonelectric. GIT-IGNORED, local preview.
//
// Sources (skill_assessments / skills / skill_categories / workers, active only):
//  - Avg. skill level    = AVG(assessment_value) over all 2,427 assessments = 2.85
//  - Verified skills      = share with is_validated = true (1,924 / 2,427) = 79%
//  - Never assessed       = active workers with zero assessment rows = 101 of 213
//  - Worker missing skills= active workers with at least one 0-rated skill (a gap) = 71
//  - Bottom 3             = lowest AVG(assessment_value) per skill, split by category.
//    Trade = electrical categories (Fire Alarm, Distribution, Devices, ...).
//    Professional = Field Leadership + Core Behaviors. "Growth Mindset" is excluded
//    because every rating is 0 with no rating scale defined (unconfigured, not a real gap).
export const REAL_SKILLS = {
  kpis: [
    { label: "Worker missing skills", value: "71", description: "Workers missing a skill" },
    { label: "Avg. skill level", value: "2.9", description: "Average rating, 0 to 5" },
    { label: "Verified skills", value: "79%", description: "Share of skills verified" },
    { label: "Never assessed", value: "101", description: "Workers with no records" },
  ],
  trade: [
    { name: "Fire Alarm", value: 1.68 },
    { name: "Distribution Gear", value: 2.03 },
    { name: "Lighting Control Systems", value: 2.17 },
  ],
  professional: [
    { name: "Project Leadership Experience", value: 2.45 },
    { name: "Print Reading", value: 2.67 },
    { name: "Labor Productivity & Tracking", value: 2.79 },
  ],
}
