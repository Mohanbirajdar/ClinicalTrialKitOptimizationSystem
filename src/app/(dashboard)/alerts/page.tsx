"use client";
import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info, CheckCircle, RefreshCw, Bell } from "lucide-react";
import type { Alert } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-500", badge: "destructive" as const, row: "bg-red-50/40" },
  warning:  { icon: AlertTriangle, color: "text-amber-500", badge: "warning" as const, row: "bg-amber-50/30" },
  info:     { icon: Info, color: "text-blue-500", badge: "secondary" as const, row: "" },
};

const alertTypeLabels: Record<string, string> = {
  expiry_warning: "Expiry Warning",
  low_stock: "Low Stock",
  overstock: "Overstock",
  shipment_delayed: "Shipment Delayed",
  high_wastage: "High Wastage",
};

export default function AlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [scanning, setScanning] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const resolved = filter === "active" ? "false" : "";
      const url = resolved !== "" ? `/api/alerts?resolved=${resolved}` : "/api/alerts";
      const res = await fetch(url);
      const json = await res.json();
      setAlerts(json.data || []);
    } catch {
      toast({ title: "Failed to load alerts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/alerts/check", { method: "POST" });
      const json = await res.json();
      const count = json.data?.generated || 0;
      toast({
        title: "Alert scan complete",
        description: count > 0 ? `Generated ${count} new alert${count > 1 ? "s" : ""}.` : "No new alerts detected.",
      });
      fetchAlerts();
    } catch {
      toast({ title: "Scan failed", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const resolve = async (id: string) => {
    setResolving(id);
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error("Failed");
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Alert resolved" });
    } catch {
      toast({ title: "Failed to resolve alert", variant: "destructive" });
    } finally {
      setResolving(null);
    }
  };

  const critical = alerts.filter((a) => a.severity === "critical" && !a.is_resolved).length;
  const warning = alerts.filter((a) => a.severity === "warning" && !a.is_resolved).length;

  return (
    <div>
      <Topbar title="Alert Center" />
      <div className="p-4 md:p-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              <Button size="sm" variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>Active</Button>
              <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
            </div>
            {critical > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />{critical} Critical
              </Badge>
            )}
            {warning > 0 && (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />{warning} Warning
              </Badge>
            )}
          </div>
          <Button variant="outline" onClick={runScan} disabled={scanning} className="gap-2 w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning..." : "Run Alert Scan"}
          </Button>
        </div>

        {/* Alert Cards — mobile; Table — sm+ */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-14">
              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No {filter === "active" ? "active" : ""} alerts</p>
              <p className="text-sm text-muted-foreground mt-1">Run an alert scan to check for new issues.</p>
              <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={runScan} disabled={scanning}>
                <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} /> Run Scan Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="space-y-3 sm:hidden">
              {alerts.map((alert) => {
                const config = severityConfig[alert.severity ?? "info"] || severityConfig.info;
                const Icon = config.icon;
                return (
                  <Card key={alert.id} className={`border-l-4 ${alert.severity === "critical" ? "border-l-red-500" : alert.severity === "warning" ? "border-l-amber-500" : "border-l-blue-400"} ${alert.is_resolved ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                          <Badge variant="outline" className="text-xs font-normal">
                            {alertTypeLabels[alert.alert_type ?? "low_stock"] || alert.alert_type}
                          </Badge>
                          <Badge variant={config.badge} className="text-xs">{alert.severity}</Badge>
                        </div>
                        {alert.is_resolved ? (
                          <span className="text-xs text-green-600 flex items-center gap-1 shrink-0">
                            <CheckCircle className="h-3.5 w-3.5" /> Resolved
                          </span>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => resolve(alert.id)} disabled={resolving === alert.id} className="text-xs shrink-0 h-7 px-2">
                            {resolving === alert.id ? "..." : "Resolve"}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm leading-snug text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{formatDateTime(alert.created_at)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop: table */}
            <Card className="hidden sm:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="w-8 p-3" />
                        <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                        <th className="p-3 text-left font-medium text-muted-foreground">Severity</th>
                        <th className="p-3 text-left font-medium text-muted-foreground">Message</th>
                        <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Entity</th>
                        <th className="p-3 text-left font-medium text-muted-foreground hidden md:table-cell">Created</th>
                        <th className="p-3 text-right font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert) => {
                        const config = severityConfig[alert.severity ?? "info"] || severityConfig.info;
                        const Icon = config.icon;
                        return (
                          <tr key={alert.id} className={`border-b last:border-0 ${alert.is_resolved ? "opacity-60" : config.row}`}>
                            <td className="p-3">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs font-normal whitespace-nowrap">
                                {alertTypeLabels[alert.alert_type ?? "low_stock"] || alert.alert_type}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={config.badge} className="text-xs">{alert.severity}</Badge>
                            </td>
                            <td className="p-3 max-w-sm">
                              <p className="text-sm leading-snug">{alert.message}</p>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground capitalize hidden md:table-cell">
                              {alert.entity_type || "—"}
                            </td>
                            <td className="p-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">
                              {formatDateTime(alert.created_at)}
                            </td>
                            <td className="p-3 text-right">
                              {alert.is_resolved ? (
                                <span className="text-xs text-green-600 flex items-center justify-end gap-1">
                                  <CheckCircle className="h-3.5 w-3.5" /> Resolved
                                </span>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => resolve(alert.id)} disabled={resolving === alert.id} className="gap-1 text-xs">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  {resolving === alert.id ? "..." : "Resolve"}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
