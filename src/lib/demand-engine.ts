interface DemandInput {
  site_id: string;
  enrolled_patients: number;
  patient_capacity: number;
  samples_per_patient: number;
  historical_usage: number[];
  trial_phase: string;
  months_ahead: number;
}

export interface ForecastResult {
  predicted_demand: number;
  safety_stock: number;
  recommended_qty: number;
  confidence_score: number;
  method: string;
}

const PHASE_MULTIPLIERS: Record<string, number> = {
  "Phase I": 0.6,
  "Phase II": 0.8,
  "Phase III": 1.0,
  "Phase IV": 0.9,
};

const SAFETY_STOCK_FACTOR = 0.2;

export function predictDemand(input: DemandInput): ForecastResult {
  const {
    enrolled_patients,
    samples_per_patient,
    historical_usage,
    trial_phase,
    months_ahead,
  } = input;

  const phaseMultiplier = PHASE_MULTIPLIERS[trial_phase] ?? 1.0;
  const formulaDemand = Math.ceil(
    enrolled_patients * samples_per_patient * phaseMultiplier * months_ahead
  );

  let predictedBase = formulaDemand;
  let confidence = 0.6;

  if (historical_usage.length >= 3) {
    const recent = historical_usage.slice(-6);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    predictedBase = Math.ceil(
      (avg * 0.6 + formulaDemand * 0.4) * months_ahead
    );
    confidence = Math.min(0.95, 0.6 + (recent.length / 6) * 0.35);
  }

  let trendAdjustment = 1.0;
  if (historical_usage.length >= 2) {
    const last = historical_usage[historical_usage.length - 1];
    const prev = historical_usage[historical_usage.length - 2];
    const trend = prev > 0 ? (last - prev) / prev : 0;
    trendAdjustment = 1 + Math.max(-0.3, Math.min(0.3, trend));
  }

  const predicted_demand = Math.max(0, Math.ceil(predictedBase * trendAdjustment));
  const safety_stock = Math.ceil(predicted_demand * SAFETY_STOCK_FACTOR);
  const recommended_qty = predicted_demand + safety_stock;

  return {
    predicted_demand,
    safety_stock,
    recommended_qty,
    confidence_score: Math.round(confidence * 100) / 100,
    method:
      historical_usage.length >= 3 ? "weighted_hybrid" : "formula_based",
  };
}

export async function predictDemandWithML(
  input: DemandInput
): Promise<ForecastResult> {
  const mlServiceUrl = process.env.ML_SERVICE_URL;
  if (!mlServiceUrl) {
    return predictDemand(input);
  }
  try {
    const response = await fetch(`${mlServiceUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("ML service error");
    const data = await response.json();
    return data;
  } catch {
    return predictDemand(input);
  }
}
