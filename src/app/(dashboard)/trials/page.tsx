export const dynamic = "force-dynamic";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, FlaskConical } from "lucide-react";
import Link from "next/link";
import { getAllTrials } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const phaseColors: Record<string, "default" | "secondary" | "outline"> = {
  "Phase I": "outline",
  "Phase II": "secondary",
  "Phase III": "default",
  "Phase IV": "secondary",
};

const statusColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  planning: "warning",
  completed: "secondary",
  suspended: "destructive",
};

export default async function TrialsPage() {
  const trials = await getAllTrials();

  return (
    <div>
      <Topbar title="Clinical Trials" />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold">All Trials</h2>
            <p className="text-sm text-muted-foreground">{trials.length} total trials</p>
          </div>
          <Link href="/trials/new">
            <Button className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> New Trial</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trial Name</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Sponsor</TableHead>
                    <TableHead className="hidden sm:table-cell">Start Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Sites</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <FlaskConical className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground">No trials yet. Create your first trial.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    trials.map((trial) => (
                      <TableRow key={trial.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{trial.trial_name}</p>
                            {trial.protocol_number && (
                              <p className="text-xs text-muted-foreground">{trial.protocol_number}</p>
                            )}
                            {(trial as any).drug_class && (
                              <p className="text-xs text-muted-foreground hidden sm:block">💊 {(trial as any).drug_class}</p>
                            )}
                            {/* Show sponsor inline on mobile */}
                            <p className="text-xs text-muted-foreground md:hidden mt-0.5">{trial.sponsor || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={phaseColors[trial.trial_phase] || "outline"} className="whitespace-nowrap text-xs">
                            {trial.trial_phase}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[trial.status ?? "planning"] || "secondary"} className="text-xs">
                            {trial.status ?? "planning"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{trial.sponsor || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{formatDate(trial.start_date)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{(trial as any).sites?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/trials/${trial.id}`}>
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
