"use client"

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

export interface BaselineVsSimDatum {
  name: string
  baseline: number
  simulated: number
}

const config: ChartConfig = {
  baseline: { label: "Baseline", color: "var(--chart-2)" },
  simulated: { label: "Simulation", color: "var(--chart-1)" },
}

export function BaselineVsSimulationChart({ data }: { data: BaselineVsSimDatum[] }) {
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <BarChart data={data} margin={{ top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="baseline" fill="var(--color-baseline)" radius={4} />
        <Bar dataKey="simulated" fill="var(--color-simulated)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
