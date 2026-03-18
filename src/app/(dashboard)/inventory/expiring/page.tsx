export const dynamic = "force-dynamic";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { formatDate, getExpiryStatus } from "@/lib/utils";
import { getExpiringKits } from "@/lib/data";

export default async function ExpiringKitsPage() {
  const data = await getExpiringKits(60);
  const { grouped } = data;

  return (
    <div>
      <Topbar title="Expiring Kits" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {[
            { title: "Expired", kits: grouped.expired, color: "border-red-300 bg-red-50" },
            { title: "Expiring within 30 days", kits: grouped.within_30, color: "border-orange-300 bg-orange-50" },
            { title: "Expiring in 30-60 days", kits: grouped.within_60, color: "border-amber-300 bg-amber-50" },
          ].map(({ title, kits, color }) => (
            <Card key={title} className={`border-2 ${color}`}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{kits.length}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {kits.reduce((a: number, k: any) => a + k.quantity, 0)} units at risk
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {[
          { title: "Expired Kits", kits: grouped.expired, variant: "destructive" as const },
          { title: "Expiring within 30 days", kits: grouped.within_30, variant: "destructive" as const },
          { title: "Expiring in 30-60 days", kits: grouped.within_60, variant: "warning" as const },
        ].map(({ title, kits, variant }) => kits.length > 0 && (
          <Card key={title}>
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <CardTitle className="text-base">{title} ({kits.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kit Type</TableHead>
                      <TableHead className="hidden sm:table-cell">Lot Number</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="hidden sm:table-cell">Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(kits as any[]).map((kit: any) => {
                      const expiry = getExpiryStatus(kit.expiry_date);
                      return (
                        <TableRow key={kit.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{kit.kit_type}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{formatDate(kit.expiry_date)}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-sm">{kit.lot_number}</TableCell>
                          <TableCell className="font-bold text-red-600">{kit.quantity}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{formatDate(kit.expiry_date)}</TableCell>
                          <TableCell>
                            <Badge variant={expiry.variant} className="text-xs">{expiry.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
