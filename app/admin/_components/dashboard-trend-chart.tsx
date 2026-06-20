"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardSeriesPoint } from "@/lib/ecommerce-data";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "oklch(0.64 0.17 160)",
  },
  profit: {
    label: "Profit",
    color: "oklch(0.75 0.15 86)",
  },
} satisfies ChartConfig;

export function DashboardTrendChart({
  data,
}: {
  data: DashboardSeriesPoint[];
}) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={42} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="var(--color-revenue)"
          fillOpacity={0.12}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke="var(--color-profit)"
          fill="var(--color-profit)"
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
