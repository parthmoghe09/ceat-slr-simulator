"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export interface ContributionDatum {
  id: string
  name: string
  value: number
}

export function FeatureContributionChart({ data }: { data: ContributionDatum[] }) {
  const sorted = [...data].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

  const config: ChartConfig = {
    value: { label: "Contribution (mm)", color: "var(--chart-1)" },
  }

  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={140}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" radius={4}>
          {sorted.map((d) => (
            <Cell key={d.id} fill={d.value >= 0 ? "var(--chart-1)" : "var(--chart-4)"} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`}
            className="fill-foreground text-[11px]"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
