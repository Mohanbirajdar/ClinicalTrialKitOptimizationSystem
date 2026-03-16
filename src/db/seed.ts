import { db } from "./index";
import { trials, sites, kits } from "./schema";
import { generateId } from "@/lib/utils";
import { addMonths, subMonths, format } from "date-fns";

async function seed() {
  console.log("Seeding database...");

  // Create trials
  const trialId1 = generateId();
  const trialId2 = generateId();

  await db.insert(trials).values([
    {
      id: trialId1,
      trial_name: "AURORA Phase III Oncology Study",
      trial_phase: "Phase III",
      status: "active",
      start_date: "2024-01-15",
      end_date: "2025-12-31",
      sponsor: "Aurora Pharma Inc.",
      protocol_number: "AUR-2024-003",
      description: "A randomized controlled trial for novel oncology treatment.",
    },
    {
      id: trialId2,
      trial_name: "NEXUS Phase II Cardiology Trial",
      trial_phase: "Phase II",
      status: "active",
      start_date: "2024-03-01",
      end_date: "2025-06-30",
      sponsor: "Nexus Medical Corp.",
      protocol_number: "NEX-2024-011",
      description: "Phase II trial for new cardiovascular intervention.",
    },
  ]);

  // Create sites
  const siteIds = Array.from({ length: 4 }, () => generateId());

  await db.insert(sites).values([
    {
      id: siteIds[0],
      trial_id: trialId1,
      site_name: "Boston Medical Center",
      location: "Boston, MA",
      country: "USA",
      activation_date: "2024-02-01",
      patient_capacity: 100,
      enrolled_patients: 72,
      samples_per_patient: 3,
      coordinator_name: "Dr. Sarah Chen",
      coordinator_email: "s.chen@bmc.org",
      status: "active",
    },
    {
      id: siteIds[1],
      trial_id: trialId1,
      site_name: "Mayo Clinic Rochester",
      location: "Rochester, MN",
      country: "USA",
      activation_date: "2024-02-15",
      patient_capacity: 80,
      enrolled_patients: 45,
      samples_per_patient: 3,
      coordinator_name: "Dr. James Liu",
      coordinator_email: "j.liu@mayo.edu",
      status: "active",
    },
    {
      id: siteIds[2],
      trial_id: trialId2,
      site_name: "Johns Hopkins Hospital",
      location: "Baltimore, MD",
      country: "USA",
      activation_date: "2024-04-01",
      patient_capacity: 60,
      enrolled_patients: 38,
      samples_per_patient: 2,
      coordinator_name: "Dr. Emily Ross",
      coordinator_email: "e.ross@jhu.edu",
      status: "active",
    },
    {
      id: siteIds[3],
      trial_id: trialId2,
      site_name: "Toronto General Hospital",
      location: "Toronto, ON",
      country: "Canada",
      activation_date: "2024-05-01",
      patient_capacity: 50,
      enrolled_patients: 22,
      samples_per_patient: 2,
      coordinator_name: "Dr. Michael Park",
      coordinator_email: "m.park@tgh.ca",
      status: "active",
    },
  ]);

  // Create kit inventory
  const today = new Date();
  const kitData = [
    {
      id: generateId(),
      kit_type: "Blood Draw Collection Kit",
      lot_number: "LOT-BDK-2024-001",
      manufacturing_date: format(subMonths(today, 3), "yyyy-MM-dd"),
      expiry_date: format(addMonths(today, 9), "yyyy-MM-dd"),
      quantity: 500,
      unit_cost: "12.50",
      storage_requirements: "2-8°C, Refrigerated",
      status: "available" as const,
    },
    {
      id: generateId(),
      kit_type: "Urine Sample Collection Kit",
      lot_number: "LOT-USK-2024-002",
      manufacturing_date: format(subMonths(today, 2), "yyyy-MM-dd"),
      expiry_date: format(addMonths(today, 4), "yyyy-MM-dd"),
      quantity: 300,
      unit_cost: "8.75",
      storage_requirements: "Room temperature",
      status: "available" as const,
    },
    {
      id: generateId(),
      kit_type: "Tissue Biopsy Kit",
      lot_number: "LOT-TBK-2024-003",
      manufacturing_date: format(subMonths(today, 1), "yyyy-MM-dd"),
      expiry_date: format(addMonths(today, 11), "yyyy-MM-dd"),
      quantity: 150,
      unit_cost: "45.00",
      storage_requirements: "-20°C, Frozen",
      status: "available" as const,
    },
    {
      id: generateId(),
      kit_type: "Blood Draw Collection Kit",
      lot_number: "LOT-BDK-2023-OLD",
      manufacturing_date: format(subMonths(today, 8), "yyyy-MM-dd"),
      expiry_date: format(addMonths(today, 20), "yyyy-MM-dd"),
      quantity: 8,
      unit_cost: "12.50",
      storage_requirements: "2-8°C, Refrigerated",
      status: "low_stock" as const,
    },
    {
      id: generateId(),
      kit_type: "Plasma Collection Kit",
      lot_number: "LOT-PCK-2024-EXPIRING",
      manufacturing_date: format(subMonths(today, 5), "yyyy-MM-dd"),
      expiry_date: format(addMonths(today, 0.5), "yyyy-MM-dd"),
      quantity: 75,
      unit_cost: "18.00",
      storage_requirements: "-80°C, Ultra-frozen",
      status: "available" as const,
    },
  ];

  await db.insert(kits).values(kitData);

  console.log("✓ Seeded trials:", 2);
  console.log("✓ Seeded sites:", siteIds.length);
  console.log("✓ Seeded kit lots:", kitData.length);
  console.log("Done!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
