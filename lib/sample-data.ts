// Seed data for the template. Every array here is the "swap point" for
// real data later: replace the seeded rows with real dataset exports,
// real trained-model manifests, or a real feature registry from the
// tyre engineering team — the rest of the app (charts, stat tables,
// prediction math) is written generically against these shapes.

import type { PostfixToken } from "./postfix"
import { computeColumnStats, type StatSummary } from "./csv-stats"

export type FeatureKind = "independent" | "derived"

export interface EngineeringFeature {
  id: string
  name: string
  unit: string
  kind: FeatureKind
  min?: number
  max?: number
  formula?: PostfixToken[]
  /** Fixed linear-model coefficient used by the simulated predictor. */
  coefficient: number
  sourceDatasetId?: string
}

export interface DatasetRecord {
  id: string
  fileName: string
  modelFileName: string
  columns: string[]
  rows: string[][]
  stats: Record<string, StatSummary>
  uploadedAt: string
}

export interface ModelHyperparameters {
  [key: string]: string | number
}

export interface ModelMetrics {
  mae: number
  rmse: number
  r2: number
  mape: number
}

export interface ModelRecord {
  id: string
  fileName: string
  datasetId: string
  algorithm: string
  hyperparameters: ModelHyperparameters
  metrics: ModelMetrics
  featureIds: string[]
  isSelected: boolean
  uploadedAt: string
}

export type AuditActor = "user.rpg" | "admin.rpg" | "master.rpg" | string

export interface AuditEntry {
  id: string
  timestamp: string
  actor: AuditActor
  role: "user" | "admin" | "master"
  action: string
  details: string
  category: "auth" | "feature" | "dataset" | "model" | "access" | "provision"
}

export type UserRole = "user" | "admin" | "master"

export interface DirectoryAccount {
  username: string
  role: UserRole
  status: "active" | "revoked"
  lastSeen: string
  sessionToken: string
}

export const CREDENTIALS: { username: string; password: string; role: UserRole }[] = [
  { username: "user.rpg", password: "user01", role: "user" },
  { username: "admin.rpg", password: "admin01", role: "admin" },
  { username: "master.rpg", password: "master01", role: "master" },
]

// ---------------------------------------------------------------------------
// Feature registry
// ---------------------------------------------------------------------------

