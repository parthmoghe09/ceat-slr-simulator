"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { ModelRecord } from "@/lib/sample-data"

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

export function ModelCompareBenchmark({
  models,
  open,
  onOpenChange,
}: {
  models: ModelRecord[]
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const allHyperparamKeys = Array.from(new Set(models.flatMap((m) => Object.keys(m.hyperparameters))))

  const metricConfig: ChartConfig = Object.fromEntries(
    models.map((m, i) => [m.id, { label: m.fileName, color: CHART_COLORS[i % CHART_COLORS.length] }]),
  )

  const metricRows: { metric: string; data: Record<string, number | string> }[] = [
    { metric: "MAE", data: Object.fromEntries(models.map((m) => [m.id, m.metrics.mae])) },
    { metric: "RMSE", data: Object.fromEntries(models.map((m) => [m.id, m.metrics.rmse])) },
    { metric: "R²", data: Object.fromEntries(models.map((m) => [m.id, m.metrics.r2])) },
    { metric: "MAPE", data: Object.fromEntries(models.map((m) => [m.id, m.metrics.mape])) },
  ]

  const chartData = metricRows.map((row) => ({ name: row.metric, ...row.data }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-none">
        <DialogHeader>
          <DialogTitle>Model Benchmarking Suite</DialogTitle>
          <DialogDescription>Parallel comparison of {models.length} candidate models.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 overflow-auto">
          <div className="grid gap-3" style={{ gridTemplateColumns: `160px repeat(${models.length}, minmax(180px, 1fr))` }}>
            <div />
            {models.map((m) => (
              <div key={m.id} className="rounded-md border bg-muted/30 p-2">
                <p className="truncate text-xs font-semibold">{m.fileName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{m.algorithm}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Hyperparameter matrix</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Parameter</TableHead>
                  {models.map((m) => (
                    <TableHead key={m.id} className="text-right">
                      {m.fileName}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allHyperparamKeys.map((key) => (
                  <TableRow key={key}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{key}</TableCell>
                    {models.map((m) => (
                      <TableCell key={m.id} className="text-right font-mono text-xs">
                        {m.hyperparameters[key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Validation metrics</h3>
            <ChartContainer config={metricConfig} className="h-[280px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {models.map((m, i) => (
                  <Bar key={m.id} dataKey={m.id} name={m.fileName} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={4} />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
