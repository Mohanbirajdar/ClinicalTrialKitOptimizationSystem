"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewShipmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [selectedKit, setSelectedKit] = useState<any>(null);
  const [form, setForm] = useState({
    site_id: "", kit_id: "", quantity: 50,
    shipment_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "", tracking_number: "", notes: "",
  });

  useEffect(() => {
    fetch("/api/sites").then(r => r.json()).then(j => setSites(j.data || []));
    fetch("/api/kits?status=available").then(r => r.json()).then(j => setKits(j.data || []));
  }, []);

  const handleKitChange = (kitId: string) => {
    const kit = kits.find(k => k.id === kitId);
    setSelectedKit(kit);
    setForm(p => ({ ...p, kit_id: kitId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed");
      toast({ title: "Shipment created successfully" });
      router.push("/shipments");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Topbar title="New Shipment" />
      <div className="p-6 max-w-2xl">
        <Link href="/shipments" className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Shipments
        </Link>
        <Card>
          <CardHeader><CardTitle>Shipment Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Destination Site *</Label>
                  <Select required value={form.site_id} onValueChange={v => setForm(p => ({ ...p, site_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                    <SelectContent>
                      {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.site_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Kit Lot *</Label>
                  <Select required value={form.kit_id} onValueChange={handleKitChange}>
                    <SelectTrigger><SelectValue placeholder="Select kit" /></SelectTrigger>
                    <SelectContent>
                      {kits.map(k => (
                        <SelectItem key={k.id} value={k.id}>{k.kit_type} — {k.lot_number} ({k.quantity} avail)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedKit && (
                    <p className="text-xs text-muted-foreground">Available: {selectedKit.quantity} units · Expires: {selectedKit.expiry_date}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Quantity *</Label>
                  <Input required type="number" min={1} max={selectedKit?.quantity || 9999} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Shipment Date *</Label>
                  <Input required type="date" value={form.shipment_date} onChange={e => setForm(p => ({ ...p, shipment_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Expected Delivery</Label>
                  <Input type="date" value={form.expected_delivery_date} onChange={e => setForm(p => ({ ...p, expected_delivery_date: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tracking Number</Label>
                  <Input value={form.tracking_number} onChange={e => setForm(p => ({ ...p, tracking_number: e.target.value }))} placeholder="e.g. FED123456789" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Shipment"}</Button>
                <Link href="/shipments"><Button type="button" variant="outline">Cancel</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
