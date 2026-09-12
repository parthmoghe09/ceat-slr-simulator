"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

const ALGORITHMS = ["Gradient Boosting Regressor", "Random Forest Regressor", "Neural Network (MLP)", "Linear Regression"]

function mockHyperparameters(algorithm: string): Record<string, string | number> {
  switch (algorithm) {
    case "Gradient Boosting Regressor":
      return { n_estimators: 200 + Math.floor(Math.random() * 200), max_depth: 3 + Math.floor(Math.random() * 4), learning_rate: 0.03 + Math.random() * 0.07 }
    case "Random Forest Regressor":
      return { n_estimators: 300 + Math.floor(Math.random() * 300), max_depth: 6 + Math.floor(Math.random() * 6), min_samples_leaf: 2 + Math.floor(Math.random() * 4) }
    case "Neural Network (MLP)":
      return { hidden_layers: "128,64,32", activation: "relu", epochs: 150 + Math.floor(Math.random() * 100), batch_size: 32 }
    default:
      return { fit_intercept: "true", normalize: "true" }
  }
}

function mockMetrics() {
  return {
    mae: Math.round((1.4 + Math.random() * 1.2) * 100) / 100,
    rmse: Math.round((1.9 + Math.random() * 1.4) * 100) / 100,
    r2: Math.round((0.88 + Math.random() * 0.09) * 1000) / 1000,
    mape: Math.round((1.5 + Math.random() * 1.8) * 100) / 100,
  }
}

export function UploadModelDialog() {
  const auth = useAppStore((s) => s.auth)
  const datasets = useAppStore((s) => s.datasets)
  const addModel = useAppStore((s) => s.addModel)
  const features = useAppStore((s) => s.features)

  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [algorithm, setAlgorithm] = useState(ALGORITHMS[0])
  const [datasetId, setDatasetId] = useState("")

  function handleUpload() {
    if (!auth || !fileName.trim() || !datasetId) {
      toast.error("Provide a file name and select an associated dataset.")
      return
    }
    addModel(
      {
        fileName: fileName.trim(),
        datasetId,
        algorithm,
        hyperparameters: mockHyperparameters(algorithm),
        metrics: mockMetrics(),
        featureIds: features.map((f) => f.id),
      },
      auth,
    )
    toast.success(`${fileName} uploaded with generated metrics`)
    setOpen(false)
    setFileName("")
    setDatasetId("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="size-4" />
          Upload Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Model</DialogTitle>
          <DialogDescription>
            No in-browser training is available in this template — accuracy metrics and hyperparameters are
            auto-generated for demonstration.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Model file name</Label>
            <Input placeholder="e.g. slr_gbr_model_v4.pkl" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Algorithm</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALGORITHMS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Associated dataset</Label>
            <Select value={datasetId} onValueChange={setDatasetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload}>Upload &amp; Generate Metrics</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
