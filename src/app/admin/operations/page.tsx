import { Gauge, Timer, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FunnelOverview } from "@/components/workbench/funnel-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FUNNEL = [
  { label: "线索", value: 320 },
  { label: "商机", value: 168 },
  { label: "报价", value: 92 },
  { label: "成交", value: 47 },
];

// 转化归因(简单占比)
const ATTRIBUTION = [
  { reason: "简报推荐被采纳", weight: 38 },
  { reason: "通话 copilot 动态话术", weight: 27 },
  { reason: "证据链建立信任", weight: 21 },
  { reason: "续费/扩容主动触达", weight: 14 },
];

/** P2-12 运营分析。 */
export default function AdminOperationsPage() {
  return (
    <>
      <PageHeader
        title="运营分析"
        description="客户经理人效、商机漏斗与转化归因、续费率等运营口径分析。"
        actions={<Badge variant="outline">本月 · ToB</Badge>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="客户经理人效(单人月签约)"
          value="31"
          hint="较基线 +13"
          trend="up"
          icon={<Gauge className="h-5 w-5" />}
          series={[18, 19, 21, 24, 27, 31]}
        />
        <StatCard
          label="商机转化周期"
          value="11 天"
          hint="较上月 -3 天"
          trend="down"
          icon={<Timer className="h-5 w-5" />}
          series={[18, 16, 15, 14, 12, 11]}
        />
        <StatCard
          label="续费率"
          value="91%"
          hint="目标 93%"
          trend="up"
          icon={<RefreshCw className="h-5 w-5" />}
          series={[82, 85, 86, 88, 90, 91]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelOverview stages={FUNNEL} />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">成交转化归因</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {ATTRIBUTION.map((a) => (
              <div key={a.reason} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span>{a.reason}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {a.weight}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${a.weight}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              「透明可核验选型」相关因素合计贡献约 6 成成交,印证信任工程的价值。
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
