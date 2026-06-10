"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import { cn, formatPercent } from "@/lib/utils";
import type { Model } from "@/lib/types";
import { modelHealth } from "@/lib/demo/models";
import { Card, CardContent } from "@/components/ui/card";

const HEALTH_META = {
  ok: { label: "正常", color: "hsl(var(--success))" },
  warn: { label: "波动", color: "hsl(var(--warning))" },
  down: { label: "异常", color: "hsl(var(--destructive))" },
} as const;

/** 模型晴雨表:模型池整体健康度一眼可见。 */
export function HealthBarometer({ models }: { models: Model[] }) {
  const overall =
    models.reduce((sum, m) => sum + m.availability, 0) / (models.length || 1);
  const counts = models.reduce(
    (acc, m) => {
      acc[modelHealth(m)] += 1;
      return acc;
    },
    { ok: 0, warn: 0, down: 0 }
  );

  const pct = Math.round(overall * 1000) / 10;
  const color =
    overall >= 0.995
      ? "hsl(var(--success))"
      : overall >= 0.99
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";
  const summary = overall >= 0.995 ? "运行平稳" : overall >= 0.99 ? "轻微波动" : "存在异常";

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:gap-8">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="72%"
              outerRadius="100%"
              barSize={14}
              data={[{ value: pct, fill: color }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <RadialBar dataKey="value" cornerRadius={8} background />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">{pct}%</span>
            <span className="text-xs text-muted-foreground">整体可用率</span>
          </div>
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <div>
            <div className="text-lg font-semibold">模型池晴雨表 · {summary}</div>
            <div className="text-sm text-muted-foreground">
              共 {models.length} 个模型 · 全部已备案 · 渠道纯度 100%
            </div>
          </div>
          <div className="flex justify-center gap-4 sm:justify-start">
            {(["ok", "warn", "down"] as const).map((k) => (
              <div key={k} className="flex items-center gap-1.5 text-sm">
                <span
                  className={cn("h-2.5 w-2.5 rounded-full")}
                  style={{ background: HEALTH_META[k].color }}
                />
                <span className="text-muted-foreground">{HEALTH_META[k].label}</span>
                <span className="font-semibold tabular-nums">{counts[k]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            我们敢把数据摊开:可用率 {formatPercent(overall)} 实时可查,调价/故障全程公示。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
