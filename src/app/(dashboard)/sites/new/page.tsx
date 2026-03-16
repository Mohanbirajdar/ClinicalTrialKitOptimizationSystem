"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trials, setTrials] = useState<any[]>([]);
  const [form, setForm] = useState({
    trial_id: searchParams.get("trial_id") || "",
    site_name: "", location: "", country: "",
    activation_date: "", patient_capacity: 50,
    enrolled_patients: 0, samples_per_patient: 3,
    coordinator_name: "", coordinator_email: "", status: "pending",
  });

  useEffect(() => {
    fetch("/api/trials").then(r => r.json()).then(j => setTrials(j.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, patient_capacity: Number(form.patient_capacity), enrolled_patients: Number(form.enrolled_patients), samples_per_patient: Number(form.samples_per_patient) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed");
      toast({ title: "Site registered successfully" });
      router.push("/sites");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar title="Register New Site" />
      <div className="p-6 max-w-2xl">
        <Link href="/sites" className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Sites
        </Link>
        <Card>
          <CardHeader><CardTitle>Site Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Clinical Trial *</Label>
                  <Select required value={form.trial_id} onValueChange={v => setForm(p => ({ ...p, trial_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select trial" /></SelectTrigger>
                    <SelectContent>
                      {trials.map(t => <SelectItem key={t.id} value={t.id}>{t.trial_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Site Name *</Label>
                  <Input required value={form.site_name} onChange={e => setForm(p => ({ ...p, site_name: e.target.value }))} placeholder="e.g. Boston Medical Center" />
                </div>
                <div className="space-y-1.5">
                  <Label>Location *</Label>
                  <Input required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="City, State" />
                </div>
                <div className="space-y-1.5">
                  <Label>Country *</Label>
                  <Input required value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="e.g. USA" />
                </div>
                <div className="space-y-1.5">
                  <Label>Activation Date *</Label>
                  <Input required type="date" value={form.activation_date} onChange={e => setForm(p => ({ ...p, activation_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending", "active", "closed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Patient Capacity *</Label>
                  <Input required type="number" min={1} value={form.patient_capacity} onChange={e => setForm(p => ({ ...p, patient_capacity: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Enrolled Patients</Label>
                  <Input type="number" min={0} value={form.enrolled_patients} onChange={e => setForm(p => ({ ...p, enrolled_patients: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Samples per Patient</Label>
                  <Input type="number" min={1} value={form.samples_per_patient} onChange={e => setForm(p => ({ ...p, samples_per_patient: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Coordinator Name</Label>
                  <Input value={form.coordinator_name} onChange={e => setForm(p => ({ ...p, coordinator_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Coordinator Email</Label>
                  <Input type="email" value={form.coordinator_email} onChange={e => setForm(p => ({ ...p, coordinator_email: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>{loading ? "Registering..." : "Register Site"}</Button>
                <Link href="/sites"><Button type="button" variant="outline">Cancel</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
