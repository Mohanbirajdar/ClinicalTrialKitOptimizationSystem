"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calculator } from "lucide-react";
import Link from "next/link";

export default function NewUsagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [form, setForm] = useState({
    site_id: "",
    kit_id: "",
    kits_used: 0,
    kits_returned: 0,
    kits_wasted: 0,
    usage_date: new Date().toISOString().split("T")[0],
    patient_count: 0,
    notes: "",
    reported_by: "",
  });

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((j) => setSites(j.data || []));
    fetch("/api/kits")
      .then((r) => r.json())
      .then((j) => setKits(j.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.site_id === "" || form.kit_id === "") {
      toast({ title: "Please select a site and kit", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          kits_used: Number(form.kits_used),
          kits_returned: Number(form.kits_returned),
          kits_wasted: Number(form.kits_wasted),
          patient_count: Number(form.patient_count),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to log usage");
      toast({ title: "Usage logged successfully" });
      router.push("/usage");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const netConsumption =
    Number(form.kits_used) - Number(form.kits_returned) - Number(form.kits_wasted);

  return (
    <div>
      <Topbar title="Log Kit Usage" />
      <div className="p-6 max-w-2xl">
        <Link
          href="/usage"
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Usage
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Usage Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Site */}
                <div className="space-y-1.5">
                  <Label>Site *</Label>
                  <Select
                    required
                    value={form.site_id}
                    onValueChange={(v) => setForm((p) => ({ ...p, site_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.site_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Kit */}
                <div className="space-y-1.5">
                  <Label>Kit *</Label>
                  <Select
                    required
                    value={form.kit_id}
                    onValueChange={(v) => setForm((p) => ({ ...p, kit_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select kit" />
                    </SelectTrigger>
                    <SelectContent>
                      {kits.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.kit_type} — {k.lot_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label>Usage Date *</Label>
                  <Input
                    required
                    type="date"
                    value={form.usage_date}
                    onChange={(e) => setForm((p) => ({ ...p, usage_date: e.target.value }))}
                  />
                </div>

                {/* Patients */}
                <div className="space-y-1.5">
                  <Label>Patients Seen</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.patient_count}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, patient_count: Number(e.target.value) }))
                    }
                  />
                </div>

                {/* Kits Used */}
                <div className="space-y-1.5">
                  <Label>Kits Used *</Label>
                  <Input
                    required
                    type="number"
                    min={0}
                    value={form.kits_used}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, kits_used: Number(e.target.value) }))
                    }
                  />
                </div>

                {/* Kits Returned */}
                <div className="space-y-1.5">
                  <Label>Kits Returned</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.kits_returned}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, kits_returned: Number(e.target.value) }))
                    }
                  />
                </div>

                {/* Kits Wasted */}
                <div className="space-y-1.5">
                  <Label>Kits Wasted</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.kits_wasted}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, kits_wasted: Number(e.target.value) }))
                    }
                  />
                </div>

                {/* Reported By */}
                <div className="space-y-1.5">
                  <Label>Reported By</Label>
                  <Input
                    value={form.reported_by}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reported_by: e.target.value }))
                    }
                    placeholder="Your name"
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2 space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    placeholder="Any observations or remarks..."
                  />
                </div>
              </div>

              {/* Summary */}
              {(form.kits_used > 0 || form.kits_returned > 0 || form.kits_wasted > 0) && (
                <div className="bg-slate-50 border rounded-lg p-4 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Net consumption:{" "}
                    <strong className={netConsumption < 0 ? "text-red-600" : "text-green-700"}>
                      {netConsumption} kits
                    </strong>
                    {" "}({form.kits_used} used − {form.kits_returned} returned − {form.kits_wasted} wasted)
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging..." : "Log Usage"}
                </Button>
                <Link href="/usage">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
