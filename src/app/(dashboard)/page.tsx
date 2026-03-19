export const dynamic = "force-dynamic";
import { Topbar } from "@/components/layout/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { WastageChart } from "@/components/dashboard/wastage-chart";
import { ExpiryHeatmap } from "@/components/dashboard/expiry-heatmap";
import { AlertFeed } from "@/components/dashboard/alert-feed";
import { SiteUsageTable } from "@/components/dashboard/site-usage-table";
import { TrialAnalyticsView } from "@/components/dashboard/trial-analytics-view";
import { SponsorAnalyticsView } from "@/components/dashboard/sponsor-analytics-view";
import { getDashboardSummary, getTrialAnalytics, getSponsorAnalytics } from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "trials", label: "Trials" },
  { key: "sponsors", label: "Sponsors" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = (searchParams.tab ?? "overview") as Tab;

  const data = await getDashboardSummary();
  const trialData = tab === "trials" ? await getTrialAnalytics() : null;
  const sponsorData = tab === "sponsors" ? await getSponsorAnalytics() : null;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">

        {/* Tab Bar */}
        <div className="flex gap-1 border-b pb-0">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/?tab=${t.key}`}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-md border border-b-0 transition-colors",
                tab === t.key
                  ? "bg-background text-foreground border-border -mb-px"
                  : "bg-muted/40 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/70"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                {data.active_trials} Active Trials
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                {data.active_sites} Active Sites
              </span>
              <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                {data.kits_expiring_30} Kits Expiring in 30 Days
              </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <KpiCard
                title="Total Kits Shipped"
                value={data.total_shipped.toLocaleString()}
                trend={data.shipped_trend}
                icon="package"
              />
              <KpiCard
                title="Kits Used"
                value={data.total_used.toLocaleString()}
                trend={data.used_trend}
                icon="check-circle"
                variant="success"
              />
              <KpiCard
                title="Kits Wasted"
                value={data.total_wasted.toLocaleString()}
                trend={data.wastage_trend}
                icon="trash-2"
                variant="danger"
              />
              <KpiCard
                title="Wastage Rate"
                value={`${data.wastage_pct}%`}
                trend={data.wastage_pct_trend}
                icon="percent"
                variant={data.wastage_pct > 15 ? "danger" : data.wastage_pct > 8 ? "warning" : "success"}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WastageChart data={data.monthly_wastage} />
              <ExpiryHeatmap data={data.expiry_buckets} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SiteUsageTable sites={data.site_usage} />
              </div>
              <AlertFeed alerts={data.recent_alerts} />
            </div>
          </>
        )}

        {/* ── TRIALS TAB ── */}
        {tab === "trials" && trialData && (
          <TrialAnalyticsView trials={trialData} />
        )}

        {/* ── SPONSORS TAB ── */}
        {tab === "sponsors" && sponsorData && (
          <SponsorAnalyticsView sponsors={sponsorData} />
        )}

      </div>
    </div>
  );
}
