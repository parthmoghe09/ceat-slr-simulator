"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { StatSummary } from "@/lib/csv-stats"

function fmt(v: number | null) {
  return v === null || v === undefined ? "—" : v.toFixed(3)
}

export function StatTable({ stats }: { stats: Record<string, StatSummary> }) {
  const columns = Object.keys(stats)
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Metric</TableHead>
            {columns.map((c) => (
              <TableHead key={c} className="whitespace-nowrap text-right">
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {(
            [
              ["Count", (s: StatSummary) => String(s.count)],
              ["Min", (s: StatSummary) => fmt(s.min)],
              ["Max", (s: StatSummary) => fmt(s.max)],
              ["Mean", (s: StatSummary) => fmt(s.mean)],
              ["Q1", (s: StatSummary) => fmt(s.q1)],
              ["Q2 (Median)", (s: StatSummary) => fmt(s.q2)],
              ["Q3", (s: StatSummary) => fmt(s.q3)],
              ["Mode", (s: StatSummary) => s.mode ?? "—"],
              ["Std Dev", (s: StatSummary) => fmt(s.stddev)],
              ["Variance", (s: StatSummary) => fmt(s.variance)],
            ] as [string, (s: StatSummary) => string][]
          ).map(([label, getter]) => (
            <TableRow key={label}>
              <TableCell className="whitespace-nowrap font-medium text-muted-foreground">{label}</TableCell>
              {columns.map((c) => (
                <TableCell key={c} className="whitespace-nowrap text-right font-mono text-xs">
                  {getter(stats[c])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function DistinctValueTable({ stats }: { stats: Record<string, StatSummary> }) {
  const columns = Object.keys(stats)
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {columns.map((c) => (
        <div key={c} className="rounded-md border p-3">
          <p className="mb-2 text-xs font-medium">{c}</p>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
            {stats[c].distinct.map((d) => (
              <div key={d.value} className="flex items-center justify-between text-[11px]">
                <span className="truncate text-muted-foreground">{d.value}</span>
                <span className="font-mono">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
