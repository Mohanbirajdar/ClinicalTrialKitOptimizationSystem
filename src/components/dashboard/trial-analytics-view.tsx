"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, Users, Package, Trash2, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
} from "recharts";

type TrialRow = {
  id: string;
  trial_name: string;
  trial_phase: string;
  status: string | null;
  sponsor: string | null;
  drug_name: string | null;
  drug_class: string | null;
  site_count: number;
  active_sites: number;
  enrolled_patients: number;
  patient_capacity: number;
  kits_shipped: number;
  kits_used: number;
  kits_wasted: number;
  kits_returned: number;
  wastage_pct: number;
};

const STATUS_COLORS: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success", planning: "warning", suspended: "destructive", completed: "secondary",
};
const PHASE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  "Phase I": "outline", "Phase II": "secondary", "Phase III": "default", "Phase IV": "secondary",
};

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899"];

function shortName(name: string) {
  return name.length > 16 ? name.slice(0, 14) + "…" : name;
}

export function TrialAnalyticsView({ trials }: { trials: TrialRow[] }) {
  const totalShipped = trials.reduce((a, t) => a + t.kits_shipped, 0);
  const totalWasted = trials.reduce((a, t) => a + t.kits_wasted, 0);
  const totalUsed = trials.reduce((a, t) => a + t.kits_used, 0);
  const totalEnrolled = trials.reduce((a, t) => a + t.enrolled_patients, 0);
  const overallWastagePct = totalShipped > 0 ? Math.round((totalWasted / totalShipped) * 1000) / 10 : 0;

  // Bar chart data — kits per trial
  const barData = trials.map((t) => ({
    name: shortName(t.trial_name),
    Shipped: t.kits_shipped,
    Used: t.kits_used,
    Wasted: t.kits_wasted,
  }));

  // Wastage % bar chart
  const wastageBarData = [...trials]
    .sort((a, b) => b.wastage_pct - a.wastage_pct)
    .map((t) => ({ name: shortName(t.trial_name), "Wastage %": t.wastage_pct }));

  // Phase distribution pie
  const phaseMap: Record<string, number> = {};
  for (const t of trials) phaseMap[t.trial_phase] = (phaseMap[t.trial_phase] || 0) + 1;
  const phasePieData = Object.entries(phaseMap).map(([name, value]) => ({ name, value }));

  // Enrollment vs capacity radar (top 6 trials)
  const radarData = trials.slice(0, 6).map((t) => ({
    trial: shortName(t.trial_name),
    Enrolled: t.enrolled_patients,
    Capacity: t.patient_capacity,
  }));

  return (
    <div className="space-y-4">
      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Users className="h-4 w-4 text-purple-600" /></div>
            <div><p className="text-xs text-muted-foreground">Enrolled Patients</p><p className="text-xl font-bold">{totalEnrolled.toLocaleString()}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kits per trial grouped bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kits Shipped / Used / Wasted by Trial</CardTitle>
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wastage % per trial */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Wastage Rate by Trial (%)</CardTitle>
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
                    <Cell
                      key={i}
                      fill={entry["Wastage %"] > 15 ? "#ef4444" : entry["Wastage %"] > 8 ? "#f59e0b" : "#22c55e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phase distribution pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trials by Phase</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={phasePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={true}
                >
                  {phasePieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enrollment vs capacity radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Enrollment vs Capacity (Top Trials)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="trial" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar name="Enrolled" dataKey="Enrolled" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Capacity" dataKey="Capacity" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Legend />
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
            <FlaskConical className="h-4 w-4" /> Trial-wise Kit Analytics
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
                  <TableHead>Trial</TableHead>
                  <TableHead>Phase / Status</TableHead>
                  <TableHead className="hidden md:table-cell">Drug</TableHead>
                  <TableHead className="text-right">Sites</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Enrolled</TableHead>
                  <TableHead className="text-right">Shipped</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Wasted</TableHead>
                  <TableHead className="text-right">Wastage %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No trial data available.</TableCell>
                  </TableRow>
                ) : trials.map((trial) => (
                  <TableRow key={trial.id}>
                    <TableCell>
                      <Link href={`/trials/${trial.id}`} className="hover:underline">
                        <p className="font-medium text-sm">{trial.trial_name}</p>
                        {trial.sponsor && <p className="text-xs text-muted-foreground">{trial.sponsor}</p>}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={PHASE_COLORS[trial.trial_phase] ?? "outline"} className="text-xs w-fit">{trial.trial_phase}</Badge>
                        <Badge variant={STATUS_COLORS[trial.status ?? "planning"] ?? "secondary"} className="text-xs w-fit capitalize">{trial.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {trial.drug_name ? (
                        <div>
                          <p className="font-medium text-xs">{trial.drug_name}</p>
                          {trial.drug_class && <p className="text-xs text-muted-foreground">{trial.drug_class}</p>}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span className="font-medium">{trial.active_sites}</span>
                      <span className="text-muted-foreground">/{trial.site_count}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm hidden sm:table-cell">
                      {trial.enrolled_patients}
                      {trial.patient_capacity > 0 && <span className="text-xs text-muted-foreground ml-1">/ {trial.patient_capacity}</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">{trial.kits_shipped.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">{trial.kits_used.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm text-red-600">{trial.kits_wasted.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold ${trial.wastage_pct > 15 ? "text-red-600" : trial.wastage_pct > 8 ? "text-orange-500" : "text-green-600"}`}>
                        {trial.wastage_pct}%
                      </span>
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
