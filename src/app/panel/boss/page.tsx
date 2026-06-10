import { Coins, Wallet, Building2, TrendingUp } from "lucide-react";

import type { TimeSeriesPoint } from "@/lib/types";
import { formatCNY, formatNumber } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COST_TREND: TimeSeriesPoint[] = [
  { date: "1月", value: 12.4 },
  { date: "2月", value: 13.1 },
  { date: "3月", value: 12.8 },
  { date: "4月", value: 15.6 },
  { date: "5月", value: 18.2 },
  { date: "6月", value: 21.5 },
];

const DEPARTMENTS = [
  { name: "研发中心", tokens: 4200, cost: 96000 },
  { name: "智能客服", tokens: 3100, cost: 52000 },
  { name: "市场营销", tokens: 1800, cost: 38000 },
  { name: "质检中心", tokens: 1200, cost: 21000 },
  { name: "其他", tokens: 700, cost: 8000 },
];

/** P2-9 甲方老板面板。 */
export default function BossPanelPage() {
  const maxCost = Math.max(...DEPARTMENTS.map((d) => d.cost));
  return (
    <>
      <PageHeader
        title="经营总览(甲方老板视角)"
        description="总量消耗、成本、宏观趋势与各部门用量分布。"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="本月总消耗"
          value="1,100 万 token"
          hint="较上月 +18%"
          trend="up"
          icon={<Coins className="h-5 w-5" />}
          series={[820, 880, 860, 960, 1020, 1100]}
        />
        <StatCard
          label="本月成本"
          value={formatCNY(215000)}
          hint="较上月 +18%"
          trend="up"
          icon={<Wallet className="h-5 w-5" />}
          series={COST_TREND.map((p) => p.value)}
        />
        <StatCard
          label="活跃部门"
          value="5"
          hint="覆盖核心业务线"
          trend="flat"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="单位 token 成本"
          value="¥0.020"
          hint="较上月 -4%(规模效应)"
          trend="down"
          icon={<TrendingUp className="h-5 w-5" />}
          series={[24, 23, 23, 22, 21, 20]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">月度成本趋势(万元)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={COST_TREND} unit=" 万" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">各部门用量分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {DEPARTMENTS.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span>{d.name}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(d.tokens)} 万 token · {formatCNY(d.cost)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(d.cost / maxCost) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
