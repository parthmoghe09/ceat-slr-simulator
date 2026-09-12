// Client-side CSV parsing + per-column statistics computation.
// Real datasets uploaded by admin/master are parsed here so the whole app
// (feature min/max lookups, data-versioning detail panes, comparisons)
// works off real numbers instead of placeholders.

export interface StatSummary {
  count: number
  numericCount: number
  min: number | null
  max: number | null
  mean: number | null
  q1: number | null
  q2: number | null
  q3: number | null
  mode: string | null
  stddev: number | null
  variance: number | null
  distinct: { value: string; count: number }[]
}

function quantile(sorted: number[], q: number): number | null {
  if (sorted.length === 0) return null
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base])
  }
  return sorted[base]
}

export function computeColumnStats(values: string[]): StatSummary {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
  const numeric = nonEmpty.map((v) => Number(v)).filter((v) => !Number.isNaN(v))
  const sorted = [...numeric].sort((a, b) => a - b)

  const mean = numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : null
  const variance =
    mean !== null && numeric.length
      ? numeric.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / numeric.length
      : null
  const stddev = variance !== null ? Math.sqrt(variance) : null

  const freq = new Map<string, number>()
  for (const v of nonEmpty) {
    const key = String(v)
    freq.set(key, (freq.get(key) ?? 0) + 1)
  }
  const distinct = Array.from(freq.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)

  const mode = distinct.length ? distinct[0].value : null

  return {
    count: nonEmpty.length,
    numericCount: numeric.length,
    min: sorted.length ? sorted[0] : null,
    max: sorted.length ? sorted[sorted.length - 1] : null,
    mean,
    q1: quantile(sorted, 0.25),
    q2: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75),
    mode,
    stddev,
    variance,
    distinct: distinct.slice(0, 25),
  }
}

export interface ParsedDataset {
  columns: string[]
  rows: string[][]
  stats: Record<string, StatSummary>
}

/** Minimal, dependency-free CSV line parser (handles quoted fields with commas). */
function parseCsvText(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += char
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}

export function parseCsv(text: string): ParsedDataset {
  const allRows = parseCsvText(text)
  if (allRows.length === 0) return { columns: [], rows: [], stats: {} }

  const columns = allRows[0].map((c) => c.trim())
  const rows = allRows.slice(1)

  const stats: Record<string, StatSummary> = {}
  columns.forEach((col, idx) => {
    const columnValues = rows.map((r) => r[idx] ?? "")
    stats[col] = computeColumnStats(columnValues)
  })

  return { columns, rows, stats }
}

export function generateCsvFromRows(columns: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(",") ? `"${s}"` : s
  }
  return [columns.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n")
}
