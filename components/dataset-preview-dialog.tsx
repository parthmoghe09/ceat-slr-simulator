"use client"

import { useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DatasetRecord } from "@/lib/sample-data"
import { cn } from "@/lib/utils"

const PREVIEW_ROWS = 8
const PREVIEW_COLS = 6

export function DatasetPreviewDialog({ dataset, trigger }: { dataset: DatasetRecord; trigger: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)

  const columns = dataset.columns.slice(0, PREVIEW_COLS)
  const rows = dataset.rows.slice(0, PREVIEW_ROWS)

  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className={cn("transition-all", expanded ? "h-[90vh] w-[95vw] max-w-none" : "sm:max-w-2xl")}>
        <DialogHeader className="flex-row items-start justify-between gap-4 pr-8">
          <div>
            <DialogTitle>{dataset.fileName}</DialogTitle>
            <DialogDescription>
              Previewing top {Math.min(PREVIEW_ROWS, dataset.rows.length)} rows × {columns.length} of {dataset.columns.length} columns
            </DialogDescription>
          </div>
          <Button size="icon" variant="ghost" className="size-8" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </DialogHeader>
        <div className={cn("overflow-auto rounded-md border", expanded ? "h-[calc(90vh-8rem)]" : "max-h-96")}>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c} className="whitespace-nowrap">
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((c, ci) => (
                    <TableCell key={c} className="whitespace-nowrap font-mono text-xs">
                      {row[ci]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
