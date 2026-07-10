import { AppShell } from "@/components/app-shell"
import { DashboardForecastChart } from "@/components/dashboard-forecast-chart"
import { DashboardFrame } from "@/components/dashboard-frame"
import { DashboardJobsInsights } from "@/components/dashboard-jobs-insights"
import { DashboardKpiGroup } from "@/components/dashboard-kpis"
import { DashboardMapBudget } from "@/components/dashboard-map-budget"
import { DashboardSkillsInsights } from "@/components/dashboard-skills-insights"
import { Showcase } from "./showcase/Showcase"

export default function App() {
  // The dashboard is the primary view. The component library is still
  // reachable for reference at #showcase (reload after changing the hash).
  const isShowcase = typeof window !== "undefined" && window.location.hash === "#showcase"

  if (isShowcase) return <Showcase />

  return (
    <AppShell>
      <DashboardFrame>
        <div className="flex flex-col gap-3 p-3">
          <DashboardKpiGroup />
          {/* the chart is still authored at its own (Figma 12px) scale for now */}
          <DashboardForecastChart />
          <DashboardJobsInsights />
          <DashboardMapBudget />
          <DashboardSkillsInsights />
        </div>
      </DashboardFrame>
    </AppShell>
  )
}
