import { Gauge, RefreshCw, ThumbsUp, MessageSquareWarning } from "lucide-react";

import type { Metric } from "@/lib/types";
import { formatPercent } from "@/lib/utils";
import { getDashboard } from "@/lib/api";
import type { DashboardStat } from "@/lib/demo/metrics";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FunnelOverview } from "@/components/workbench/funnel-overview";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAT_ICONS: Record<DashboardStat["icon"], React.ReactNode> = {
  efficiency: <Gauge className="h-5 w-5" />,
  renew: <RefreshCw className="h-5 w-5" />,
  adoption: <ThumbsUp className="h-5 w-5" />,
  complaint: <MessageSquareWarning className="h-5 w-5" />,
};

/** P1-7 管理侧数据大屏。 */
export default async function AdminDashboardPage() {
  const { stats, efficiencyTrend, funnel, trustMetrics } = await getDashboard();

  return (
    <>
      <PageHeader
        title="管理侧数据大屏"
        description="客户经理人效、商机漏斗与转化归因、续费/扩容率、推荐采纳率、选型相关客诉率。"
        actions={<Badge variant="outline">数据口径:本月 · ToB</Badge>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            hint={s.hint}
            trend={s.trend}
            icon={STAT_ICONS[s.icon]}
            series={s.series}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              客户经理人效趋势(单人月签约数)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={efficiencyTrend} unit=" 单" />
          </CardContent>
        </Card>

        <FunnelOverview stages={funnel} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            信任工程指标 · 现状 vs 目标
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {trustMetrics.map((m) => (
            <MetricBar key={m.key} metric={m} />
          ))}
        </CardContent>
      </Card>
    </>
  );
}

/** 单条指标:基线 → 现状 → 目标 的进度条。 */
function MetricBar({ metric: m }: { metric: Metric }) {
  const lowerBetter = m.key === "complaintRate";
  const scaleMax = Math.max(m.value, m.baseline ?? 0, m.target ?? 0) * 1.15 || 1;
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100)}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{m.label}</span>
        <span className="text-sm tabular-nums">
          {formatPercent(m.value, 0)}
          <span className="ml-2 text-xs text-muted-foreground">
            目标 {formatPercent(m.target ?? 0, 0)}
          </span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={lowerBetter ? "h-full rounded-full bg-success" : "h-full rounded-full bg-primary"}
          style={{ width: pct(m.value) }}
        />
        {typeof m.target === "number" && (
          <span
            className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 bg-foreground/60"
            style={{ left: pct(m.target) }}
          />
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        现状基线 {formatPercent(m.baseline ?? 0, 0)} → 当前 {formatPercent(m.value, 0)}
      </div>
    </div>
  );
}
