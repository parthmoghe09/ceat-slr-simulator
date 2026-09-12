"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ModelErrorMetricsChart, ModelR2Gauge } from "@/components/model-metrics-chart"
import type { ModelRecord } from "@/lib/sample-data"

export function ModelDetailsSheet({ model, trigger }: { model: ModelRecord; trigger: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent side="top" className="h-[85vh] gap-0 overflow-y-auto sm:max-w-none">
        <SheetHeader>
          <SheetTitle>{model.fileName}</SheetTitle>
          <SheetDescription>{model.algorithm} — trained on associated dataset</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-6">
          <div>
            <h3 className="mb-2 text-sm font-medium">Hyperparameters</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(model.hyperparameters).map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className="font-mono text-xs">{k}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{v}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Feature list used ({model.featureIds.length})</h3>
            <div className="flex flex-wrap gap-1.5">
              {model.featureIds.map((f) => (
                <Badge key={f} variant="secondary" className="font-mono text-[11px]">
                  {f}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium">Error metrics</h3>
              <ModelErrorMetricsChart metrics={model.metrics} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">R² score</h3>
              <div className="flex flex-col items-center">
                <ModelR2Gauge r2={model.metrics.r2} />
                <span className="font-mono text-lg font-semibold">{model.metrics.r2.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
