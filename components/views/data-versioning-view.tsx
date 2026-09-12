"use client"

import { useState } from "react"
import { Eye, FileStack, Info, Trash2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DatasetPreviewDialog } from "@/components/dataset-preview-dialog"
import { DatasetDetailsSheet } from "@/components/dataset-details-sheet"
import { UploadDatasetDialog } from "@/components/upload-dataset-dialog"
import { DatasetCompareMatrix } from "@/components/dataset-compare-matrix"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"
import { toast } from "sonner"

const MAX_COMPARE = 4

export function DataVersioningView({ role }: { role: UserRole }) {
  const auth = useAppStore((s) => s.auth)
  const datasets = useAppStore((s) => s.datasets)
  const removeDataset = useAppStore((s) => s.removeDataset)

  const [selected, setSelected] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} datasets at once.`)
        return prev
      }
      return [...prev, id]
    })
  }

  const selectedDatasets = datasets.filter((d) => selected.includes(d.id))

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader title="Data Versioning" description="Manage and inspect training datasets" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {datasets.length} dataset{datasets.length === 1 ? "" : "s"} available. Select up to {MAX_COMPARE} to compare.
          </p>
          <div className="flex items-center gap-2">
            {selected.length >= 2 && (
              <Button size="sm" variant="secondary" onClick={() => setCompareOpen(true)}>
                <FileStack className="size-4" />
                Compare Selected ({selected.length})
              </Button>
            )}
            <UploadDatasetDialog />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <Card key={d.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.fileName}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.modelFileName}</p>
                </div>
                <Checkbox checked={selected.includes(d.id)} onCheckedChange={() => toggleSelect(d.id)} />
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[11px]">
                    {d.rows.length} rows
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {d.columns.length} columns
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Uploaded {new Date(d.uploadedAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <DatasetPreviewDialog
                  dataset={d}
                  trigger={
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="size-3.5" />
                      Preview
                    </Button>
                  }
                />
                <DatasetDetailsSheet
                  dataset={d}
                  trigger={
                    <Button size="sm" variant="outline" className="flex-1">
                      <Info className="size-3.5" />
                      Details
                    </Button>
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8 shrink-0 text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {d.fileName}?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove the dataset from the platform.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => auth && removeDataset(d.id, auth)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <DatasetCompareMatrix datasets={selectedDatasets} open={compareOpen} onOpenChange={setCompareOpen} />
    </div>
  )
}
