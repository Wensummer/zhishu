import { Wallet, Activity, Receipt } from "lucide-react";

import type { TimeSeriesPoint } from "@/lib/types";
import { formatCNY } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const USAGE: TimeSeriesPoint[] = [
  { date: "6/4", value: 1.2 },
  { date: "6/5", value: 1.8 },
  { date: "6/6", value: 1.5 },
  { date: "6/7", value: 2.3 },
  { date: "6/8", value: 2.0 },
  { date: "6/9", value: 2.6 },
  { date: "6/10", value: 1.9 },
];

const BILLS = [
  { date: "2026-06-09", model: "DeepSeek-V3", tokens: "2.6 万", amount: 5.2 },
  { date: "2026-06-08", model: "通义千问-Plus", tokens: "2.0 万", amount: 4.1 },
  { date: "2026-06-07", model: "DeepSeek-V3", tokens: "2.3 万", amount: 4.6 },
  { date: "2026-06-06", model: "智谱 GLM-4", tokens: "1.5 万", amount: 7.5 },
];

/** P2-9 C 端用户面板。 */
export default function UserPanelPage() {
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">计费明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>用量</TableHead>
                <TableHead className="text-right">金额</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BILLS.map((b, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">{b.date}</TableCell>
                  <TableCell>{b.model}</TableCell>
                  <TableCell className="tabular-nums">{b.tokens}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCNY(b.amount, 1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
