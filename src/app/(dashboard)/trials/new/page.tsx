"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTrialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    trial_name: "", trial_phase: "", status: "planning",
    start_date: "", end_date: "", description: "", sponsor: "", protocol_number: "",
    drug_name: "", drug_dosage: "", drug_administration_route: "", drug_class: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to create trial");
      toast({ title: "Trial created successfully" });
      router.push("/trials");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar title="New Clinical Trial" />
      <div className="p-6 max-w-2xl">
        <Link href="/trials" className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Trials
        </Link>
        <Card>
          <CardHeader><CardTitle>Trial Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Trial Name *</Label>
                  <Input required value={form.trial_name} onChange={e => setForm(p => ({ ...p, trial_name: e.target.value }))} placeholder="e.g. AURORA Phase III Study" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phase *</Label>
                  <Select required value={form.trial_phase} onValueChange={v => setForm(p => ({ ...p, trial_phase: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
                    <SelectContent>
                      {["Phase I", "Phase II", "Phase III", "Phase IV"].map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["planning", "active", "completed", "suspended"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date *</Label>
                  <Input required type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sponsor</Label>
                  <Input value={form.sponsor} onChange={e => setForm(p => ({ ...p, sponsor: e.target.value }))} placeholder="e.g. Pharma Corp" />
                </div>
                <div className="space-y-1.5">
                  <Label>Protocol Number</Label>
                  <Input value={form.protocol_number} onChange={e => setForm(p => ({ ...p, protocol_number: e.target.value }))} placeholder="e.g. PCT-2024-001" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Drug Name</Label>
                  <Input value={form.drug_name} onChange={e => setForm(p => ({ ...p, drug_name: e.target.value }))} placeholder="e.g. Investigational Drug XYZ-101" />
                </div>
                <div className="space-y-1.5">
                  <Label>Drug Dosage</Label>
                  <Input value={form.drug_dosage} onChange={e => setForm(p => ({ ...p, drug_dosage: e.target.value }))} placeholder="e.g. 100mg twice daily" />
                </div>
                <div className="space-y-1.5">
                  <Label>Drug Class</Label>
                  <Input value={form.drug_class} onChange={e => setForm(p => ({ ...p, drug_class: e.target.value }))} placeholder="e.g. Monoclonal Antibody, Kinase Inhibitor" />
                </div>
                <div className="space-y-1.5">
                  <Label>Administration Route</Label>
                  <Select value={form.drug_administration_route} onValueChange={v => setForm(p => ({ ...p, drug_administration_route: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                    <SelectContent>
                      {["oral", "intravenous", "subcutaneous", "intramuscular", "topical", "inhalation"].map(r => (
                        <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Trial description..." rows={3} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Trial"}</Button>
                <Link href="/trials"><Button type="button" variant="outline">Cancel</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
