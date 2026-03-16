export type TrialPhase = "Phase I" | "Phase II" | "Phase III" | "Phase IV";
export type TrialStatus = "planning" | "active" | "completed" | "suspended";
export type SiteStatus = "pending" | "active" | "closed";
export type KitStatus = "available" | "low_stock" | "expired" | "depleted";
export type ShipmentStatus =
  | "preparing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "cancelled";
export type AlertType =
  | "expiry_warning"
  | "low_stock"
  | "overstock"
  | "shipment_delayed"
  | "high_wastage";
export type AlertSeverity = "info" | "warning" | "critical";

export interface Trial {
  id: string;
  trial_name: string;
  trial_phase: TrialPhase;
  status: TrialStatus;
  start_date: string;
  end_date?: string;
  description?: string;
  sponsor?: string;
  protocol_number?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Site {
  id: string;
  trial_id: string;
  site_name: string;
  location: string;
  country: string;
  activation_date: string;
  patient_capacity: number;
  enrolled_patients: number;
  samples_per_patient: number;
  coordinator_name?: string;
  coordinator_email?: string;
  status: SiteStatus;
  trial?: Trial;
  created_at?: Date;
  updated_at?: Date;
}

export interface Kit {
  id: string;
  kit_type: string;
  lot_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity: number;
  unit_cost?: string;
  storage_requirements?: string;
  status: KitStatus;
  created_at?: Date;
  updated_at?: Date;
}

export interface Shipment {
  id: string;
  site_id: string;
  kit_id: string;
  quantity: number;
  shipment_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  tracking_number?: string;
  status: ShipmentStatus;
  notes?: string;
  site?: Site;
  kit?: Kit;
  created_at?: Date;
  updated_at?: Date;
}

export interface KitUsage {
  id: string;
  site_id: string;
  kit_id: string;
  kits_used: number;
  kits_returned: number;
  kits_wasted: number;
  usage_date: string;
  patient_count?: number;
  notes?: string;
  reported_by?: string;
  site?: Site;
  kit?: Kit;
  created_at?: Date;
}

export interface DemandForecast {
  id: string;
  site_id: string;
  kit_type: string;
  forecast_date: string;
  predicted_demand: number;
  safety_stock: number;
  recommended_qty: number;
  confidence_score?: string;
  model_version?: string;
  months_ahead?: number;
  created_at?: Date;
}

export interface Alert {
  id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  entity_type?: string;
  entity_id?: string;
  message: string;
  is_resolved: boolean;
  resolved_at?: Date;
  created_at?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: { total: number; page: number; limit: number };
}

export interface DashboardSummary {
  total_shipped: number;
  total_used: number;
  total_wasted: number;
  wastage_pct: number;
  shipped_trend: number;
  used_trend: number;
  wastage_trend: number;
  wastage_pct_trend: number;
  monthly_wastage: MonthlyWastage[];
  expiry_buckets: ExpiryBucket[];
  site_usage: SiteUsageSummary[];
  recent_alerts: Alert[];
  active_trials: number;
  active_sites: number;
  kits_expiring_30: number;
  kits_expiring_60: number;
}

export interface MonthlyWastage {
  month: string;
  shipped: number;
  used: number;
  wasted: number;
}

export interface ExpiryBucket {
  range: string;
  count: number;
  quantity: number;
}

export interface SiteUsageSummary {
  site_id: string;
  site_name: string;
  location: string;
  kits_shipped: number;
  kits_used: number;
  kits_wasted: number;
  wastage_pct: number;
}

export interface ForecastResult {
  predicted_demand: number;
  safety_stock: number;
  recommended_qty: number;
  confidence_score: number;
  method: string;
}
