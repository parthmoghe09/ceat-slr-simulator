"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DatasetRecord } from "@/lib/sample-data"

const METRIC_ROWS: [string, (s: import("@/lib/csv-stats").StatSummary) => string][] = [
  ["Count", (s) => String(s.count)],
  ["Min", (s) => (s.min !== null ? s.min.toFixed(2) : "—")],
  ["Max", (s) => (s.max !== null ? s.max.toFixed(2) : "—")],
  ["Mean", (s) => (s.mean !== null ? s.mean.toFixed(2) : "—")],
  ["Q1", (s) => (s.q1 !== null ? s.q1.toFixed(2) : "—")],
  ["Q2", (s) => (s.q2 !== null ? s.q2.toFixed(2) : "—")],
  ["Q3", (s) => (s.q3 !== null ? s.q3.toFixed(2) : "—")],
  ["Mode", (s) => s.mode ?? "—"],
  ["Std Dev", (s) => (s.stddev !== null ? s.stddev.toFixed(2) : "—")],
  ["Variance", (s) => (s.variance !== null ? s.variance.toFixed(2) : "—")],
]

export function DatasetCompareMatrix({
  datasets,
  open,
  onOpenChange,
}: {
  datasets: DatasetRecord[]
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const allColumns = Array.from(new Set(datasets.flatMap((d) => d.columns)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] max-w-none">
        <DialogHeader>
          <DialogTitle>Dataset Comparison Matrix</DialogTitle>
          <DialogDescription>Side-by-side technical comparison of {datasets.length} selected datasets.</DialogDescription>
        </DialogHeader>
        <div className="overflow-auto">
          <div className="mb-4 grid gap-3" style={{ gridTemplateColumns: `160px repeat(${datasets.length}, minmax(180px, 1fr))` }}>
            <div />
            {datasets.map((d) => (
              <div key={d.id} className="rounded-md border bg-muted/30 p-2">
                <p className="truncate text-xs font-semibold">{d.fileName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{d.modelFileName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {d.rows.length} rows × {d.columns.length} cols
                </p>
              </div>
            ))}
          </div>

          {allColumns.map((col) => (
            <div key={col} className="mb-4">
              <p className="mb-1.5 font-mono text-xs font-semibold text-muted-foreground">{col}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Metric</TableHead>
                    {datasets.map((d) => (
                      <TableHead key={d.id} className="text-right">
                        {d.fileName}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {METRIC_ROWS.map(([label, getter]) => (
                    <TableRow key={label}>
                      <TableCell className="text-muted-foreground">{label}</TableCell>
                      {datasets.map((d) => (
                        <TableCell key={d.id} className="text-right font-mono text-xs">
                          {d.stats[col] ? getter(d.stats[col]) : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
