import {
  mysqlTable,
  varchar,
  int,
  date,
  decimal,
  mysqlEnum,
  timestamp,
  text,
  boolean,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ─── CLINICAL TRIALS ─────────────────────────────────────────────────────────
export const trials = mysqlTable("trials", {
  id: varchar("id", { length: 36 }).primaryKey(),
  trial_name: varchar("trial_name", { length: 255 }).notNull(),
  trial_phase: mysqlEnum("trial_phase", [
    "Phase I",
    "Phase II",
    "Phase III",
    "Phase IV",
  ]).notNull(),
  status: mysqlEnum("status", [
    "planning",
    "active",
    "completed",
    "suspended",
  ]).default("planning"),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  description: text("description"),
  sponsor: varchar("sponsor", { length: 255 }),
  protocol_number: varchar("protocol_number", { length: 100 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ─── SITES ────────────────────────────────────────────────────────────────────
export const sites = mysqlTable(
  "sites",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    trial_id: varchar("trial_id", { length: 36 })
      .notNull()
      .references(() => trials.id, { onDelete: "cascade" }),
    site_name: varchar("site_name", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    activation_date: date("activation_date").notNull(),
    patient_capacity: int("patient_capacity").notNull(),
    enrolled_patients: int("enrolled_patients").default(0),
    samples_per_patient: int("samples_per_patient").default(1),
    coordinator_name: varchar("coordinator_name", { length: 255 }),
    coordinator_email: varchar("coordinator_email", { length: 255 }),
    status: mysqlEnum("status", ["pending", "active", "closed"]).default(
      "pending"
    ),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    trialIdx: index("trial_idx").on(table.trial_id),
  })
);

// ─── KITS ────────────────────────────────────────────────────────────────────
export const kits = mysqlTable(
  "kits",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    kit_type: varchar("kit_type", { length: 100 }).notNull(),
    lot_number: varchar("lot_number", { length: 100 }).notNull().unique(),
    manufacturing_date: date("manufacturing_date").notNull(),
    expiry_date: date("expiry_date").notNull(),
    quantity: int("quantity").notNull().default(0),
    unit_cost: decimal("unit_cost", { precision: 10, scale: 2 }),
    storage_requirements: varchar("storage_requirements", { length: 255 }),
    status: mysqlEnum("status", [
      "available",
      "low_stock",
      "expired",
      "depleted",
    ]).default("available"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    expiryIdx: index("expiry_idx").on(table.expiry_date),
    statusIdx: index("status_idx").on(table.status),
  })
);

// ─── SHIPMENTS ───────────────────────────────────────────────────────────────
export const shipments = mysqlTable(
  "shipments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    site_id: varchar("site_id", { length: 36 })
      .notNull()
      .references(() => sites.id),
    kit_id: varchar("kit_id", { length: 36 })
      .notNull()
      .references(() => kits.id),
    quantity: int("quantity").notNull(),
    shipment_date: date("shipment_date").notNull(),
    expected_delivery_date: date("expected_delivery_date"),
    actual_delivery_date: date("actual_delivery_date"),
    tracking_number: varchar("tracking_number", { length: 100 }),
    status: mysqlEnum("status", [
      "preparing",
      "shipped",
      "in_transit",
      "delivered",
      "cancelled",
    ]).default("preparing"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    siteIdx: index("site_idx").on(table.site_id),
    kitIdx: index("kit_idx").on(table.kit_id),
    dateIdx: index("date_idx").on(table.shipment_date),
  })
);

// ─── KIT USAGE ───────────────────────────────────────────────────────────────
export const kitUsage = mysqlTable(
  "kit_usage",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    site_id: varchar("site_id", { length: 36 })
      .notNull()
      .references(() => sites.id),
    kit_id: varchar("kit_id", { length: 36 })
      .notNull()
      .references(() => kits.id),
    kits_used: int("kits_used").notNull(),
    kits_returned: int("kits_returned").default(0),
    kits_wasted: int("kits_wasted").default(0),
    usage_date: date("usage_date").notNull(),
    patient_count: int("patient_count"),
    notes: text("notes"),
    reported_by: varchar("reported_by", { length: 255 }),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    siteIdx: index("site_idx").on(table.site_id),
    dateIdx: index("date_idx").on(table.usage_date),
  })
);

// ─── DEMAND FORECASTS ────────────────────────────────────────────────────────
export const demandForecasts = mysqlTable("demand_forecasts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  site_id: varchar("site_id", { length: 36 })
    .notNull()
    .references(() => sites.id),
  kit_type: varchar("kit_type", { length: 100 }).notNull(),
  forecast_date: date("forecast_date").notNull(),
  predicted_demand: int("predicted_demand").notNull(),
  safety_stock: int("safety_stock").notNull(),
  recommended_qty: int("recommended_qty").notNull(),
  confidence_score: decimal("confidence_score", { precision: 5, scale: 2 }),
  model_version: varchar("model_version", { length: 50 }),
  months_ahead: int("months_ahead").default(3),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── ALERTS ──────────────────────────────────────────────────────────────────
export const alerts = mysqlTable(
  "alerts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    alert_type: mysqlEnum("alert_type", [
      "expiry_warning",
      "low_stock",
      "overstock",
      "shipment_delayed",
      "high_wastage",
    ]).notNull(),
    severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
    entity_type: varchar("entity_type", { length: 50 }),
    entity_id: varchar("entity_id", { length: 36 }),
    message: text("message").notNull(),
    is_resolved: boolean("is_resolved").default(false),
    resolved_at: timestamp("resolved_at"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    resolvedIdx: index("resolved_idx").on(table.is_resolved),
    typeIdx: index("type_idx").on(table.alert_type),
  })
);

// ─── RELATIONS ───────────────────────────────────────────────────────────────
export const trialsRelations = relations(trials, ({ many }) => ({
  sites: many(sites),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  trial: one(trials, { fields: [sites.trial_id], references: [trials.id] }),
  shipments: many(shipments),
  usage: many(kitUsage),
  forecasts: many(demandForecasts),
}));

export const kitsRelations = relations(kits, ({ many }) => ({
  shipments: many(shipments),
  usage: many(kitUsage),
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  site: one(sites, { fields: [shipments.site_id], references: [sites.id] }),
  kit: one(kits, { fields: [shipments.kit_id], references: [kits.id] }),
}));

export const kitUsageRelations = relations(kitUsage, ({ one }) => ({
  site: one(sites, { fields: [kitUsage.site_id], references: [sites.id] }),
  kit: one(kits, { fields: [kitUsage.kit_id], references: [kits.id] }),
}));

export const demandForecastsRelations = relations(
  demandForecasts,
  ({ one }) => ({
    site: one(sites, {
      fields: [demandForecasts.site_id],
      references: [sites.id],
    }),
  })
);
