export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { kits } from "@/db/schema";
import { lt, gt, and, or, eq } from "drizzle-orm";
import { successResponse, serverError } from "@/lib/api-response";
import { addDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") || 60);
    const today = new Date().toISOString().split("T")[0];
    const future = addDays(new Date(), days).toISOString().split("T")[0];

    const expiringKits = await db
      .select()
      .from(kits)
      .where(
        and(
          lt(kits.expiry_date, future),
          gt(kits.quantity, 0),
          or(eq(kits.status, "available"), eq(kits.status, "low_stock"))
        )
      )
      .orderBy(kits.expiry_date);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const in30 = addDays(now, 30);
    const in60 = addDays(now, days);

    const toDate = (v: unknown): Date =>
      v instanceof Date ? v : new Date(v as string);

    const grouped = {
      expired: expiringKits.filter((k) => toDate(k.expiry_date) < now),
      within_30: expiringKits.filter(
        (k) => toDate(k.expiry_date) >= now && toDate(k.expiry_date) < in30
      ),
      within_60: expiringKits.filter(
        (k) => toDate(k.expiry_date) >= in30 && toDate(k.expiry_date) < in60
      ),
    };

    return successResponse({ kits: expiringKits, grouped, total: expiringKits.length });
  } catch (e) {
    return serverError(e);
  }
}
