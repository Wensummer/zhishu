"use client";

import * as React from "react";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatPercent } from "@/lib/utils";
import type { Model } from "@/lib/types";
import { blendedPrice } from "@/lib/demo/models";
import { scoreModel } from "@/lib/recommendation/score";

/** 成本系数基准混合价(元/千 token):比它便宜即划算。对齐评分引擎 COST_REFERENCE。 */
const COST_REFERENCE = 0.06;

/** 厂商配色(同厂同色,便于成簇辨认)。未列出的厂商按顺序取兜底色。 */
const VENDOR_COLORS: Record<string, string> = {
  阿里云百炼: "#6366f1",
  百度智能云: "#2563eb",
  深度求索: "#0ea5e9",
  "智谱 AI": "#14b8a6",
  月之暗面: "#8b5cf6",
  百川智能: "#f59e0b",
};
const FALLBACK_COLORS = ["#ec4899", "#10b981", "#f97316", "#64748b"];

interface Point {
  id: string;
  name: string;
  vendor: string;
  color: string;
  price: number;
  capability: number;
  availability: number;
  ttft: number;
  score: number;
  isTop: boolean;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <div className="mb-1 flex items-center gap-1.5 font-medium">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: p.color }}
        />
        {p.name}
        {p.isTop && <span className="text-amber-500">★ 综合分最优</span>}
      </div>
      <div className="space-y-0.5 text-muted-foreground">
        <div>厂商:{p.vendor}</div>
        <div>综合分:{p.score.toFixed(1)}</div>
        <div>混合价:¥{p.price.toFixed(3)} / 千 token</div>
        <div>能力分:{p.capability}</div>
        <div>可用率:{formatPercent(p.availability)}</div>
        <div>TTFT:{p.ttft}ms</div>
      </div>
    </div>
  );
}

/** 气泡半径:可用率越高气泡越大(放大差异,避免一样大)。 */
function radiusFor(availability: number): number {
  const t = Math.max(0, Math.min(1, (availability - 0.985) / (0.999 - 0.985)));
  return 10 + t * 12; // 10 ~ 22 px
}

/** 单个气泡(渐变 + 阴影;最优点加脉冲光环 + ★;名称标在上方)。 */
function Bubble(props: {
  cx?: number;
  cy?: number;
  payload?: Point;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const r = radiusFor(payload.availability);
  return (
    <g>
      {payload.isTop && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={payload.color}
          strokeWidth={2}
        >
          <animate
            attributeName="r"
            from={r}
            to={r + 16}
            dur="1.8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.55"
            to="0"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <circle
        className="price-bubble"
        cx={cx}
        cy={cy}
        r={r}
        fill={payload.color}
        fillOpacity={0.82}
        stroke="#fff"
        strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))" }}
      />
      {payload.isTop && (
        <text
          x={cx + r * 0.72}
          y={cy - r * 0.72}
          textAnchor="middle"
          fontSize={13}
          fill="#f59e0b"
        >
          ★
        </text>
      )}
      <text
        x={cx}
        y={cy - r - 5}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="hsl(var(--foreground))"
      >
        {payload.name}
      </text>
    </g>
  );
}

/** 比价图:横轴混合价、纵轴能力分;气泡=模型(大小=可用率、色=厂商);
 *  左上「性价比甜点区」高亮、最优点脉冲、虚线=帕累托最优前沿。 */
