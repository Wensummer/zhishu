import { Activity, Gauge, Hash } from "lucide-react";

import type { TimeSeriesPoint } from "@/lib/types";
import { formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const DAILY: TimeSeriesPoint[] = [
  { date: "周一", value: 32 },
  { date: "周二", value: 41 },
  { date: "周三", value: 38 },
  { date: "周四", value: 52 },
  { date: "周五", value: 47 },
  { date: "周六", value: 12 },
  { date: "周日", value: 8 },
];

/** P2-9 甲方个人面板。 */
export default function MemberPanelPage() {
  const used = 23;
  const quota = 50;
  return (
    <>
      <PageHeader
        title="个人面板(甲方成员)"
        description="个人用量与额度。"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="本月用量"
          value="23 万 token"
          hint="较上月 +5%"
          trend="up"
          icon={<Activity className="h-5 w-5" />}
          series={DAILY.map((p) => p.value)}
        />
        <StatCard
          label="本月调用次数"
          value="1,284"
          hint="日均约 43 次"
          trend="flat"
          icon={<Hash className="h-5 w-5" />}
        />
        <StatCard
          label="额度使用"
          value={formatPercent(used / quota, 0)}
          hint={`${used} / ${quota} 万 token`}
          trend="flat"
          icon={<Gauge className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">近 7 天用量(万 token)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={DAILY} unit=" 万" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">本月额度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">已用 / 总额</span>
              <span className="tabular-nums">
                {used} / {quota} 万 token
              </span>
            </div>
            <Progress value={(used / quota) * 100} />
            <p className="text-xs text-muted-foreground">
              额度由部门管理员分配,接近上限时会提醒;可向管理员申请提额。
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
