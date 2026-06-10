"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { formatPercent } from "@/lib/utils";
import type { Model } from "@/lib/types";
import { blendedPrice } from "@/lib/demo/models";

interface Point {
  name: string;
  vendor: string;
  price: number;
  capability: number;
  availability: number;
  ttft: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <div className="mb-1 font-medium">{p.name}</div>
      <div className="space-y-0.5 text-muted-foreground">
        <div>厂商:{p.vendor}</div>
        <div>混合价:¥{p.price.toFixed(3)} / 千 token</div>
        <div>能力分:{p.capability}</div>
        <div>可用率:{formatPercent(p.availability)}</div>
        <div>TTFT:{p.ttft}ms</div>
      </div>
    </div>
  );
}

/** 比价图表:横轴混合价、纵轴能力分,气泡大小映射可用率。 */
export function PriceCompareChart({ models }: { models: Model[] }) {
  const data: Point[] = models.map((m) => ({
    name: m.name,
    vendor: m.vendor,
    price: blendedPrice(m),
    capability: m.capabilityScore,
    availability: m.availability,
    ttft: m.ttftMs,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 16, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          dataKey="price"
          name="混合价"
          unit="元"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          label={{
            value: "混合价(元/千 token)→ 越左越省",
            position: "insideBottom",
            offset: -8,
            fontSize: 12,
            fill: "hsl(var(--muted-foreground))",
          }}
        />
        <YAxis
          type="number"
          dataKey="capability"
          name="能力分"
          domain={[78, 98]}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          width={48}
          label={{
            value: "能力分",
            angle: -90,
            position: "insideLeft",
            fontSize: 12,
            fill: "hsl(var(--muted-foreground))",
          }}
        />
        <ZAxis type="number" dataKey="availability" range={[80, 360]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={<CustomTooltip />}
        />
        <Scatter
          data={data}
          fill="hsl(var(--primary))"
          fillOpacity={0.7}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
