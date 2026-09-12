"use client"

// Helper formula generator for derived features: build a postfix (RPN)
// expression by adding operands (features or constants) first, then
// appending operators. Chips render in order; the trailing "remove last"
// action keeps the stack-based construction obvious.

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  POSTFIX_OPERATORS,
  evaluatePostfix,
  isValidPostfix,
  tokenLabel,
  type PostfixOperator,
  type PostfixToken,
} from "@/lib/postfix"
import type { EngineeringFeature } from "@/lib/sample-data"

export function PostfixFormulaBuilder({
  features,
  tokens,
  onChange,
}: {
  features: EngineeringFeature[]
  tokens: PostfixToken[]
  onChange: (tokens: PostfixToken[]) => void
}) {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("")
  const [constantValue, setConstantValue] = useState("")

  const previewValues: Record<string, number> = {}
  for (const f of features) {
    previewValues[f.id] = f.min !== undefined && f.max !== undefined ? (f.min + f.max) / 2 : 1
  }
  const preview = tokens.length ? evaluatePostfix(tokens, previewValues) : null
  const valid = isValidPostfix(tokens)

  function addFeatureOperand() {
    const feature = features.find((f) => f.id === selectedFeatureId)
    if (!feature) return
    onChange([...tokens, { type: "feature", featureId: feature.id, label: feature.name }])
    setSelectedFeatureId("")
  }

  function addConstantOperand() {
    const num = Number(constantValue)
    if (Number.isNaN(num)) return
    onChange([...tokens, { type: "constant", value: num }])
    setConstantValue("")
  }

  function addOperator(op: PostfixOperator) {
    onChange([...tokens, { type: "operator", op }])
  }

  function removeLast() {
    onChange(tokens.slice(0, -1))
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-background p-2 min-h-11">
        {tokens.length === 0 && (
          <span className="text-xs text-muted-foreground px-1">
            Add operands (features / constants) first, then operators.
          </span>
        )}
        {tokens.map((t, i) => (
          <Badge key={i} variant={t.type === "operator" ? "default" : "secondary"} className="font-mono text-xs">
            {tokenLabel(t)}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">Feature operand</span>
          <div className="flex gap-1.5">
            <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue placeholder="Select feature" />
              </SelectTrigger>
              <SelectContent>
                {features.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" size="sm" variant="outline" onClick={addFeatureOperand} disabled={!selectedFeatureId}>
              Add
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">Constant operand</span>
          <div className="flex gap-1.5">
            <Input
              type="number"
              placeholder="e.g. 9.81"
              value={constantValue}
              onChange={(e) => setConstantValue(e.target.value)}
              className="h-8 w-28"
            />
            <Button type="button" size="sm" variant="outline" onClick={addConstantOperand} disabled={constantValue === ""}>
              Add
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">Operators</span>
          <div className="flex gap-1">
            {POSTFIX_OPERATORS.map((op) => (
              <Button key={op} type="button" size="sm" variant="secondary" className="w-8 px-0 font-mono" onClick={() => addOperator(op)}>
                {op}
              </Button>
            ))}
          </div>
        </div>

        <Button type="button" size="sm" variant="ghost" onClick={removeLast} disabled={tokens.length === 0}>
          <X className="size-3.5" />
          Remove last
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={valid ? "text-muted-foreground" : "text-destructive"}>
          {valid ? "Valid postfix expression" : "Expression incomplete or invalid"}
        </span>
        {valid && preview !== null && <span className="font-mono text-muted-foreground">Preview @ mid-range ≈ {preview.toFixed(3)}</span>}
      </div>
    </div>
  )
}
