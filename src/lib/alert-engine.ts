import { db } from "@/db";
import { kits, alerts } from "@/db/schema";
import { lt, gt, and, eq, isNull, or } from "drizzle-orm";
import { addDays } from "date-fns";
import { generateId } from "@/lib/utils";

export async function runAlertScan(): Promise<{ generated: number }> {
  const today = new Date();
  const newAlerts: (typeof alerts.$inferInsert)[] = [];

  // 1. Expiring in 30 days
  const expiring30 = await db
    .select()
    .from(kits)
    .where(
      and(
        lt(kits.expiry_date, addDays(today, 30).toISOString().split("T")[0]),
        gt(kits.quantity, 0),
        or(eq(kits.status, "available"), eq(kits.status, "low_stock"))
      )
    );

  for (const kit of expiring30) {
    const expiryDate = new Date(kit.expiry_date);
    const daysLeft = Math.floor(
      (expiryDate.getTime() - today.getTime()) / 86400000
    );
    newAlerts.push({
      id: generateId(),
      alert_type: "expiry_warning",
      severity: daysLeft <= 14 ? "critical" : "warning",
      entity_type: "kit",
      entity_id: kit.id,
      message: `Kit lot ${kit.lot_number} (${kit.kit_type}): ${kit.quantity} units expire in ${daysLeft} days.`,
      is_resolved: false,
    });
  }

  // 2. Low stock (less than 10 units)
  const lowStock = await db
    .select()
    .from(kits)
    .where(and(lt(kits.quantity, 10), gt(kits.quantity, 0)));

  for (const kit of lowStock) {
    newAlerts.push({
      id: generateId(),
      alert_type: "low_stock",
      severity: kit.quantity < 5 ? "critical" : "warning",
      entity_type: "kit",
      entity_id: kit.id,
      message: `Kit ${kit.kit_type} (lot ${kit.lot_number}) is low: only ${kit.quantity} units remaining.`,
      is_resolved: false,
    });
  }

  // 3. Expired kits still in inventory
  const expired = await db
    .select()
    .from(kits)
    .where(
      and(
        lt(kits.expiry_date, today.toISOString().split("T")[0]),
        gt(kits.quantity, 0),
        eq(kits.status, "available")
      )
    );

  for (const kit of expired) {
    newAlerts.push({
      id: generateId(),
      alert_type: "expiry_warning",
      severity: "critical",
      entity_type: "kit",
      entity_id: kit.id,
      message: `Kit lot ${kit.lot_number} (${kit.kit_type}) has EXPIRED with ${kit.quantity} units still in inventory.`,
      is_resolved: false,
    });

    // Update kit status
    await db
      .update(kits)
      .set({ status: "expired" })
      .where(eq(kits.id, kit.id));
  }

  if (newAlerts.length > 0) {
    await db.insert(alerts).values(newAlerts);
  }

  return { generated: newAlerts.length };
}
