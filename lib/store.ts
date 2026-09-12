"use client"

// Central app state. Persisted to localStorage since this template runs
// fully client-side (see plan: no backend yet). Every slice below is the
// seam where real data / a real backend would plug in later — replace the
// SEED_* imports with API calls and swap `persist` for a real fetch layer
// without changing the component code that reads from this store.

import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  CREDENTIALS,
  SEED_AUDIT_LOG,
  SEED_DATASETS,
  SEED_DIRECTORY,
  SEED_FEATURES,
  SEED_MODELS,
  type AuditEntry,
  type DatasetRecord,
  type DirectoryAccount,
  type EngineeringFeature,
  type ModelRecord,
  type UserRole,
} from "./sample-data"
import { predictSLR, computeDerivedValues } from "./slr-model"
import { parseCsv } from "./csv-stats"

export interface AuthState {
  username: string
  role: UserRole
}

interface PredictionState {
  inputs: Record<string, number | null>
  derived: Record<string, number | null>
  predictedSLR: number | null
  contributions: Record<string, number>
}

interface WhatIfState {
  sliderDeltaPct: Record<string, number>
  simulatedSLR: number | null
  simulatedInputs: Record<string, number | null>
}

interface AppState {
  hasHydrated: boolean
  setHasHydrated: (v: boolean) => void

  auth: AuthState | null
  login: (username: string, password: string) => AuthState | null
  logout: () => void

  features: EngineeringFeature[]
  addFeature: (feature: EngineeringFeature, actor: AuthState) => void
  removeFeature: (id: string, actor: AuthState) => void

  datasets: DatasetRecord[]
  addDataset: (fileName: string, modelFileName: string, csvText: string, actor: AuthState) => void
  removeDataset: (id: string, actor: AuthState) => void

  models: ModelRecord[]
  addModel: (model: Omit<ModelRecord, "id" | "uploadedAt" | "isSelected">, actor: AuthState) => void
  removeModel: (id: string, actor: AuthState) => void
  selectModel: (id: string, actor: AuthState) => void

  prediction: PredictionState
  setInput: (featureId: string, value: number | null) => void
  runPrediction: () => void
  seedPredictionInputs: (values: Record<string, number | null>) => void

  whatIf: WhatIfState
  setSliderDelta: (featureId: string, pct: number) => void
  resetSliders: () => void
  runWhatIfCalculation: () => void

  auditLog: AuditEntry[]
  logAudit: (entry: Omit<AuditEntry, "id" | "timestamp">) => void

  directory: DirectoryAccount[]
  elevateToAdmin: (username: string) => void
  revokeAccess: (username: string) => void
  provisionAccount: (username: string, role: UserRole) => void

  resetToSampleData: () => void
}

const emptyPrediction: PredictionState = {
  inputs: {},
  derived: {},
  predictedSLR: null,
  contributions: {},
}

const emptyWhatIf: WhatIfState = {
  sliderDeltaPct: {},
  simulatedSLR: null,
  simulatedInputs: {},
}

