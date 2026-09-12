// Simulated SLR predictor. This is a stand-in for a real trained model
// (see ModelRecord.algorithm / metrics) — it uses a fixed weighted linear
// combination of feature coefficients plus a base intercept so the app has
// deterministic, explainable output. Swap this out for a real inference
// call (e.g. to a hosted model endpoint) once one exists; keep the same
// input/output contract so the UI does not need to change.

import type { EngineeringFeature } from "./sample-data"
import { evaluatePostfix } from "./postfix"

const BASE_SLR_MM = 145

export interface PredictionResult {
  predictedSLR: number
  contributions: Record<string, number>
}

/** Computes derived-feature values from independent inputs. */
export function computeDerivedValues(
  features: EngineeringFeature[],
  independentValues: Record<string, number | null>,
): Record<string, number | null> {
  const derived: Record<string, number | null> = {}
  const derivedFeatures = features.filter((f) => f.kind === "derived")
  for (const f of derivedFeatures) {
    if (!f.formula) {
      derived[f.id] = null
      continue
    }
    derived[f.id] = evaluatePostfix(f.formula, { ...independentValues, ...derived })
  }
  return derived
}

export function predictSLR(
  features: EngineeringFeature[],
  independentValues: Record<string, number | null>,
): PredictionResult | null {
  const derived = computeDerivedValues(features, independentValues)
  const allValues: Record<string, number | null> = { ...independentValues, ...derived }

  const missing = features.some((f) => allValues[f.id] === null || allValues[f.id] === undefined)
  if (missing) return null

  const contributions: Record<string, number> = {}
  let total = BASE_SLR_MM

  for (const f of features) {
    const value = allValues[f.id] as number
    const range = f.kind === "independent" && f.min !== undefined && f.max !== undefined ? f.max - f.min : Math.max(Math.abs(value), 1)
    const normalized = f.kind === "independent" && f.min !== undefined ? (value - f.min) / (range || 1) : value
    const contribution = normalized * f.coefficient * 10
    contributions[f.id] = contribution
    total += contribution
  }

  return { predictedSLR: Math.round(total * 100) / 100, contributions }
}
