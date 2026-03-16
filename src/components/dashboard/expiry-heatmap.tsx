"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ExpiryBucket } from "@/types";

const COLORS: Record<string, string> = {
  "Expired": "#ef4444",
  "< 30 days": "#f97316",
  "30-60 days": "#eab308",
};

export function ExpiryHeatmap({ data }: { data: ExpiryBucket[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Kit Expiry Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => [value, name === "quantity" ? "Units" : "Lots"]} />
            <Bar dataKey="quantity" name="Units" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.range} fill={COLORS[entry.range] || "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          {data.map((b) => (
            <div key={b.range} className="text-center">
              <p className="text-xs text-muted-foreground">{b.range}</p>
              <p className="text-sm font-bold">{b.count} lots</p>
              <p className="text-xs text-muted-foreground">{b.quantity} units</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
