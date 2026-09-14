"use client"

import { useMemo } from "react"
import { Gauge, Sigma, RotateCcw } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ManageFeaturesSheet } from "@/components/manage-features-sheet"
import { FeatureContributionChart } from "@/components/feature-contribution-chart"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"
import { formatPostfixExpression } from "@/lib/postfix"

export function SlrPredictionView({ role }: { role: UserRole }) {
  const features = useAppStore((s) => s.features)
  const prediction = useAppStore((s) => s.prediction)
  const setInput = useAppStore((s) => s.setInput)
  const runPrediction = useAppStore((s) => s.runPrediction)

  const independentFeatures = features.filter((f) => f.kind === "independent")
  const derivedFeatures = features.filter((f) => f.kind === "derived")
  const isAdmin = role === "admin" || role === "master"

  const allFilled = independentFeatures.every(
    (f) => prediction.inputs[f.id] !== undefined && prediction.inputs[f.id] !== null,
  )

  const contributionData = useMemo(
    () =>
      features.map((f) => ({
        id: f.id,
        name: f.name,
        value: prediction.contributions[f.id] ?? 0,
      })),
    [features, prediction.contributions],
  )

  function handleReset() {
    for (const f of independentFeatures) setInput(f.id, null)
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader title="SLR Prediction" description="AI-driven Static Loaded Radius estimation" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {isAdmin && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configure the engineering features used to drive the prediction model.
            </p>
            <ManageFeaturesSheet />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Engineering Features</CardTitle>
              <CardDescription>Enter measured input values for each independent feature.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {independentFeatures.map((f) => (
                  <div key={f.id} className="flex flex-col gap-1.5">
                    <Label htmlFor={f.id}>
                      {f.name} <span className="text-muted-foreground">({f.unit})</span>
                    </Label>
                    <Input
                      id={f.id}
                      type="number"
                      placeholder={`${f.min} – ${f.max}`}
                      value={prediction.inputs[f.id] ?? ""}
                      onChange={(e) => setInput(f.id, e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Derived Features</CardTitle>
              <CardDescription>Automatically computed from the inputs above — read only.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {derivedFeatures.length === 0 && (
                  <p className="text-sm text-muted-foreground">No derived features configured.</p>
                )}
                {derivedFeatures.map((f) => (
                  <Tooltip key={f.id}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col gap-1.5">
                        <Label className="flex items-center gap-1.5">
                          <Sigma className="size-3.5 text-muted-foreground" />
                          {f.name} <span className="text-muted-foreground">({f.unit})</span>
                        </Label>
                        <Input value={prediction.derived[f.id]?.toFixed(3) ?? "—"} disabled readOnly className="font-mono" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{f.formula ? formatPostfixExpression(f.formula) : "No formula"}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={runPrediction} disabled={!allFilled}>
            <Gauge className="size-4" />
            Predict SLR
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          {!allFilled && <span className="text-xs text-muted-foreground">Fill in all engineering features to run a prediction.</span>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Predicted SLR Output</CardTitle>
            <CardDescription>Feature-wise contribution to the predicted static loaded radius.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/20 p-6 shadow-inner">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Predicted SLR</span>
                <span className="font-mono text-4xl font-bold tabular-nums text-accent">
                  {prediction.predictedSLR !== null ? prediction.predictedSLR.toFixed(2) : "—"}
                </span>
                <span className="text-xs font-medium text-muted-foreground">millimeters</span>
              </div>
              <div>
                {prediction.predictedSLR !== null ? (
                  <FeatureContributionChart data={contributionData} />
                ) : (
                  <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                    Run a prediction to see feature-wise contribution.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
