"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface GradeDistributionChartProps {
  data: { grade: string; count: number }[]
}

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const chartConfig = {
    count: {
      label: "Number of Students",
      color: "hsl(var(--chart-2))",
    },
    grade: {
      label: "Grade",
    },
  } as const

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="grade" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