export function PriceCompareChart({ models }: { models: Model[] }) {
  const points: Point[] = React.useMemo(() => {
    const scored = models.map((m) => ({
      m,
      score: scoreModel(m).score,
    }));
    const topId = scored.reduce((a, b) => (b.score > a.score ? b : a)).m.id;
    const vendors = Array.from(new Set(models.map((m) => m.vendor)));
    return scored.map(({ m, score }) => ({
      id: m.id,
      name: m.name,
      vendor: m.vendor,
      color:
        VENDOR_COLORS[m.vendor] ??
        FALLBACK_COLORS[vendors.indexOf(m.vendor) % FALLBACK_COLORS.length],
      price: blendedPrice(m),
      capability: m.capabilityScore,
      availability: m.availability,
      ttft: m.ttftMs,
      score,
      isTop: m.id === topId,
    }));
  }, [models]);

  const caps = points.map((p) => p.capability);
  const prices = points.map((p) => p.price);
  const maxPrice = Math.max(...prices, COST_REFERENCE);
  // X 轴上界对齐到 0.025 网格的整洁值,并 round 掉浮点误差(否则末刻度会是 0.0959999…)
  const xMax = Math.round(Math.ceil(maxPrice / 0.025) * 0.025 * 1000) / 1000;
  const minCap = Math.min(...caps);
  const maxCap = Math.max(...caps);
  const medianCap = [...caps].sort((a, b) => a - b)[Math.floor(caps.length / 2)];
  const yMin = minCap - 3;
  const yMax = maxCap + 4;

  // 帕累托最优前沿:按价格升序,能力不断创新高的点(左上包络)。
  const frontier = React.useMemo(() => {
    const sorted = [...points].sort((a, b) => a.price - b.price);
    const out: Point[] = [];
    let best = -Infinity;
    for (const p of sorted) {
      if (p.capability > best) {
        out.push(p);
        best = p.capability;
      }
    }
    return out;
  }, [points]);

  const vendorLegend = Array.from(
    new Map(points.map((p) => [p.vendor, p.color])).entries()
  );

  return (
    <div>
      <style jsx global>{`
        .price-bubble {
          transition: transform 0.15s ease, filter 0.15s ease;
          transform-box: fill-box;
          transform-origin: center;
          cursor: pointer;
        }
        .price-bubble:hover {
          transform: scale(1.2);
        }
      `}</style>
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 0 }}>
          <defs>
            <linearGradient id="sweetSpot" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* 左上「性价比甜点区」:便宜(< 基准价)且能力高于中位 */}
          <ReferenceArea
            x1={0}
            x2={COST_REFERENCE}
            y1={medianCap}
            y2={yMax}
            fill="url(#sweetSpot)"
            stroke="#10b981"
            strokeOpacity={0.35}
            strokeDasharray="4 4"
            label={{
              value: "★ 性价比甜点区",
              position: "insideTopLeft",
              fontSize: 12,
              fill: "#10b981",
              offset: 10,
            }}
          />

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

          {/* 基准价竖线 + 能力中位横线 → 四象限参照 */}
          <ReferenceLine
            x={COST_REFERENCE}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="2 4"
            strokeOpacity={0.6}
            label={{
              value: "基准价 ¥0.06",
              position: "top",
              fontSize: 10,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <ReferenceLine
            y={medianCap}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="2 4"
            strokeOpacity={0.5}
          />

          <XAxis
            type="number"
            dataKey="price"
            name="混合价"
            domain={[0, xMax]}
            tickFormatter={(v) => `${Number(Number(v).toFixed(3))}元`}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "混合价(元/千 token)→ 越左越省",
              position: "insideBottom",
              offset: -14,
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <YAxis
            type="number"
            dataKey="capability"
            name="能力分"
            domain={[yMin, yMax]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={44}
            label={{
              value: "能力分 ↑",
              angle: -90,
              position: "insideLeft",
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
              offset: 16,
            }}
          />

          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />

          {/* 帕累托最优前沿(只连线,不重复画气泡) */}
          <Scatter
            data={frontier}
            line={{ stroke: "#10b981", strokeWidth: 1.5, strokeDasharray: "5 4" }}
            lineType="joint"
            shape={() => <g />}
            isAnimationActive={false}
            legendType="none"
          />

          {/* 模型气泡 */}
          <Scatter
            data={points}
            shape={<Bubble />}
            isAnimationActive
            animationDuration={700}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* 厂商图例 */}
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-2">
        {vendorLegend.map(([vendor, color]) => (
          <span
            key={vendor}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: color }}
            />
            {vendor}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed border-emerald-500" />
          帕累托最优前沿
        </span>
      </div>
    </div>
  );
}
