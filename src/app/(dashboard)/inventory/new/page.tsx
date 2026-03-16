"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewKitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    kit_type: "", lot_number: "", manufacturing_date: "",
    expiry_date: "", quantity: 100, unit_cost: "",
    storage_requirements: "", status: "available",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed");
      toast({ title: "Kit lot added successfully" });
      router.push("/inventory");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar title="Add Kit Lot" />
      <div className="p-6 max-w-2xl">
        <Link href="/inventory" className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>
        <Card>
          <CardHeader><CardTitle>Kit Lot Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Kit Type *</Label>
                  <Input required value={form.kit_type} onChange={e => setForm(p => ({ ...p, kit_type: e.target.value }))} placeholder="e.g. Blood Draw Kit" />
                </div>
                <div className="space-y-1.5">
                  <Label>Lot Number *</Label>
                  <Input required value={form.lot_number} onChange={e => setForm(p => ({ ...p, lot_number: e.target.value }))} placeholder="e.g. LOT-2024-001" />
                </div>
                <div className="space-y-1.5">
                  <Label>Manufacturing Date *</Label>
                  <Input required type="date" value={form.manufacturing_date} onChange={e => setForm(p => ({ ...p, manufacturing_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiry Date *</Label>
                  <Input required type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Quantity *</Label>
                  <Input required type="number" min={0} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit Cost ($)</Label>
                  <Input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm(p => ({ ...p, unit_cost: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Storage Requirements</Label>
                  <Input value={form.storage_requirements} onChange={e => setForm(p => ({ ...p, storage_requirements: e.target.value }))} placeholder="e.g. 2-8°C, refrigerated" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Kit Lot"}</Button>
                <Link href="/inventory"><Button type="button" variant="outline">Cancel</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
