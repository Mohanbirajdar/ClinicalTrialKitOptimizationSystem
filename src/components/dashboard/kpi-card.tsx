import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Package, CheckCircle, Trash2, Percent, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  package: Package,
  "check-circle": CheckCircle,
  "trash-2": Trash2,
  percent: Percent,
  "alert-triangle": AlertTriangle,
  activity: Activity,
};

const variantStyles = {
  default: "border-slate-200 bg-slate-50",
  success: "border-green-200 bg-green-50",
  warning: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50",
};

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: string;
  variant?: "default" | "success" | "warning" | "danger";
  subtitle?: string;
}

export function KpiCard({ title, value, trend, icon = "activity", variant = "default", subtitle }: KpiCardProps) {
  const Icon = iconMap[icon] || Activity;
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = !trend || trend === 0 ? "text-slate-500" : trend > 0 ? "text-green-600" : "text-red-600";

  return (
    <Card className={cn("border-2", variantStyles[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground/40" />
        </div>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm mt-3", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
