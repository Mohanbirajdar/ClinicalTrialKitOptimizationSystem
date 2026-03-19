"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Package, Trash2, TrendingUp, FlaskConical } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  FunnelChart, Funnel, LabelList,
} from "recharts";

type SponsorRow = {
  sponsor: string;
  trial_count: number;
  active_trials: number;
  site_count: number;
  enrolled_patients: number;
  kits_shipped: number;
  kits_used: number;
  kits_wasted: number;
  kits_returned: number;
  wastage_pct: number;
  trial_names: string[];
};

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899"];

function shortName(name: string) {
  return name.length > 18 ? name.slice(0, 16) + "…" : name;
}

export function SponsorAnalyticsView({ sponsors }: { sponsors: SponsorRow[] }) {
  const totalShipped = sponsors.reduce((a, s) => a + s.kits_shipped, 0);
  const totalWasted = sponsors.reduce((a, s) => a + s.kits_wasted, 0);
  const totalUsed = sponsors.reduce((a, s) => a + s.kits_used, 0);
  const overallWastagePct = totalShipped > 0 ? Math.round((totalWasted / totalShipped) * 1000) / 10 : 0;

  const topWaster = [...sponsors].sort((a, b) => b.wastage_pct - a.wastage_pct)[0];
  const topShipper = [...sponsors].sort((a, b) => b.kits_shipped - a.kits_shipped)[0];

  // Grouped bar chart — kits per sponsor
  const barData = sponsors.map((s) => ({
    name: shortName(s.sponsor),
    Shipped: s.kits_shipped,
    Used: s.kits_used,
    Wasted: s.kits_wasted,
    Returned: s.kits_returned,
  }));

  // Wastage % per sponsor
  const wastageBarData = [...sponsors]
    .sort((a, b) => b.wastage_pct - a.wastage_pct)
    .map((s) => ({ name: shortName(s.sponsor), "Wastage %": s.wastage_pct }));

  // Pie — kits shipped distribution across sponsors
  const shipPieData = sponsors.map((s) => ({ name: shortName(s.sponsor), value: s.kits_shipped }));

  // Radar — multi-metric comparison (top 5 sponsors)
  const radarSponsors = sponsors.slice(0, 5);
  const maxShipped = Math.max(...radarSponsors.map((s) => s.kits_shipped), 1);
  const maxEnrolled = Math.max(...radarSponsors.map((s) => s.enrolled_patients), 1);
  const maxSites = Math.max(...radarSponsors.map((s) => s.site_count), 1);
  const radarData = [
    { metric: "Kits Shipped", ...Object.fromEntries(radarSponsors.map((s) => [shortName(s.sponsor), Math.round((s.kits_shipped / maxShipped) * 100)])) },
    { metric: "Kits Used",    ...Object.fromEntries(radarSponsors.map((s) => [shortName(s.sponsor), s.kits_shipped > 0 ? Math.round((s.kits_used / s.kits_shipped) * 100) : 0])) },
    { metric: "Enrolled",     ...Object.fromEntries(radarSponsors.map((s) => [shortName(s.sponsor), Math.round((s.enrolled_patients / maxEnrolled) * 100)])) },
    { metric: "Sites",        ...Object.fromEntries(radarSponsors.map((s) => [shortName(s.sponsor), Math.round((s.site_count / maxSites) * 100)])) },
    { metric: "Low Wastage",  ...Object.fromEntries(radarSponsors.map((s) => [shortName(s.sponsor), Math.max(0, 100 - s.wastage_pct * 5)])) },
  ];

  return (
    <div className="space-y-4">
      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="h-4 w-4 text-blue-600" /></div>
            <div><p className="text-xs text-muted-foreground">Total Sponsors</p><p className="text-xl font-bold">{sponsors.length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Package className="h-4 w-4 text-blue-600" /></div>
            <div><p className="text-xs text-muted-foreground">Total Shipped</p><p className="text-xl font-bold">{totalShipped.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="h-4 w-4 text-green-600" /></div>
            <div><p className="text-xs text-muted-foreground">Total Used</p><p className="text-xl font-bold">{totalUsed.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-600" /></div>
            <div><p className="text-xs text-muted-foreground">Total Wasted</p><p className="text-xl font-bold">{totalWasted.toLocaleString()}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Highlight cards */}
      {sponsors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-orange-200 bg-orange-50/40">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-orange-700 mb-1">Highest Kit Wastage</p>
              <p className="font-bold text-sm">{topWaster?.sponsor}</p>
              <p className="text-2xl font-bold text-orange-600">{topWaster?.wastage_pct}%</p>
              <p className="text-xs text-muted-foreground">{topWaster?.kits_wasted} wasted of {topWaster?.kits_shipped} shipped</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/40">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-blue-700 mb-1">Highest Kit Usage</p>
              <p className="font-bold text-sm">{topShipper?.sponsor}</p>
              <p className="text-2xl font-bold text-blue-600">{topShipper?.kits_shipped.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">kits shipped across {topShipper?.trial_count} trial(s)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grouped bar — kits per sponsor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kits Shipped / Used / Wasted by Sponsor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="Shipped" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Used" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Wasted" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Returned" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wastage % per sponsor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Wastage Rate by Sponsor (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={wastageBarData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="Wastage %" radius={[3, 3, 0, 0]}>
                  {wastageBarData.map((entry, i) => (
                    <Cell key={i} fill={entry["Wastage %"] > 15 ? "#ef4444" : entry["Wastage %"] > 8 ? "#f59e0b" : "#22c55e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie — kit share by sponsor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kit Shipment Share by Sponsor</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={shipPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {shipPieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar — multi-metric sponsor comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sponsor Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                {radarSponsors.map((s, i) => (
                  <Radar
                    key={s.sponsor}
                    name={shortName(s.sponsor)}
                    dataKey={shortName(s.sponsor)}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    fillOpacity={0.15}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Sponsor-wise Kit Analytics
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              Overall wastage: <span className={overallWastagePct > 15 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>{overallWastagePct}%</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sponsor</TableHead>
                  <TableHead className="text-right">Trials</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Sites</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Enrolled</TableHead>
                  <TableHead className="text-right">Shipped</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Wasted</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Returned</TableHead>
                  <TableHead className="text-right">Wastage %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sponsors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No sponsor data available.</TableCell>
                  </TableRow>
                ) : sponsors.map((sp) => (
                  <TableRow key={sp.sponsor}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{sp.sponsor}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <FlaskConical className="h-3 w-3 mr-1" />{sp.active_trials} active
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 hidden md:block line-clamp-1">{sp.trial_names.join(" · ")}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">{sp.trial_count}</TableCell>
                    <TableCell className="text-right text-sm hidden sm:table-cell">{sp.site_count}</TableCell>
                    <TableCell className="text-right text-sm hidden md:table-cell">{sp.enrolled_patients}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{sp.kits_shipped.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{sp.kits_used.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm text-red-600 font-medium">{sp.kits_wasted.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm hidden sm:table-cell">{sp.kits_returned.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-sm font-bold ${sp.wastage_pct > 15 ? "text-red-600" : sp.wastage_pct > 8 ? "text-orange-500" : "text-green-600"}`}>
                          {sp.wastage_pct}%
                        </span>
                        {sp.wastage_pct > 15 && <span className="text-xs text-red-500">⚠</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
