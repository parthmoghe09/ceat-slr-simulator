"use client"

import { useState } from "react"
import { CheckCircle2, FileStack, Info, Trash2 } from "lucide-react"
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
import { ModelDetailsSheet } from "@/components/model-details-sheet"
import { UploadModelDialog } from "@/components/upload-model-dialog"
import { ModelCompareBenchmark } from "@/components/model-compare-benchmark"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"
import { toast } from "sonner"

const MAX_COMPARE = 4

export function ModelVersioningView({ role }: { role: UserRole }) {
  const auth = useAppStore((s) => s.auth)
  const models = useAppStore((s) => s.models)
  const datasets = useAppStore((s) => s.datasets)
  const removeModel = useAppStore((s) => s.removeModel)
  const selectModel = useAppStore((s) => s.selectModel)

  const [selected, setSelected] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} models at once.`)
        return prev
      }
      return [...prev, id]
    })
  }

  function handleSelectModel(id: string, fileName: string) {
    if (!auth) return
    selectModel(id, auth)
    toast.success(`${fileName} is now deployed for live prediction`, {
      description: "Make sure the feature list matches what this model was trained on.",
    })
  }

  const datasetName = (id: string) => datasets.find((d) => d.id === id)?.fileName ?? "unknown dataset"
  const selectedModels = models.filter((m) => selected.includes(m.id))

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader title="Model Versioning" description="Manage, benchmark, and deploy prediction models" />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {models.length} model{models.length === 1 ? "" : "s"} available. Select up to {MAX_COMPARE} to benchmark.
          </p>
          <div className="flex items-center gap-2">
            {selected.length >= 2 && (
              <Button size="sm" variant="secondary" onClick={() => setCompareOpen(true)}>
                <FileStack className="size-4" />
                Compare Selected ({selected.length})
              </Button>
            )}
            <UploadModelDialog />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.fileName}</p>
                  <p className="truncate text-xs text-muted-foreground">{datasetName(m.datasetId)}</p>
                </div>
                <Checkbox checked={selected.includes(m.id)} onCheckedChange={() => toggleSelect(m.id)} />
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-[11px]">
                    {m.algorithm}
                  </Badge>
                  {m.isSelected && (
                    <Badge className="gap-1 text-[11px]">
                      <CheckCircle2 className="size-3" />
                      Live
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                  <span>MAE: {m.metrics.mae.toFixed(2)}</span>
                  <span>RMSE: {m.metrics.rmse.toFixed(2)}</span>
                  <span>R²: {m.metrics.r2.toFixed(3)}</span>
                  <span>MAPE: {m.metrics.mape.toFixed(2)}%</span>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <ModelDetailsSheet
                  model={m}
                  trigger={
                    <Button size="sm" variant="outline" className="flex-1">
                      <Info className="size-3.5" />
                      Details
                    </Button>
                  }
                />
                <Button
                  size="sm"
                  variant={m.isSelected ? "secondary" : "default"}
                  className="flex-1"
                  disabled={m.isSelected}
                  onClick={() => handleSelectModel(m.id, m.fileName)}
                >
                  {m.isSelected ? "Selected" : "Select"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8 shrink-0 text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {m.fileName}?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove the model from the platform.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => auth && removeModel(m.id, auth)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <ModelCompareBenchmark models={selectedModels} open={compareOpen} onOpenChange={setCompareOpen} />
    </div>
  )
}
