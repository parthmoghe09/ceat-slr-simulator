"use client"

import { useState } from "react"
import { Plus, Settings2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { PostfixFormulaBuilder } from "@/components/postfix-formula-builder"
import { useAppStore } from "@/lib/store"
import type { PostfixToken } from "@/lib/postfix"
import { isValidPostfix } from "@/lib/postfix"
import { toast } from "sonner"

export function ManageFeaturesSheet() {
  const auth = useAppStore((s) => s.auth)
  const features = useAppStore((s) => s.features)
  const datasets = useAppStore((s) => s.datasets)
  const addFeature = useAppStore((s) => s.addFeature)
  const removeFeature = useAppStore((s) => s.removeFeature)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("")
  const [kind, setKind] = useState<"independent" | "derived">("independent")
  const [datasetId, setDatasetId] = useState<string>("")
  const [columnName, setColumnName] = useState<string>("")
  const [formula, setFormula] = useState<PostfixToken[]>([])

  const selectedDataset = datasets.find((d) => d.id === datasetId)
  const numericColumns = selectedDataset?.columns.filter((c) => selectedDataset.stats[c]?.numericCount > 0) ?? []
  const columnStats = columnName ? selectedDataset?.stats[columnName] : undefined

  function resetForm() {
    setName("")
    setUnit("")
    setKind("independent")
    setDatasetId("")
    setColumnName("")
    setFormula([])
  }

  function handleAdd() {
    if (!auth || !name.trim()) return
    const id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")

    if (kind === "independent") {
      if (!columnStats) {
        toast.error("Select a dataset column to derive min/max from.")
        return
      }
      addFeature(
        {
          id,
          name: name.trim(),
          unit: unit.trim() || "-",
          kind: "independent",
          min: columnStats.min ?? 0,
          max: columnStats.max ?? 100,
          coefficient: 0.05,
          sourceDatasetId: datasetId,
        },
        auth,
      )
    } else {
      if (!isValidPostfix(formula)) {
        toast.error("Formula is not a valid postfix expression.")
        return
      }
      addFeature(
        {
          id,
          name: name.trim(),
          unit: unit.trim() || "-",
          kind: "derived",
          formula,
          coefficient: 0.05,
        },
        auth,
      )
    }
    toast.success(`Feature '${name}' added`)
    resetForm()
  }

  const independentFeatures = features.filter((f) => f.kind === "independent")

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetForm()
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" />
          Manage Features
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Manage Engineering Features</SheetTitle>
          <SheetDescription>Add or remove features used for SLR prediction input.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Current features</h3>
            <div className="flex flex-col gap-1.5">
              {features.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{f.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {f.kind === "independent" ? `${f.min} – ${f.max} ${f.unit}` : "derived"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.kind === "derived" ? "default" : "secondary"} className="text-[10px]">
                      {f.kind}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove '{f.name}'?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the feature from prediction inputs and any derived formulas depending on it may break.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => auth && removeFeature(f.id, auth)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-sm font-medium">Add new feature</h3>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tread Depth" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Unit</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. mm" />
                </div>
              </div>

              <Tabs value={kind} onValueChange={(v) => setKind(v as "independent" | "derived")}>
                <TabsList className="w-full">
                  <TabsTrigger value="independent" className="flex-1">
                    Independent
                  </TabsTrigger>
                  <TabsTrigger value="derived" className="flex-1">
                    Derived
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="independent" className="mt-3 flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Independent features fetch their min/max range from a dataset column.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Dataset</Label>
                      <Select value={datasetId} onValueChange={(v) => { setDatasetId(v); setColumnName("") }}>
                        <SelectTrigger size="sm">
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
                    <div className="flex flex-col gap-1.5">
                      <Label>Column</Label>
                      <Select value={columnName} onValueChange={setColumnName} disabled={!datasetId}>
                        <SelectTrigger size="sm">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {numericColumns.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {columnStats && (
                    <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      Fetched range: min {columnStats.min?.toFixed(2)} — max {columnStats.max?.toFixed(2)}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="derived" className="mt-3 flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    Build the formula in postfix (RPN) order: operands first, operators last.
                  </p>
                  <PostfixFormulaBuilder features={independentFeatures} tokens={formula} onChange={setFormula} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            <Plus className="size-4" />
            Add Feature
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