export const SEED_FEATURES: EngineeringFeature[] = [
  { id: "load", name: "Vertical Load", unit: "kgf", kind: "independent", min: 250, max: 1200, coefficient: 0.0421, sourceDatasetId: "ds-1" },
  { id: "inflation_pressure", name: "Inflation Pressure", unit: "kPa", kind: "independent", min: 180, max: 320, coefficient: -0.0862, sourceDatasetId: "ds-1" },
  { id: "section_width", name: "Section Width", unit: "mm", kind: "independent", min: 145, max: 275, coefficient: 0.1187, sourceDatasetId: "ds-1" },
  { id: "aspect_ratio", name: "Aspect Ratio", unit: "%", kind: "independent", min: 45, max: 80, coefficient: 0.246, sourceDatasetId: "ds-1" },
  { id: "rim_diameter", name: "Rim Diameter", unit: "in", kind: "independent", min: 13, max: 20, coefficient: 3.92, sourceDatasetId: "ds-1" },
  { id: "speed", name: "Test Speed", unit: "km/h", kind: "independent", min: 0, max: 160, coefficient: -0.0113, sourceDatasetId: "ds-1" },
  { id: "ambient_temp", name: "Ambient Temperature", unit: "°C", kind: "independent", min: 10, max: 55, coefficient: -0.0245, sourceDatasetId: "ds-1" },
  {
    id: "deflection_ratio",
    name: "Deflection Ratio",
    unit: "ratio",
    kind: "derived",
    coefficient: 18.4,
    formula: [
      { type: "feature", featureId: "load", label: "Vertical Load" },
      { type: "feature", featureId: "inflation_pressure", label: "Inflation Pressure" },
      { type: "operator", op: "÷" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Datasets — small synthetic CSV-like tables (rows are strings, matching
// how a real uploaded CSV would come through the parser).
// ---------------------------------------------------------------------------

function synthesizeRows(seed: number, count: number): string[][] {
  const rows: string[][] = []
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = 0; i < count; i++) {
    const load = Math.round(250 + rand() * 950)
    const pressure = Math.round(180 + rand() * 140)
    const width = Math.round(145 + rand() * 130)
    const aspect = Math.round(45 + rand() * 35)
    const rim = Math.round((13 + rand() * 7) * 2) / 2
    const speed = Math.round(rand() * 160)
    const temp = Math.round(10 + rand() * 45)
    const slr = Math.round((300 - width * 0.02 + load * 0.03 - pressure * 0.05 + aspect * 0.4) * 10) / 10
    rows.push([String(load), String(pressure), String(width), String(aspect), String(rim), String(speed), String(temp), String(slr)])
  }
  return rows
}

const DATASET_COLUMNS = [
  "load_kgf",
  "inflation_pressure_kpa",
  "section_width_mm",
  "aspect_ratio_pct",
  "rim_diameter_in",
  "speed_kmh",
  "ambient_temp_c",
  "slr_mm",
]

function buildDataset(id: string, fileName: string, modelFileName: string, seed: number, count: number, uploadedAt: string): DatasetRecord {
  const rows = synthesizeRows(seed, count)
  const stats: Record<string, StatSummary> = {}
  DATASET_COLUMNS.forEach((col, idx) => {
    stats[col] = computeColumnStats(rows.map((r) => r[idx]))
  })
  return { id, fileName, modelFileName, columns: DATASET_COLUMNS, rows, stats, uploadedAt }
}

export const SEED_DATASETS: DatasetRecord[] = [
  buildDataset("ds-1", "tyre_slr_dataset_v1.csv", "slr_gbr_model_v1.pkl", 7, 42, "2025-01-14T09:20:00Z"),
  buildDataset("ds-2", "tyre_slr_dataset_v2_expanded.csv", "slr_rf_model_v2.pkl", 23, 58, "2025-04-02T11:05:00Z"),
  buildDataset("ds-3", "tyre_slr_highspeed_batch.csv", "slr_nn_model_v1.pkl", 91, 35, "2025-07-19T15:40:00Z"),
]

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export const SEED_MODELS: ModelRecord[] = [
  {
    id: "model-1",
    fileName: "slr_gbr_model_v1.pkl",
    datasetId: "ds-1",
    algorithm: "Gradient Boosting Regressor",
    hyperparameters: { n_estimators: 250, max_depth: 4, learning_rate: 0.05, subsample: 0.8 },
    metrics: { mae: 1.82, rmse: 2.41, r2: 0.94, mape: 2.1 },
    featureIds: ["load", "inflation_pressure", "section_width", "aspect_ratio", "rim_diameter", "speed", "ambient_temp"],
    isSelected: true,
    uploadedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "model-2",
    fileName: "slr_rf_model_v2.pkl",
    datasetId: "ds-2",
    algorithm: "Random Forest Regressor",
    hyperparameters: { n_estimators: 400, max_depth: 8, min_samples_leaf: 3 },
    metrics: { mae: 2.05, rmse: 2.78, r2: 0.91, mape: 2.6 },
    featureIds: ["load", "inflation_pressure", "section_width", "aspect_ratio", "rim_diameter", "speed", "ambient_temp"],
    isSelected: false,
    uploadedAt: "2025-04-03T09:30:00Z",
  },
  {
    id: "model-3",
    fileName: "slr_nn_model_v1.pkl",
    datasetId: "ds-3",
    algorithm: "Neural Network (MLP)",
    hyperparameters: { hidden_layers: "128,64,32", activation: "relu", epochs: 200, batch_size: 32 },
    metrics: { mae: 1.65, rmse: 2.12, r2: 0.96, mape: 1.8 },
    featureIds: ["load", "inflation_pressure", "section_width", "aspect_ratio", "rim_diameter", "speed", "ambient_temp"],
    isSelected: false,
    uploadedAt: "2025-07-20T13:15:00Z",
  },
]

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export const SEED_AUDIT_LOG: AuditEntry[] = [
  { id: "a1", timestamp: "2025-01-15T10:02:00Z", actor: "admin.rpg", role: "admin", action: "Model Deployed", details: "Selected slr_gbr_model_v1.pkl for live prediction", category: "model" },
  { id: "a2", timestamp: "2025-04-03T09:32:00Z", actor: "admin.rpg", role: "admin", action: "Dataset Uploaded", details: "tyre_slr_dataset_v2_expanded.csv (58 rows)", category: "dataset" },
  { id: "a3", timestamp: "2025-06-11T08:12:00Z", actor: "master.rpg", role: "master", action: "Role Elevated", details: "Elevated user.ops01 to Admin", category: "access" },
  { id: "a4", timestamp: "2025-07-20T13:16:00Z", actor: "admin.rpg", role: "admin", action: "Model Uploaded", details: "slr_nn_model_v1.pkl trained on tyre_slr_highspeed_batch.csv", category: "model" },
  { id: "a5", timestamp: "2025-08-02T16:45:00Z", actor: "master.rpg", role: "master", action: "Account Provisioned", details: "Created account qa.analyst02 (role: user)", category: "provision" },
  { id: "a6", timestamp: "2025-08-30T12:00:00Z", actor: "admin.rpg", role: "admin", action: "Feature Added", details: "Added derived feature 'Deflection Ratio'", category: "feature" },
]

// ---------------------------------------------------------------------------
// User directory (Master Dashboard)
// ---------------------------------------------------------------------------

export const SEED_DIRECTORY: DirectoryAccount[] = [
  { username: "user.rpg", role: "user", status: "active", lastSeen: "2025-09-12T18:22:00Z", sessionToken: "tok_9f2a" },
  { username: "admin.rpg", role: "admin", status: "active", lastSeen: "2025-09-13T07:10:00Z", sessionToken: "tok_e831" },
  { username: "master.rpg", role: "master", status: "active", lastSeen: "2025-09-13T08:00:00Z", sessionToken: "tok_a001" },
  { username: "user.ops01", role: "admin", status: "active", lastSeen: "2025-09-11T14:05:00Z", sessionToken: "tok_c412" },
  { username: "qa.analyst02", role: "user", status: "active", lastSeen: "2025-09-10T09:44:00Z", sessionToken: "tok_bb27" },
  { username: "field.engineer04", role: "user", status: "revoked", lastSeen: "2025-08-21T11:30:00Z", sessionToken: "tok_00d1" },
]
