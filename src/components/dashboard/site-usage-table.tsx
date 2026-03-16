import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SiteUsageSummary } from "@/types";

export function SiteUsageTable({ sites }: { sites: SiteUsageSummary[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Site-wise Kit Usage</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead className="text-right">Shipped</TableHead>
              <TableHead className="text-right">Used</TableHead>
              <TableHead className="text-right">Wasted</TableHead>
              <TableHead className="text-right">Wastage%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No data available</TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.site_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{site.site_name}</p>
                      <p className="text-xs text-muted-foreground">{site.location}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{site.kits_shipped}</TableCell>
                  <TableCell className="text-right">{site.kits_used}</TableCell>
                  <TableCell className="text-right">{site.kits_wasted}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={site.wastage_pct > 20 ? "destructive" : site.wastage_pct > 10 ? "warning" : "success"}>
                      {site.wastage_pct}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
