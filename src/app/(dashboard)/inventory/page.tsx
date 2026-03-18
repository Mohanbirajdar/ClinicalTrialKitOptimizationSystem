export const dynamic = "force-dynamic";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertTriangle, Package } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency, getExpiryStatus } from "@/lib/utils";
import { getAllKits } from "@/lib/data";

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  available: "success",
  low_stock: "warning",
  expired: "destructive",
  depleted: "secondary",
};

export default async function InventoryPage() {
  const kits = await getAllKits();
  const totalUnits = kits.reduce((a, k) => a + k.quantity, 0);
  const expiringCount = kits.filter(k => {
    const days = Math.floor((new Date(k.expiry_date).getTime() - Date.now()) / 86400000);
    return days <= 30 && days >= 0;
  }).length;

  return (
    <div>
      <Topbar title="Kit Inventory" />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold">Specimen Kit Inventory</h2>
            <p className="text-sm text-muted-foreground">{kits.length} lots · {totalUnits.toLocaleString()} total units</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/inventory/expiring">
              <Button variant="outline" className="w-full sm:w-auto text-amber-600 border-amber-300">
                <AlertTriangle className="h-4 w-4 mr-1" /> Expiring ({expiringCount})
              </Button>
            </Link>
            <Link href="/inventory/new">
              <Button className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Add Kit Lot</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kit Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Lot Number</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Expiry Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Days Left</TableHead>
                    <TableHead className="hidden lg:table-cell">Unit Cost</TableHead>
                    <TableHead className="hidden lg:table-cell">Storage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground">No kits in inventory. Add your first kit lot.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    kits.map(kit => {
                      const expiry = getExpiryStatus(kit.expiry_date);
                      return (
                        <TableRow key={kit.id} className={expiry.urgent ? "bg-red-50/50" : ""}>
                          <TableCell>
                            <p className="font-medium text-sm">{kit.kit_type}</p>
                            {/* Lot number shown inline on mobile */}
                            <p className="text-xs text-muted-foreground font-mono sm:hidden">{kit.lot_number}</p>
                            {/* Expiry shown inline on mobile */}
                            <p className="text-xs text-muted-foreground md:hidden">{formatDate(kit.expiry_date)}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-xs">{kit.lot_number}</TableCell>
                          <TableCell>
                            <span className={kit.quantity < 10 ? "text-red-600 font-bold" : "font-medium"}>{kit.quantity}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusColors[kit.status ?? "available"] || "secondary"} className="text-xs whitespace-nowrap">
                              {(kit.status ?? "available").replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{formatDate(kit.expiry_date)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={expiry.variant} className="text-xs">{expiry.label}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">{formatCurrency(kit.unit_cost)}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[160px] truncate">
                            {kit.storage_requirements || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
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
