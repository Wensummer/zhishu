import Link from "next/link";
import {
  Phone,
  Wallet,
  CalendarClock,
  AlertTriangle,
  Bug,
  ArrowRight,
  Building2,
} from "lucide-react";

import { formatCNY } from "@/lib/utils";
import { getBriefing, getBillingRecords, getEnterpriseInfo } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { BillingDetailTable } from "@/components/shared/billing-detail-table";
import { OpportunityTag } from "@/components/workbench/opportunity-tag";
import { BriefingRecommendationsClient } from "@/components/workbench/briefing-recommendations-client";
import { BriefingScriptsClient } from "@/components/workbench/briefing-scripts-client";
import { TelecomRecommendCard } from "@/components/workbench/telecom-recommend-card";
import { EnterprisePanel } from "@/components/enterprise/enterprise-panel";

/** P0-2 通话前智能简报(单客户详情)。 */
export default async function BriefingPage({
  params,
}: {
  params: { customerId: string };
}) {
  const { customer, usage, recommendations, scripts, telecomProducts, nextActions } =
    await getBriefing(params.customerId);
  const billingRecords = await getBillingRecords({
    customerId: params.customerId,
  });
  const enterpriseInfo = await getEnterpriseInfo(params.customerId);

  return (
    <>
      <PageHeader
        title="通话前智能简报"
        description="进门前的静态底稿 —— 使用情况、推荐选型、随身话术、商机判断一页看全。"
        actions={
          <Button asChild>
            <Link href={`/workbench/copilot/${params.customerId}`}>
              <Phone className="h-4 w-4" />
              进入通话
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* 客户概览条 */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{customer.name}</span>
              <OpportunityTag stage={customer.stage} />
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.industry} · 联系人 {customer.contact} · 在用{" "}
              {customer.currentModel} / {customer.currentPlan}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Fact icon={<Wallet className="h-4 w-4" />} label="余额" value={formatCNY(customer.balance)} />
            <Fact icon={<CalendarClock className="h-4 w-4" />} label="到期" value={customer.expireAt} />
            <Fact icon={<AlertTriangle className="h-4 w-4" />} label="近30天限流" value={`${customer.rateLimitHits} 次`} />
            <Fact icon={<Bug className="h-4 w-4" />} label="近30天报错" value={`${customer.errorCount} 次`} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage">使用情况</TabsTrigger>
          <TabsTrigger value="recommend">推荐选型</TabsTrigger>
          <TabsTrigger value="scripts">随身话术</TabsTrigger>
          <TabsTrigger value="enterprise">企业画像</TabsTrigger>
          <TabsTrigger value="opportunity">商机判断</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">用量趋势(万 token / 月)</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={usage} unit=" 万" />
            </CardContent>
          </Card>
          <BillingDetailTable records={billingRecords} />
        </TabsContent>

        <TabsContent value="recommend" className="space-y-4">
          <BriefingRecommendationsClient
            recommendations={recommendations}
            customerName={customer.name}
            industry={customer.industry}
          /></TabsContent>

        <TabsContent value="scripts">
          <BriefingScriptsClient scripts={scripts} customerName={customer.name} />
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-4">
          <EnterprisePanel info={enterpriseInfo} />
        </TabsContent>

        <TabsContent value="opportunity" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <OpportunityTag stage={customer.stage} />
                <span className="text-sm text-muted-foreground">
                  距到期 {customer.expireAt} 约 1 个月,处于续约窗口
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium">下一步动作</p>
                <ul className="space-y-1 text-muted-foreground">
                  {nextActions.map((a) => (
                    <li key={a}>· {a}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">其他电信业务推荐</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {telecomProducts.map((product) => (
                <TelecomRecommendCard key={product.id} product={product} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
