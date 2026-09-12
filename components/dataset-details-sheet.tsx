"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { StatTable, DistinctValueTable } from "@/components/stat-table"
import type { DatasetRecord } from "@/lib/sample-data"

export function DatasetDetailsSheet({ dataset, trigger }: { dataset: DatasetRecord; trigger: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent side="top" className="h-[85vh] gap-0 overflow-y-auto sm:max-w-none">
        <SheetHeader>
          <SheetTitle>{dataset.fileName}</SheetTitle>
          <SheetDescription>Feature list and column-wise statistical distribution.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-6">
          <div>
            <h3 className="mb-2 text-sm font-medium">Feature list ({dataset.columns.length})</h3>
            <div className="flex flex-wrap gap-1.5">
              {dataset.columns.map((c) => (
                <Badge key={c} variant="secondary" className="font-mono text-[11px]">
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Feature-wise visual statistics</h3>
            <StatTable stats={dataset.stats} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Distinct value counts</h3>
            <DistinctValueTable stats={dataset.stats} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
