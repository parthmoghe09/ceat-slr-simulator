"use client"

import { Bar, BarChart, CartesianGrid, RadialBar, RadialBarChart, PolarAngleAxis, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { ModelMetrics } from "@/lib/sample-data"

const errorConfig: ChartConfig = {
  value: { label: "Value", color: "var(--chart-1)" },
}

export function ModelErrorMetricsChart({ metrics }: { metrics: ModelMetrics }) {
  const data = [
    { name: "MAE", value: metrics.mae },
    { name: "RMSE", value: metrics.rmse },
    { name: "MAPE (%)", value: metrics.mape },
  ]
  return (
    <ChartContainer config={errorConfig} className="h-[200px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function ModelR2Gauge({ r2 }: { r2: number }) {
  const data = [{ name: "R²", value: r2 * 100, fill: "var(--chart-1)" }]
  return (
    <ChartContainer config={{ value: { label: "R²", color: "var(--chart-1)" } }} className="mx-auto h-[160px] w-[160px]">
      <RadialBarChart data={data} startAngle={90} endAngle={-270} innerRadius={50} outerRadius={70}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" cornerRadius={8} background />
      </RadialBarChart>
    </ChartContainer>
  )
}
