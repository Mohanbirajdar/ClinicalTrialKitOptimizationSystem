import { db } from "./index";
import {
  trials,
  sites,
  kits,
  shipments,
  kitUsage,
  demandForecasts,
  alerts,
} from "./schema";
import { generateId } from "@/lib/utils";
import { addMonths, subMonths, subDays, addDays, format } from "date-fns";

// ─── helpers ─────────────────────────────────────────────────────────────────
const d = (date: Date) => format(date, "yyyy-MM-dd");
const today = new Date();

async function clearAll() {
  console.log("Clearing existing data...");
  await db.delete(alerts);
  await db.delete(demandForecasts);
  await db.delete(kitUsage);
  await db.delete(shipments);
  await db.delete(sites);
  await db.delete(trials);
  await db.delete(kits);
  console.log("✓ Cleared");
}

async function seed() {
  console.log("\nSeeding cardiovascular disease trial data...\n");

  // ── 1. TRIALS (referenced from ClinicalTrials.gov) ───────────────────────
  const tId1 = generateId(); // TARTAN-HF (NCT05705869)
  const tId2 = generateId(); // HEART-PROTECT Phase III (NCT06900270 inspired)
  const tId3 = generateId(); // CARISMA-HF Phase II
  const tId4 = generateId(); // PREVENT-ACS Phase IV

  await db.insert(trials).values([
    {
      id: tId1,
      trial_name: "TARTAN-HF: Diabetes & Heart Failure Biomarker Screening",
      trial_phase: "Phase IV",
      status: "active",
      start_date: "2022-12-22",
      end_date: "2032-12-31",
      sponsor: "NHS Greater Glasgow and Clyde",
      protocol_number: "NCT05705869-TARTAN",
      description:
        "A long-term screening study evaluating novel biomarker-based diagnostics for heart failure in patients with type-2 diabetes. Blood and urine specimens are collected quarterly to track NT-proBNP, troponin I, and hs-CRP trajectories. Kit logistics span 6 NHS sites across Scotland.",
    },
    {
      id: tId2,
      trial_name: "HEART-PROTECT Phase III: Proteomics in Coronary Artery Disease",
      trial_phase: "Phase III",
      status: "active",
      start_date: "2024-08-01",
      end_date: "2026-12-31",
      sponsor: "University of São Paulo Medical School",
      protocol_number: "NCT06900270-HPROT",
      description:
        "Comparative plasma proteomics and metabolomics study in patients with stable and unstable coronary artery disease (CAD). Plasma and PBMC isolation kits are shipped to 5 international sites monthly. Primary endpoint: identification of 20 candidate biomarker proteins at 12-month follow-up.",
    },
    {
      id: tId3,
      trial_name: "CARISMA-HF Phase II: Cardiac Remodelling Inhibition Study",
      trial_phase: "Phase II",
      status: "active",
      start_date: "2023-06-01",
      end_date: "2025-11-30",
      sponsor: "Cardium Therapeutics AG",
      protocol_number: "CTH-2023-CARISMA-02",
      description:
        "Randomised, double-blind, placebo-controlled trial of CT-102 (a novel MMP-9 inhibitor) in patients with ischaemic heart failure (LVEF < 40%). Endomyocardial biopsy kits, plasma collection kits, and ECG patch kits are used at baseline, 3, 6, and 12 months. 8 sites across the EU and USA.",
    },
    {
      id: tId4,
      trial_name: "PREVENT-ACS Phase IV: Post-MI Secondary Prevention Registry",
      trial_phase: "Phase IV",
      status: "planning",
      start_date: "2025-04-01",
      end_date: "2028-03-31",
      sponsor: "European Society of Cardiology Foundation",
      protocol_number: "ESC-2025-PREVENT-004",
      description:
        "Post-marketing registry following 3,200 acute coronary syndrome survivors across 14 countries. Lipid panels, coagulation profiles, and platelet function kits are collected at 1, 6, 12, and 24 months post-discharge. Primary aim: real-world effectiveness of PCSK9-inhibitor therapy combined with DAPT.",
    },
  ]);
  console.log("✓ Seeded 4 CVD trials");

  // ── 2. SITES ─────────────────────────────────────────────────────────────
  const s: Record<string, string> = {};
  const siteList = [
    // TARTAN-HF sites (tId1)
    { key: "s1", trial_id: tId1, site_name: "Glasgow Royal Infirmary – Cardiology", location: "Glasgow, Scotland", country: "UK", activation_date: "2023-01-15", patient_capacity: 300, enrolled_patients: 241, samples_per_patient: 4, coordinator_name: "Dr. Fiona MacLeod", coordinator_email: "f.macleod@ggc.scot.nhs.uk", status: "active" as const },
    { key: "s2", trial_id: tId1, site_name: "Queen Elizabeth University Hospital", location: "Glasgow, Scotland", country: "UK", activation_date: "2023-02-01", patient_capacity: 250, enrolled_patients: 198, samples_per_patient: 4, coordinator_name: "Dr. Alistair Drummond", coordinator_email: "a.drummond@ggc.scot.nhs.uk", status: "active" as const },
    { key: "s3", trial_id: tId1, site_name: "Edinburgh Heart Centre – Royal Infirmary", location: "Edinburgh, Scotland", country: "UK", activation_date: "2023-03-10", patient_capacity: 200, enrolled_patients: 154, samples_per_patient: 4, coordinator_name: "Dr. Catriona Reid", coordinator_email: "c.reid@nhslothian.scot.nhs.uk", status: "active" as const },

    // HEART-PROTECT sites (tId2)
    { key: "s4", trial_id: tId2, site_name: "Heart Institute – University of São Paulo", location: "São Paulo, SP", country: "Brazil", activation_date: "2024-09-01", patient_capacity: 120, enrolled_patients: 64, samples_per_patient: 5, coordinator_name: "Dr. Beatriz Alves", coordinator_email: "b.alves@incor.usp.br", status: "active" as const },
    { key: "s5", trial_id: tId2, site_name: "Cleveland Clinic – Cardiovascular Medicine", location: "Cleveland, OH", country: "USA", activation_date: "2024-10-01", patient_capacity: 100, enrolled_patients: 47, samples_per_patient: 5, coordinator_name: "Dr. Steven Hazen", coordinator_email: "s.hazen@ccf.org", status: "active" as const },
    { key: "s6", trial_id: tId2, site_name: "National Heart Centre Singapore", location: "Singapore", country: "Singapore", activation_date: "2024-11-01", patient_capacity: 80, enrolled_patients: 29, samples_per_patient: 5, coordinator_name: "Dr. Lim Tiong Cheng", coordinator_email: "tc.lim@nhcs.com.sg", status: "active" as const },

    // CARISMA-HF sites (tId3)
    { key: "s7", trial_id: tId3, site_name: "Charité University Hospital – Cardiology", location: "Berlin", country: "Germany", activation_date: "2023-07-01", patient_capacity: 60, enrolled_patients: 52, samples_per_patient: 3, coordinator_name: "Prof. Dr. Stefan Halle", coordinator_email: "s.halle@charite.de", status: "active" as const },
    { key: "s8", trial_id: tId3, site_name: "Hôpital Lariboisière – Cardiologie", location: "Paris", country: "France", activation_date: "2023-08-15", patient_capacity: 55, enrolled_patients: 43, samples_per_patient: 3, coordinator_name: "Dr. Amélie Dupont", coordinator_email: "a.dupont@lariboisiere.fr", status: "active" as const },
    { key: "s9", trial_id: tId3, site_name: "Johns Hopkins Hospital – Heart & Vascular", location: "Baltimore, MD", country: "USA", activation_date: "2023-09-01", patient_capacity: 70, enrolled_patients: 58, samples_per_patient: 3, coordinator_name: "Dr. Monica Chen", coordinator_email: "m.chen@jhmi.edu", status: "active" as const },
    { key: "s10", trial_id: tId3, site_name: "Toronto General Hospital – Peter Munk Cardiac Centre", location: "Toronto, ON", country: "Canada", activation_date: "2023-10-01", patient_capacity: 50, enrolled_patients: 34, samples_per_patient: 3, coordinator_name: "Dr. Andrew Yan", coordinator_email: "a.yan@uhn.ca", status: "active" as const },

    // PREVENT-ACS sites (tId4) – planning phase, not yet enrolling
    { key: "s11", trial_id: tId4, site_name: "Mayo Clinic – Cardiovascular Diseases", location: "Rochester, MN", country: "USA", activation_date: "2025-05-01", patient_capacity: 250, enrolled_patients: 0, samples_per_patient: 4, coordinator_name: "Dr. Patricia Pellikka", coordinator_email: "p.pellikka@mayo.edu", status: "pending" as const },
    { key: "s12", trial_id: tId4, site_name: "Karolinska University Hospital – Cardiology", location: "Stockholm", country: "Sweden", activation_date: "2025-06-01", patient_capacity: 200, enrolled_patients: 0, samples_per_patient: 4, coordinator_name: "Dr. Lars Wallentin", coordinator_email: "l.wallentin@ki.se", status: "pending" as const },
  ];

  for (const { key, ...rest } of siteList) {
    s[key] = generateId();
    await db.insert(sites).values({ id: s[key], ...rest });
  }
  console.log("✓ Seeded 12 sites across 8 countries");

  // ── 3. KITS (CVD-specific collection kits) ───────────────────────────────
  const k: Record<string, string> = {};
  const kitList = [
    // High-volume — fully stocked
    { key: "k1", kit_type: "EDTA Blood Collection Kit", lot_number: "LOT-CVD-EDTA-2024-001", manufacturing_date: d(subMonths(today, 4)), expiry_date: d(addMonths(today, 20)), quantity: 2400, unit_cost: "9.80", storage_requirements: "Room temperature, 15–25°C", status: "available" as const },
    { key: "k2", kit_type: "Serum Separator Tube (SST) Kit", lot_number: "LOT-CVD-SST-2024-002", manufacturing_date: d(subMonths(today, 3)), expiry_date: d(addMonths(today, 18)), quantity: 1800, unit_cost: "11.20", storage_requirements: "Room temperature, 15–25°C", status: "available" as const },
    { key: "k3", kit_type: "Plasma Isolation Kit (Sodium Citrate)", lot_number: "LOT-CVD-PLASMA-2024-003", manufacturing_date: d(subMonths(today, 2)), expiry_date: d(addMonths(today, 16)), quantity: 1200, unit_cost: "14.50", storage_requirements: "2–8°C Refrigerated", status: "available" as const },
    { key: "k4", kit_type: "NT-proBNP Biomarker Collection Kit", lot_number: "LOT-CVD-BNP-2024-004", manufacturing_date: d(subMonths(today, 5)), expiry_date: d(addMonths(today, 7)), quantity: 600, unit_cost: "32.00", storage_requirements: "2–8°C Refrigerated", status: "available" as const },
    { key: "k5", kit_type: "High-Sensitivity Troponin I Kit", lot_number: "LOT-CVD-TROPI-2024-005", manufacturing_date: d(subMonths(today, 6)), expiry_date: d(addMonths(today, 6)), quantity: 480, unit_cost: "38.75", storage_requirements: "-20°C Frozen", status: "available" as const },
    { key: "k6", kit_type: "Lipid Panel Collection Kit", lot_number: "LOT-CVD-LIPID-2024-006", manufacturing_date: d(subMonths(today, 1)), expiry_date: d(addMonths(today, 22)), quantity: 900, unit_cost: "7.25", storage_requirements: "Room temperature, fasting required", status: "available" as const },
    // Low stock — needs replenishment
    { key: "k7", kit_type: "Endomyocardial Biopsy Kit", lot_number: "LOT-CVD-BIOPSY-2024-007", manufacturing_date: d(subMonths(today, 10)), expiry_date: d(addMonths(today, 14)), quantity: 12, unit_cost: "195.00", storage_requirements: "-20°C Frozen, sterile", status: "low_stock" as const },
    // Expiring soon
    { key: "k8", kit_type: "Platelet Function Assay Kit", lot_number: "LOT-CVD-PLT-2024-008", manufacturing_date: d(subMonths(today, 7)), expiry_date: d(addDays(today, 22)), quantity: 140, unit_cost: "54.00", storage_requirements: "2–8°C, light-sensitive", status: "available" as const },
    // Depleted
    { key: "k9", kit_type: "Coagulation Profile Kit (PT/INR/APTT)", lot_number: "LOT-CVD-COAG-2023-009", manufacturing_date: d(subMonths(today, 14)), expiry_date: d(addMonths(today, 4)), quantity: 0, unit_cost: "21.00", storage_requirements: "2–8°C Refrigerated", status: "depleted" as const },
    // Additional high-use kit
    { key: "k10", kit_type: "PBMC Isolation Kit (Ficoll-density)", lot_number: "LOT-CVD-PBMC-2024-010", manufacturing_date: d(subMonths(today, 2)), expiry_date: d(addMonths(today, 12)), quantity: 350, unit_cost: "67.50", storage_requirements: "Room temperature, use within 4 h of draw", status: "available" as const },
  ];

  for (const { key, ...rest } of kitList) {
    k[key] = generateId();
    await db.insert(kits).values({ id: k[key], ...rest });
  }
  console.log("✓ Seeded 10 CVD kit types");

  // ── 4. SHIPMENTS ─────────────────────────────────────────────────────────
  const shipmentData = [
    // Delivered shipments
    { site_id: s["s1"], kit_id: k["k1"], quantity: 300, shipment_date: d(subMonths(today, 5)), expected_delivery_date: d(subMonths(today, 5)), actual_delivery_date: d(subMonths(today, 5)), tracking_number: "DHL-CVD-001-GLA", status: "delivered" as const, notes: "Initial stock for TARTAN-HF Glasgow sites" },
    { site_id: s["s2"], kit_id: k["k1"], quantity: 250, shipment_date: d(subMonths(today, 5)), expected_delivery_date: d(subMonths(today, 5)), actual_delivery_date: d(subMonths(today, 5)), tracking_number: "DHL-CVD-002-GLA", status: "delivered" as const, notes: "Initial EDTA kit stock – QEUH" },
    { site_id: s["s1"], kit_id: k["k2"], quantity: 200, shipment_date: d(subMonths(today, 4)), expected_delivery_date: d(subMonths(today, 4)), actual_delivery_date: d(subMonths(today, 4)), tracking_number: "UPS-CVD-003-GRI", status: "delivered" as const, notes: "SST kits for Q2 blood draw campaign" },
    { site_id: s["s3"], kit_id: k["k4"], quantity: 150, shipment_date: d(subMonths(today, 3)), expected_delivery_date: d(subMonths(today, 3)), actual_delivery_date: d(subMonths(today, 3)), tracking_number: "FEDEX-CVD-004-EDI", status: "delivered" as const, notes: "NT-proBNP kits – Edinburgh baseline visits" },
    { site_id: s["s7"], kit_id: k["k7"], quantity: 30, shipment_date: d(subMonths(today, 4)), expected_delivery_date: d(subMonths(today, 4)), actual_delivery_date: d(subMonths(today, 4)), tracking_number: "DHL-CVD-005-BER", status: "delivered" as const, notes: "Biopsy kits – CARISMA-HF Charité baseline" },
    { site_id: s["s9"], kit_id: k["k7"], quantity: 25, shipment_date: d(subMonths(today, 3)), expected_delivery_date: d(subMonths(today, 3)), actual_delivery_date: d(subMonths(today, 3)), tracking_number: "FEDEX-CVD-006-JHH", status: "delivered" as const, notes: "Biopsy kits – Johns Hopkins" },
    { site_id: s["s4"], kit_id: k["k10"], quantity: 100, shipment_date: d(subMonths(today, 2)), expected_delivery_date: d(subMonths(today, 2)), actual_delivery_date: d(subMonths(today, 2)), tracking_number: "LATAM-CVD-007-SAO", status: "delivered" as const, notes: "PBMC kits – HEART-PROTECT São Paulo" },
    { site_id: s["s5"], kit_id: k["k3"], quantity: 80, shipment_date: d(subMonths(today, 2)), expected_delivery_date: d(subMonths(today, 2)), actual_delivery_date: d(subMonths(today, 2)), tracking_number: "UPS-CVD-008-CLE", status: "delivered" as const, notes: "Plasma kits – Cleveland Clinic" },
    // In transit
    { site_id: s["s6"], kit_id: k["k3"], quantity: 60, shipment_date: d(subDays(today, 4)), expected_delivery_date: d(addDays(today, 3)), actual_delivery_date: null as unknown as string, tracking_number: "SINGPOST-CVD-009-SIN", status: "in_transit" as const, notes: "Plasma kits – Singapore, cold-chain shipment" },
    { site_id: s["s8"], kit_id: k["k5"], quantity: 90, shipment_date: d(subDays(today, 2)), expected_delivery_date: d(addDays(today, 5)), actual_delivery_date: null as unknown as string, tracking_number: "CHRONO-CVD-010-PAR", status: "in_transit" as const, notes: "Troponin kits – Lariboisière Paris" },
    // Preparing
    { site_id: s["s10"], kit_id: k["k6"], quantity: 120, shipment_date: d(addDays(today, 2)), expected_delivery_date: d(addDays(today, 7)), actual_delivery_date: null as unknown as string, tracking_number: null as unknown as string, status: "preparing" as const, notes: "Lipid panel kits – Toronto, 6-month visit replenishment" },
    { site_id: s["s11"], kit_id: k["k1"], quantity: 400, shipment_date: d(addDays(today, 10)), expected_delivery_date: d(addDays(today, 14)), actual_delivery_date: null as unknown as string, tracking_number: null as unknown as string, status: "preparing" as const, notes: "PREVENT-ACS – initial stock for Mayo Clinic site activation" },
    // Delayed shipment
    { site_id: s["s2"], kit_id: k["k4"], quantity: 100, shipment_date: d(subDays(today, 10)), expected_delivery_date: d(subDays(today, 5)), actual_delivery_date: null as unknown as string, tracking_number: "DHL-CVD-011-QEUH", status: "in_transit" as const, notes: "DELAYED – customs hold at Heathrow. Escalated to logistics team." },
  ];

  for (const sh of shipmentData) {
    await db.insert(shipments).values({ id: generateId(), ...sh });
  }
  console.log("✓ Seeded 13 shipments");

  // ── 5. KIT USAGE ─────────────────────────────────────────────────────────
  const usageData = [
    // Glasgow Royal (s1) – TARTAN-HF
    { site_id: s["s1"], kit_id: k["k1"], kits_used: 120, kits_returned: 5, kits_wasted: 3, usage_date: d(subMonths(today, 4)), patient_count: 40, reported_by: "Dr. Fiona MacLeod", notes: "Month 1 baseline blood draws" },
    { site_id: s["s1"], kit_id: k["k2"], kits_used: 95, kits_returned: 2, kits_wasted: 1, usage_date: d(subMonths(today, 3)), patient_count: 40, reported_by: "Dr. Fiona MacLeod", notes: "SST serum collection – month 2" },
    { site_id: s["s1"], kit_id: k["k4"], kits_used: 80, kits_returned: 0, kits_wasted: 2, usage_date: d(subMonths(today, 2)), patient_count: 40, reported_by: "Dr. Fiona MacLeod", notes: "NT-proBNP quarterly draw – month 3" },
    // QEUH (s2)
    { site_id: s["s2"], kit_id: k["k1"], kits_used: 100, kits_returned: 3, kits_wasted: 4, usage_date: d(subMonths(today, 4)), patient_count: 35, reported_by: "Dr. Alistair Drummond", notes: "Baseline EDTA draws" },
    { site_id: s["s2"], kit_id: k["k2"], kits_used: 88, kits_returned: 1, kits_wasted: 2, usage_date: d(subMonths(today, 3)), patient_count: 35, reported_by: "Dr. Alistair Drummond", notes: "Month 3 SST collection" },
    // Edinburgh (s3)
    { site_id: s["s3"], kit_id: k["k4"], kits_used: 60, kits_returned: 0, kits_wasted: 1, usage_date: d(subMonths(today, 3)), patient_count: 30, reported_by: "Dr. Catriona Reid", notes: "NT-proBNP baseline" },
    { site_id: s["s3"], kit_id: k["k6"], kits_used: 55, kits_returned: 0, kits_wasted: 0, usage_date: d(subMonths(today, 2)), patient_count: 30, reported_by: "Dr. Catriona Reid", notes: "Fasting lipid panel collection" },
    // São Paulo (s4) – HEART-PROTECT
    { site_id: s["s4"], kit_id: k["k10"], kits_used: 64, kits_returned: 0, kits_wasted: 3, usage_date: d(subMonths(today, 1)), patient_count: 32, reported_by: "Dr. Beatriz Alves", notes: "PBMC isolation – HEART-PROTECT baseline" },
    { site_id: s["s4"], kit_id: k["k3"], kits_used: 50, kits_returned: 2, kits_wasted: 1, usage_date: d(subMonths(today, 1)), patient_count: 32, reported_by: "Dr. Beatriz Alves", notes: "Citrate plasma – proteomics panel" },
    // Cleveland (s5)
    { site_id: s["s5"], kit_id: k["k3"], kits_used: 47, kits_returned: 1, kits_wasted: 2, usage_date: d(subDays(today, 30)), patient_count: 24, reported_by: "Dr. Steven Hazen", notes: "Plasma baseline collections" },
    { site_id: s["s5"], kit_id: k["k10"], kits_used: 40, kits_returned: 0, kits_wasted: 1, usage_date: d(subDays(today, 30)), patient_count: 24, reported_by: "Dr. Steven Hazen", notes: "PBMC – proteomics" },
    // Charité (s7) – CARISMA-HF
    { site_id: s["s7"], kit_id: k["k7"], kits_used: 18, kits_returned: 0, kits_wasted: 1, usage_date: d(subMonths(today, 3)), patient_count: 18, reported_by: "Prof. Dr. Stefan Halle", notes: "Baseline endomyocardial biopsies" },
    { site_id: s["s7"], kit_id: k["k5"], kits_used: 52, kits_returned: 0, kits_wasted: 2, usage_date: d(subMonths(today, 2)), patient_count: 26, reported_by: "Prof. Dr. Stefan Halle", notes: "hs-Troponin I serial draws" },
    // Johns Hopkins (s9)
    { site_id: s["s9"], kit_id: k["k7"], kits_used: 22, kits_returned: 0, kits_wasted: 2, usage_date: d(subMonths(today, 2)), patient_count: 22, reported_by: "Dr. Monica Chen", notes: "Baseline biopsies – high wastage flag for degradation" },
    { site_id: s["s9"], kit_id: k["k8"], kits_used: 44, kits_returned: 2, kits_wasted: 1, usage_date: d(subMonths(today, 1)), patient_count: 22, reported_by: "Dr. Monica Chen", notes: "Platelet function assay" },
    // Toronto (s10)
    { site_id: s["s10"], kit_id: k["k9"], kits_used: 34, kits_returned: 1, kits_wasted: 0, usage_date: d(subMonths(today, 3)), patient_count: 17, reported_by: "Dr. Andrew Yan", notes: "Coagulation profile – now depleted" },
    { site_id: s["s10"], kit_id: k["k6"], kits_used: 30, kits_returned: 0, kits_wasted: 1, usage_date: d(subDays(today, 45)), patient_count: 17, reported_by: "Dr. Andrew Yan", notes: "Lipid panel draws" },
  ];

  for (const u of usageData) {
    await db.insert(kitUsage).values({ id: generateId(), ...u });
  }
  console.log("✓ Seeded 17 kit usage records");

  // ── 6. DEMAND FORECASTS ──────────────────────────────────────────────────
  const forecastData = [
    // TARTAN-HF sites – high volume, predictable quarterly pattern
    { site_id: s["s1"], kit_type: "EDTA Blood Collection Kit", forecast_date: d(addMonths(today, 1)), predicted_demand: 160, safety_stock: 48, recommended_qty: 208, confidence_score: "0.91", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s1"], kit_type: "NT-proBNP Biomarker Collection Kit", forecast_date: d(addMonths(today, 1)), predicted_demand: 85, safety_stock: 26, recommended_qty: 111, confidence_score: "0.87", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s2"], kit_type: "EDTA Blood Collection Kit", forecast_date: d(addMonths(today, 1)), predicted_demand: 130, safety_stock: 39, recommended_qty: 169, confidence_score: "0.89", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s2"], kit_type: "Serum Separator Tube (SST) Kit", forecast_date: d(addMonths(today, 1)), predicted_demand: 100, safety_stock: 30, recommended_qty: 130, confidence_score: "0.85", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s3"], kit_type: "NT-proBNP Biomarker Collection Kit", forecast_date: d(addMonths(today, 2)), predicted_demand: 65, safety_stock: 20, recommended_qty: 85, confidence_score: "0.83", model_version: "cvd-v1.2", months_ahead: 2 },
    { site_id: s["s3"], kit_type: "Lipid Panel Collection Kit", forecast_date: d(addMonths(today, 2)), predicted_demand: 60, safety_stock: 18, recommended_qty: 78, confidence_score: "0.88", model_version: "cvd-v1.2", months_ahead: 2 },

    // HEART-PROTECT sites – variable, proteomics-heavy
    { site_id: s["s4"], kit_type: "PBMC Isolation Kit (Ficoll-density)", forecast_date: d(addMonths(today, 1)), predicted_demand: 72, safety_stock: 22, recommended_qty: 94, confidence_score: "0.79", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s4"], kit_type: "Plasma Isolation Kit (Sodium Citrate)", forecast_date: d(addMonths(today, 1)), predicted_demand: 55, safety_stock: 17, recommended_qty: 72, confidence_score: "0.81", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s5"], kit_type: "PBMC Isolation Kit (Ficoll-density)", forecast_date: d(addMonths(today, 1)), predicted_demand: 50, safety_stock: 15, recommended_qty: 65, confidence_score: "0.77", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s6"], kit_type: "Plasma Isolation Kit (Sodium Citrate)", forecast_date: d(addMonths(today, 2)), predicted_demand: 35, safety_stock: 11, recommended_qty: 46, confidence_score: "0.74", model_version: "cvd-v1.2", months_ahead: 2 },

    // CARISMA-HF – biopsy kit critical forecasting
    { site_id: s["s7"], kit_type: "Endomyocardial Biopsy Kit", forecast_date: d(addMonths(today, 1)), predicted_demand: 20, safety_stock: 10, recommended_qty: 30, confidence_score: "0.92", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s9"], kit_type: "Endomyocardial Biopsy Kit", forecast_date: d(addMonths(today, 1)), predicted_demand: 24, safety_stock: 12, recommended_qty: 36, confidence_score: "0.90", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s8"], kit_type: "High-Sensitivity Troponin I Kit", forecast_date: d(addMonths(today, 1)), predicted_demand: 90, safety_stock: 27, recommended_qty: 117, confidence_score: "0.86", model_version: "cvd-v1.2", months_ahead: 1 },
    { site_id: s["s10"], kit_type: "Lipid Panel Collection Kit", forecast_date: d(addMonths(today, 2)), predicted_demand: 40, safety_stock: 12, recommended_qty: 52, confidence_score: "0.82", model_version: "cvd-v1.2", months_ahead: 2 },
  ];

  for (const f of forecastData) {
    await db.insert(demandForecasts).values({ id: generateId(), ...f });
  }
  console.log("✓ Seeded 14 demand forecasts");

  // ── 7. ALERTS ────────────────────────────────────────────────────────────
  await db.insert(alerts).values([
    // Critical – biopsy kit critically low
    { id: generateId(), alert_type: "low_stock", severity: "critical", entity_type: "kit", entity_id: k["k7"], message: "Endomyocardial Biopsy Kit (LOT-CVD-BIOPSY-2024-007) is at critically low stock (12 units). CARISMA-HF sites in Berlin and Baltimore require ~30 units each in the next 30 days. Urgent replenishment order needed.", is_resolved: false },
    // Critical – coagulation kit depleted
    { id: generateId(), alert_type: "low_stock", severity: "critical", entity_type: "kit", entity_id: k["k9"], message: "Coagulation Profile Kit (LOT-CVD-COAG-2023-009) is fully depleted (0 units). Toronto General Hospital site cannot proceed with coagulation follow-ups for CARISMA-HF patients. Immediate re-order required.", is_resolved: false },
    // Warning – platelet kit expiring in 22 days
    { id: generateId(), alert_type: "expiry_warning", severity: "warning", entity_type: "kit", entity_id: k["k8"], message: "Platelet Function Assay Kit (LOT-CVD-PLT-2024-008) expires in 22 days with 140 units remaining. Accelerate distribution to Johns Hopkins and Toronto sites to avoid wastage.", is_resolved: false },
    // Warning – troponin kit expiring in 6 months (early notice for cold-chain planning)
    { id: generateId(), alert_type: "expiry_warning", severity: "warning", entity_type: "kit", entity_id: k["k5"], message: "High-Sensitivity Troponin I Kit (LOT-CVD-TROPI-2024-005) will expire in 6 months. Review CARISMA-HF site consumption rates and ensure all units are allocated before expiry.", is_resolved: false },
    // Warning – NT-proBNP expiring in 7 months, high demand sites
    { id: generateId(), alert_type: "expiry_warning", severity: "info", entity_type: "kit", entity_id: k["k4"], message: "NT-proBNP Biomarker Collection Kit (LOT-CVD-BNP-2024-004) expires in 7 months. Current stock (600 units) should cover planned demand; verify TARTAN-HF quarterly schedule.", is_resolved: false },
    // Warning – delayed shipment
    { id: generateId(), alert_type: "shipment_delayed", severity: "warning", entity_type: "shipment", entity_id: null as unknown as string, message: "NT-proBNP kit shipment to Queen Elizabeth University Hospital (DHL-CVD-011-QEUH) is 5 days overdue. Customs hold at Heathrow reported. Site has 48 units remaining – sufficient for ~2 weeks. Logistics team notified.", is_resolved: false },
    // Info – Singapore shipment in transit
    { id: generateId(), alert_type: "shipment_delayed", severity: "info", entity_type: "shipment", entity_id: null as unknown as string, message: "Cold-chain Plasma Isolation Kit shipment to National Heart Centre Singapore (SINGPOST-CVD-009-SIN) is in transit. Estimated delivery in 3 days. Temperature logger showing compliant range.", is_resolved: true, resolved_at: new Date() },
    // Warning – high wastage at Johns Hopkins
    { id: generateId(), alert_type: "high_wastage", severity: "warning", entity_type: "site", entity_id: s["s9"], message: "Johns Hopkins Hospital (CARISMA-HF) reported 9% biopsy kit wastage rate at baseline visit (2 of 22 kits). Above acceptable 5% threshold. Site coordinator notified for re-training on sterile handling protocol.", is_resolved: false },
    // Info – PREVENT-ACS activation reminder
    { id: generateId(), alert_type: "low_stock", severity: "info", entity_type: "site", entity_id: s["s11"], message: "PREVENT-ACS Mayo Clinic site activates in ~6 weeks. Initial kit shipment (400 × EDTA, 250 × Lipid Panel) is in preparation. Confirm site readiness checklist with Dr. Pellikka.", is_resolved: false },
  ]);
  console.log("✓ Seeded 9 alerts (critical/warning/info)");

  console.log("\n🫀 Cardiovascular disease seed complete!");
  console.log("   Trials: 4 | Sites: 12 | Kits: 10 | Shipments: 13 | Usage: 17 | Forecasts: 14 | Alerts: 9");
  process.exit(0);
}

clearAll()
  .then(seed)
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  });
