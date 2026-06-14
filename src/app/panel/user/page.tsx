import { redirect } from "next/navigation";
import { Wallet, Activity, Receipt } from "lucide-react";

import type { TimeSeriesPoint } from "@/lib/types";
import { getBillingRecords } from "@/lib/api";
import { formatCNY } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingDetailTable } from "@/components/shared/billing-detail-table";

const USAGE: TimeSeriesPoint[] = [
  { date: "6/4", value: 1.2 },
  { date: "6/5", value: 1.8 },
  { date: "6/6", value: 1.5 },
  { date: "6/7", value: 2.3 },
  { date: "6/8", value: 2.0 },
  { date: "6/9", value: 2.6 },
  { date: "6/10", value: 1.9 },
];

/** P2-9 C 端用户面板。
 *
 * 新用户(无任何消费记录)直接落地到「四问选型」,先帮他选对模型;有消费后才看用量页。
 * 演示用 `?new=1` 强制模拟新用户(mock 默认有记录)。
 */
export default async function UserPanelPage({
  searchParams,
}: {
  searchParams?: { new?: string };
}) {
  const records =
    searchParams?.new === "1" ? [] : await getBillingRecords();

  // 没有任何消费记录 → 引导去四问选型(toC 自助选型入口)
  if (records.length === 0) redirect("/wizard");

  return (
    <>
      <PageHeader
        title="我的用量(C 端用户)"
        description="用量、计费与余额。"
        actions={<Button>充值</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="账户余额"
          value={formatCNY(286.4)}
          hint="约可用 18 天"
          trend="flat"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="本月消费"
          value={formatCNY(63.8)}
          hint="较上月 +12%"
          trend="up"
          icon={<Receipt className="h-5 w-5" />}
          series={[38, 44, 49, 53, 58, 64]}
        />
        <StatCard
          label="本月用量"
          value="13.2 万 token"
          hint="日均约 1.9 万"
          trend="up"
          icon={<Activity className="h-5 w-5" />}
          series={USAGE.map((p) => p.value)}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">近 7 天用量(万 token)</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendLineChart data={USAGE} unit=" 万" />
        </CardContent>
      </Card>

      <BillingDetailTable records={records} />
    </>
  );
}
