export const dynamic = "force-dynamic";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getAllSites } from "@/lib/data";

export default async function SitesPage() {
  const sites = await getAllSites();

  return (
    <div>
      <Topbar title="Research Sites" />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold">All Sites</h2>
            <p className="text-sm text-muted-foreground">{sites.length} total sites</p>
          </div>
          <Link href="/sites/new">
            <Button className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> Register Site</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead className="hidden sm:table-cell">Trial</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Country</TableHead>
                    <TableHead className="hidden sm:table-cell">Enrolled / Capacity</TableHead>
                    <TableHead className="hidden lg:table-cell">Samples/Patient</TableHead>
                    <TableHead className="hidden lg:table-cell">Activation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground">No sites registered yet.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sites.map(site => (
                      <TableRow key={site.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{site.site_name}</p>
                            <p className="text-xs text-muted-foreground">{site.location}</p>
                            {/* Country inline on mobile */}
                            <p className="text-xs text-muted-foreground md:hidden">{site.country}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm max-w-[140px]">
                          <p className="truncate">{(site as any).trial?.trial_name || "—"}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={site.status === "active" ? "success" : site.status === "closed" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {site.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{site.country}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="text-sm whitespace-nowrap">{site.enrolled_patients} / {site.patient_capacity}</span>
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full shrink-0">
                              <div
                                className="h-1.5 bg-primary rounded-full"
                                style={{ width: `${Math.min(100, ((site.enrolled_patients ?? 0) / site.patient_capacity) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{site.samples_per_patient}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">{formatDate(site.activation_date)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/sites/${site.id}`}>
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          </Link>
                        </TableCell>
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