function nowIso() {
  return new Date().toISOString()
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      auth: null,
      login: (username, password) => {
        const match = CREDENTIALS.find((c) => c.username === username && c.password === password)
        if (!match) return null
        const authState: AuthState = { username: match.username, role: match.role }
        set({ auth: authState })
        get().logAudit({
          actor: authState.username,
          role: authState.role,
          action: "Signed In",
          details: `${authState.username} authenticated as ${authState.role}`,
          category: "auth",
        })
        return authState
      },
      logout: () => set({ auth: null }),

      features: SEED_FEATURES,
      addFeature: (feature, actor) => {
        set((s) => ({ features: [...s.features, feature] }))
        get().logAudit({
          actor: actor.username,
          role: actor.role,
          action: "Feature Added",
          details: `Added ${feature.kind} feature '${feature.name}'`,
          category: "feature",
        })
      },
      removeFeature: (id, actor) => {
        const feature = get().features.find((f) => f.id === id)
        set((s) => ({ features: s.features.filter((f) => f.id !== id) }))
        if (feature) {
          get().logAudit({
            actor: actor.username,
            role: actor.role,
            action: "Feature Removed",
            details: `Removed feature '${feature.name}'`,
            category: "feature",
          })
        }
      },

      datasets: SEED_DATASETS,
      addDataset: (fileName, modelFileName, csvText, actor) => {
        const parsed = parseCsv(csvText)
        const record: DatasetRecord = {
          id: `ds-${Date.now()}`,
          fileName,
          modelFileName,
          columns: parsed.columns,
          rows: parsed.rows,
          stats: parsed.stats,
          uploadedAt: nowIso(),
        }
        set((s) => ({ datasets: [record, ...s.datasets] }))
        get().logAudit({
          actor: actor.username,
          role: actor.role,
          action: "Dataset Uploaded",
          details: `${fileName} (${parsed.rows.length} rows, ${parsed.columns.length} columns)`,
          category: "dataset",
        })
      },
      removeDataset: (id, actor) => {
        const ds = get().datasets.find((d) => d.id === id)
        set((s) => ({ datasets: s.datasets.filter((d) => d.id !== id) }))
        if (ds) {
          get().logAudit({
            actor: actor.username,
            role: actor.role,
            action: "Dataset Deleted",
            details: `Removed dataset ${ds.fileName}`,
            category: "dataset",
          })
        }
      },

      models: SEED_MODELS,
      addModel: (model, actor) => {
        const record: ModelRecord = {
          ...model,
          id: `model-${Date.now()}`,
          isSelected: false,
          uploadedAt: nowIso(),
        }
        set((s) => ({ models: [record, ...s.models] }))
        get().logAudit({
          actor: actor.username,
          role: actor.role,
          action: "Model Uploaded",
          details: `${model.fileName} (${model.algorithm})`,
          category: "model",
        })
      },
      removeModel: (id, actor) => {
        const model = get().models.find((m) => m.id === id)
        set((s) => ({ models: s.models.filter((m) => m.id !== id) }))
        if (model) {
          get().logAudit({
            actor: actor.username,
            role: actor.role,
            action: "Model Deleted",
            details: `Removed model ${model.fileName}`,
            category: "model",
          })
        }
      },
      selectModel: (id, actor) => {
        set((s) => ({ models: s.models.map((m) => ({ ...m, isSelected: m.id === id })) }))
        const model = get().models.find((m) => m.id === id)
        if (model) {
          get().logAudit({
            actor: actor.username,
            role: actor.role,
            action: "Model Deployed",
            details: `Selected ${model.fileName} for live prediction`,
            category: "model",
          })
        }
      },

      prediction: emptyPrediction,
      setInput: (featureId, value) =>
        set((s) => ({ prediction: { ...s.prediction, inputs: { ...s.prediction.inputs, [featureId]: value } } })),
      runPrediction: () => {
        const { features, prediction } = get()
        const derived = computeDerivedValues(features, prediction.inputs)
        const result = predictSLR(features, prediction.inputs)
        set({
          prediction: {
            ...prediction,
            derived,
            predictedSLR: result?.predictedSLR ?? null,
            contributions: result?.contributions ?? {},
          },
        })
      },
      seedPredictionInputs: (values) =>
        set((s) => ({ prediction: { ...s.prediction, inputs: { ...s.prediction.inputs, ...values } } })),

      whatIf: emptyWhatIf,
      setSliderDelta: (featureId, pct) =>
        set((s) => ({ whatIf: { ...s.whatIf, sliderDeltaPct: { ...s.whatIf.sliderDeltaPct, [featureId]: pct } } })),
      resetSliders: () => set({ whatIf: emptyWhatIf }),
      runWhatIfCalculation: () => {
        const { features, prediction, whatIf } = get()
        const simulatedInputs: Record<string, number | null> = { ...prediction.inputs }
        for (const [featureId, pct] of Object.entries(whatIf.sliderDeltaPct)) {
          const base = prediction.inputs[featureId]
          if (base !== null && base !== undefined) {
            simulatedInputs[featureId] = base * (1 + pct / 100)
          }
        }
        const result = predictSLR(features, simulatedInputs)
        set({
          whatIf: {
            ...whatIf,
            simulatedInputs,
            simulatedSLR: result?.predictedSLR ?? null,
          },
        })
      },

      auditLog: SEED_AUDIT_LOG,
      logAudit: (entry) =>
        set((s) => ({
          auditLog: [{ ...entry, id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: nowIso() }, ...s.auditLog],
        })),

      directory: SEED_DIRECTORY,
      elevateToAdmin: (username) => {
        set((s) => ({ directory: s.directory.map((d) => (d.username === username ? { ...d, role: "admin" } : d)) }))
        get().logAudit({
          actor: get().auth?.username ?? "master.rpg",
          role: "master",
          action: "Role Elevated",
          details: `Elevated ${username} to Admin`,
          category: "access",
        })
      },
      revokeAccess: (username) => {
        const masters = get().directory.filter((d) => d.role === "master" && d.status === "active")
        const target = get().directory.find((d) => d.username === username)
        if (target?.role === "master" && masters.length <= 1) return
        set((s) => ({ directory: s.directory.map((d) => (d.username === username ? { ...d, status: "revoked" } : d)) }))
        get().logAudit({
          actor: get().auth?.username ?? "master.rpg",
          role: "master",
          action: "Access Revoked",
          details: `Kill-switch triggered for ${username}`,
          category: "access",
        })
      },
      provisionAccount: (username, role) => {
        set((s) => ({
          directory: [
            { username, role, status: "active", lastSeen: nowIso(), sessionToken: `tok_${Math.random().toString(36).slice(2, 6)}` },
            ...s.directory,
          ],
        }))
        get().logAudit({
          actor: get().auth?.username ?? "master.rpg",
          role: "master",
          action: "Account Provisioned",
          details: `Created account ${username} (role: ${role})`,
          category: "provision",
        })
      },

      resetToSampleData: () =>
        set({
          features: SEED_FEATURES,
          datasets: SEED_DATASETS,
          models: SEED_MODELS,
          auditLog: SEED_AUDIT_LOG,
          directory: SEED_DIRECTORY,
          prediction: emptyPrediction,
          whatIf: emptyWhatIf,
        }),
    }),
    {
      name: "ceat-slr-simulator-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
