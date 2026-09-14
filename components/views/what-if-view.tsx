"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Calculator, FileSearch, RotateCcw } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BaselineVsSimulationChart } from "@/components/baseline-vs-simulation-chart"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"

const TOP_N = 5

export function WhatIfView({ role }: { role: UserRole }) {
  const router = useRouter()
  const features = useAppStore((s) => s.features)
  const prediction = useAppStore((s) => s.prediction)
  const whatIf = useAppStore((s) => s.whatIf)
  const setSliderDelta = useAppStore((s) => s.setSliderDelta)
  const resetSliders = useAppStore((s) => s.resetSliders)
  const runWhatIfCalculation = useAppStore((s) => s.runWhatIfCalculation)
  const seedPredictionInputs = useAppStore((s) => s.seedPredictionInputs)

  const hasBaseline = prediction.predictedSLR !== null

  const topFeatures = useMemo(() => {
    if (!hasBaseline) return []
    return [...features]
      .filter((f) => f.kind === "independent")
      .sort((a, b) => Math.abs(prediction.contributions[b.id] ?? 0) - Math.abs(prediction.contributions[a.id] ?? 0))
      .slice(0, TOP_N)
  }, [features, prediction.contributions, hasBaseline])

  const chartData = useMemo(
    () =>
      topFeatures.map((f) => {
        const baseline = prediction.inputs[f.id] ?? 0
        const simulated = whatIf.simulatedInputs[f.id] ?? baseline
        return { name: f.name, baseline, simulated }
      }),
    [topFeatures, prediction.inputs, whatIf.simulatedInputs],
  )

  function handleDetailedReport() {
    seedPredictionInputs(whatIf.simulatedInputs)
    router.push(`/${role}/slr-prediction`)
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader title="What-If Analysis" description="Isolate top contributing features and simulate outcomes" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {!hasBaseline ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium">No baseline prediction yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Run a prediction on the SLR Prediction page first — that result becomes the baseline for this
                simulation.
              </p>
              <Button className="mt-2" variant="outline" onClick={() => router.push(`/${role}/slr-prediction`)}>
                Go to SLR Prediction
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Isolated Parameter Controls</CardTitle>
                <CardDescription>
                  Top {TOP_N} features by contribution. Range is ±15% of the baseline input value.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  {topFeatures.map((f) => {
                    const baseline = prediction.inputs[f.id] ?? 0
                    const pct = whatIf.sliderDeltaPct[f.id] ?? 0
                    const currentValue = baseline * (1 + pct / 100)
                    return (
                      <div key={f.id} className="flex flex-col gap-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium">{f.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {currentValue.toFixed(2)} {f.unit} ({pct > 0 ? "+" : ""}
                            {pct.toFixed(0)}%)
                          </span>
                        </div>
                        <Slider
                          min={-15}
                          max={15}
                          step={1}
                          value={[pct]}
                          onValueChange={(val: any) => {
                            const v = Array.isArray(val) ? val[0] : val
                            if (typeof v === "number" && !isNaN(v)) {
                              setSliderDelta(f.id, v)
                            }
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Button onClick={runWhatIfCalculation}>
                    <Calculator className="size-4" />
                    Quick Calculate
                  </Button>
                  <Button variant="outline" onClick={resetSliders}>
                    <RotateCcw className="size-4" />
                    Reset Sliders
                  </Button>
                  {whatIf.simulatedSLR !== null && (
                    <Button variant="secondary" onClick={handleDetailedReport}>
                      <FileSearch className="size-4" />
                      Detailed Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Baseline vs Simulation</CardTitle>
                <CardDescription>Compare the simulated SLR and feature values against the baseline.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead className="text-right">Baseline</TableHead>
                          <TableHead className="text-right">Simulated</TableHead>
                          <TableHead className="text-right">Δ%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topFeatures.map((f) => {
                          const baseline = prediction.inputs[f.id] ?? 0
                          const pct = whatIf.sliderDeltaPct[f.id] ?? 0
                          const simulated = baseline * (1 + pct / 100)
                          return (
                            <TableRow key={f.id}>
                              <TableCell>{f.name}</TableCell>
                              <TableCell className="text-right font-mono">{baseline.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-mono">{simulated.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-mono">
                                {pct > 0 ? "+" : ""}
                                {pct.toFixed(0)}%
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow className="bg-muted/40 font-medium">
                          <TableCell>Predicted SLR (mm)</TableCell>
                          <TableCell className="text-right font-mono">{prediction.predictedSLR?.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">
                            {whatIf.simulatedSLR !== null ? whatIf.simulatedSLR.toFixed(2) : "—"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {whatIf.simulatedSLR !== null && prediction.predictedSLR
                              ? `${(((whatIf.simulatedSLR - prediction.predictedSLR) / prediction.predictedSLR) * 100).toFixed(1)}%`
                              : "—"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <BaselineVsSimulationChart data={chartData} />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
