"use client"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

export function UploadDatasetDialog() {
  const auth = useAppStore((s) => s.auth)
  const addDataset = useAppStore((s) => s.addDataset)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [modelFileName, setModelFileName] = useState("")
  const [csvText, setCsvText] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setCsvText(String(reader.result))
    reader.readAsText(file)
  }

  function handleUpload() {
    if (!auth || !csvText || !fileName) {
      toast.error("Select a CSV file to upload.")
      return
    }
    addDataset(fileName, modelFileName.trim() || "unassigned", csvText, auth)
    toast.success(`${fileName} uploaded`)
    setOpen(false)
    setFileName("")
    setModelFileName("")
    setCsvText(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="size-4" />
          Upload Dataset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Dataset</DialogTitle>
          <DialogDescription>Upload a CSV file — columns and statistics are computed automatically.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>CSV file</Label>
            <Input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFile} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Associated model file name (optional)</Label>
            <Input
              placeholder="e.g. slr_model_v3.pkl"
              value={modelFileName}
              onChange={(e) => setModelFileName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={!csvText}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
