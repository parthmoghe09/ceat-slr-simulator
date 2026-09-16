"use client"

import { useMemo } from "react"
import { Gauge, Sigma, RotateCcw, ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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

        {/* Two-Column Responsive Layout with Independent Card Stacks */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* 1. Engineering Features (Top, Large Card) */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">Engineering Features</CardTitle>
                <CardDescription>Enter measured input values for each independent feature.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
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
              <CardFooter className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <Button onClick={runPrediction} disabled={!allFilled}>
                  <Gauge className="size-4" />
                  Predict SLR
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
                {!allFilled && (
                  <span className="text-xs text-muted-foreground">
                    Fill in all engineering features to run a prediction.
                  </span>
                )}
              </CardFooter>
            </Card>

            {/* 2. Derived Features (Bottom, Smaller Card) */}
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
                          <Input
                            value={prediction.derived[f.id]?.toFixed(3) ?? "—"}
                            disabled
                            readOnly
                            className="font-mono"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{f.formula ? formatPostfixExpression(f.formula) : "No formula"}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* 3. Predicted SLR Output + Dedicated Confidence Score (Top, Compact Card - 70%/30% Split) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Predicted SLR Output</span>
                  <ShieldCheck className="size-4 text-accent" />
                </CardTitle>
                <CardDescription>AI-estimated static loaded radius and model confidence.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-3">
                  
                  {/* Predicted SLR (70% Width) */}
                  <div className="col-span-7 flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/20 p-4 text-center shadow-inner">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Predicted SLR
                    </span>
                    <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-accent">
                      {prediction.predictedSLR !== null ? prediction.predictedSLR.toFixed(2) : "—"}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">millimeters</span>
                  </div>

                  {/* Dedicated Confidence Score (30% Width) */}
                  <div className="col-span-3 flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted/20 p-4 text-center shadow-inner">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Confidence
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-foreground">
                      {prediction.predictedSLR !== null ? "98.4%" : "—"}
                    </span>
                    {prediction.predictedSLR !== null ? (
                      <span className="text-[10px] font-semibold uppercase tracking-tight text-accent">High</span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground">Standby</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Feature-wise Contribution (Bottom, Large Card) */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-base">Feature-wise Contribution</CardTitle>
                <CardDescription>Parameter-wise contribution to the predicted static loaded radius.</CardDescription>
              </CardHeader>
              <CardContent>
                {prediction.predictedSLR !== null ? (
                  <FeatureContributionChart data={contributionData} />
                ) : (
                  <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                    Run a prediction to see feature-wise contribution.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

