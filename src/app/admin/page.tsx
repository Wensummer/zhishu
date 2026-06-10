import { Gauge, RefreshCw, ThumbsUp, MessageSquareWarning } from "lucide-react";

import type { Metric, TimeSeriesPoint } from "@/lib/types";
import { formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FunnelOverview } from "@/components/workbench/funnel-overview";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// —— 临时演示指标(定页面长相用);Phase 后期改为经 lib/api 取数 ——
const EFFICIENCY_TREND: TimeSeriesPoint[] = [
  { date: "1月", value: 18 },
  { date: "2月", value: 19 },
  { date: "3月", value: 21 },
  { date: "4月", value: 24 },
  { date: "5月", value: 27 },
  { date: "6月", value: 31 },
];

// 信任工程相关指标:现状 vs 目标
const TRUST_METRICS: Metric[] = [
  { key: "renewRate", label: "续费率", value: 0.91, baseline: 0.82, target: 0.93, unit: "%" },
  { key: "expandRate", label: "扩容率", value: 0.34, baseline: 0.21, target: 0.4, unit: "%" },
  { key: "adoptionRate", label: "推荐采纳率", value: 0.68, baseline: 0.45, target: 0.75, unit: "%" },
  { key: "complaintRate", label: "选型相关客诉率", value: 0.03, baseline: 0.08, target: 0.02, unit: "%" },
];

const FUNNEL = [
  { label: "线索", value: 320 },
  { label: "商机", value: 168 },
  { label: "报价", value: 92 },
  { label: "成交", value: 47 },
];

/** P1-7 管理侧数据大屏。 */
export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title="管理侧数据大屏"
        description="客户经理人效、商机漏斗与转化归因、续费/扩容率、推荐采纳率、选型相关客诉率。"
        actions={<Badge variant="outline">数据口径:本月 · ToB</Badge>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="客户经理人效(单人月签约)"
          value="31"
          hint="较基线 +13"
          trend="up"
          icon={<Gauge className="h-5 w-5" />}
          series={EFFICIENCY_TREND.map((p) => p.value)}
        />
        <StatCard
          label="续费率"
          value="91%"
          hint="目标 93%"
          trend="up"
          icon={<RefreshCw className="h-5 w-5" />}
          series={[82, 85, 86, 88, 90, 91]}
        />
        <StatCard
          label="推荐采纳率"
          value="68%"
          hint="较基线 +23%"
          trend="up"
          icon={<ThumbsUp className="h-5 w-5" />}
          series={[45, 50, 55, 60, 64, 68]}
        />
        <StatCard
          label="选型相关客诉率"
          value="3%"
          hint="较基线 -5%(越低越好)"
          trend="down"
          icon={<MessageSquareWarning className="h-5 w-5" />}
          series={[8, 7, 6, 5, 4, 3]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              客户经理人效趋势(单人月签约数)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={EFFICIENCY_TREND} unit=" 单" />
          </CardContent>
        </Card>

        <FunnelOverview stages={FUNNEL} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            信任工程指标 · 现状 vs 目标
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {TRUST_METRICS.map((m) => (
            <MetricBar key={m.key} metric={m} />
          ))}
        </CardContent>
      </Card>
    </>
  );
}

/** 单条指标:基线 → 现状 → 目标 的进度条。 */
function MetricBar({ metric: m }: { metric: Metric }) {
  // 客诉率越低越好:进度按"距目标的接近度"反向展示
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
        {/* 目标刻度线 */}
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
