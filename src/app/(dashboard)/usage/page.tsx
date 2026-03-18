export const dynamic = "force-dynamic";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ClipboardList } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getAllUsage } from "@/lib/data";

export default async function UsagePage() {
  const usage = await getAllUsage();
  const totalUsed = usage.reduce((a, u) => a + u.kits_used, 0);
  const totalWasted = usage.reduce((a, u) => a + u.kits_wasted, 0);
  const totalReturned = usage.reduce((a, u) => a + u.kits_returned, 0);

  return (
    <div>
      <Topbar title="Kit Usage" />
      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Total Used</p>
            <p className="text-3xl font-bold text-green-800">{totalUsed.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">Total Returned</p>
            <p className="text-3xl font-bold text-blue-800">{totalReturned.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium">Total Wasted</p>
            <p className="text-3xl font-bold text-red-800">{totalWasted.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Usage Records</h2>
            <p className="text-sm text-muted-foreground">{usage.length} records logged</p>
          </div>
          <Link href="/usage/new">
            <Button className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Log Usage</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead className="hidden sm:table-cell">Kit Type</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Used</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">Returned</TableHead>
                    <TableHead className="text-right">Wasted</TableHead>
                    <TableHead className="hidden md:table-cell">Patients</TableHead>
                    <TableHead className="hidden lg:table-cell">Reported By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground">No usage records yet.</p>
                        <Link href="/usage/new">
                          <Button variant="outline" size="sm" className="mt-3">Log First Usage</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    usage.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{(u as any).site?.site_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{(u as any).site?.location || ""}</p>
                          {/* Kit + date inline on mobile */}
                          <p className="text-xs text-muted-foreground sm:hidden truncate max-w-[140px]">{(u as any).kit?.kit_type || ""}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{formatDate(u.usage_date)}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{(u as any).kit?.kit_type || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{formatDate(u.usage_date)}</TableCell>
                        <TableCell className="text-right font-bold text-green-700">{u.kits_used}</TableCell>
                        <TableCell className="text-right text-blue-600 hidden sm:table-cell">{u.kits_returned}</TableCell>
                        <TableCell className="text-right">
                          <span className={u.kits_wasted > 0 ? "text-red-600 font-bold" : "text-muted-foreground"}>
                            {u.kits_wasted}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{u.patient_count ?? "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{u.reported_by || "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
