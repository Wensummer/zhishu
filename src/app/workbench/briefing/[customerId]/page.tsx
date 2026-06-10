import Link from "next/link";
import {
  Phone,
  Wallet,
  CalendarClock,
  AlertTriangle,
  Bug,
  ArrowRight,
} from "lucide-react";

import { formatCNY } from "@/lib/utils";
import type {
  Recommendation,
  TalkScript,
  TimeSeriesPoint,
} from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { OpportunityTag } from "@/components/workbench/opportunity-tag";
import { RecommendationCard } from "@/components/workbench/recommendation-card";
import { TalkScriptCard } from "@/components/workbench/talk-script-card";

// —— 临时演示内容(定页面长相用);Phase 后期改为经 lib/api 按 customerId 取数 ——
const CUSTOMER = {
  id: "c-1024",
  name: "云帆智造科技",
  industry: "智能制造",
  stage: "renew" as const,
  contact: "周经理",
  currentModel: "通义千问-Max",
  currentPlan: "包年企业版",
  balance: 38000,
  expireAt: "2026-07-15",
  rateLimitHits: 12,
  errorCount: 3,
};

const USAGE: TimeSeriesPoint[] = [
  { date: "1月", value: 182 },
  { date: "2月", value: 196 },
  { date: "3月", value: 175 },
  { date: "4月", value: 224 },
  { date: "5月", value: 268 },
  { date: "6月", value: 312 },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r-1",
    customerId: "c-1024",
    type: "renew",
    title: "续约「通义千问-Max 包年企业版」并锁价",
    targetModelId: "通义千问-Max",
    targetPlanId: "包年企业版",
    reason:
      "近 3 个月用量稳定上行、可用率 99.8%,当前型号最配其低延迟需求;包年锁价规避调价波动。",
    quoteRange: [180000, 210000],
    evidenceChain: {
      formula: "综合分 = 能力分 × 可用率 × 成本系数",
      score: 96.4,
      factors: [
        {
          key: "capability",
          label: "能力分",
          value: 92,
          display: "92",
          source: { label: "天翼云模型评测台 / 2026Q2 基准集", collectedAt: "2026-05-30" },
        },
        {
          key: "availability",
          label: "可用率",
          value: 0.998,
          display: "99.8%",
          source: { label: "可用性监控 · 30 天滚动", collectedAt: "2026-06-08" },
        },
        {
          key: "costFactor",
          label: "成本系数",
          value: 1.05,
          display: "×1.05",
          source: { label: "定价知识库 · 包年折扣", collectedAt: "2026-06-01" },
        },
      ],
    },
  },
  {
    id: "r-2",
    customerId: "c-1024",
    type: "addon",
    title: "加推「行业 MCP + 质检 Agent」增值包",
    targetModelId: "通义千问-Max",
    reason:
      "制造质检场景用量集中,叠加行业 MCP 可提升落地效果,属高价值增量,采纳率历史偏高。",
    quoteRange: [36000, 52000],
    evidenceChain: {
      formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数",
      score: 88.2,
      factors: [
        {
          key: "fit",
          label: "场景匹配",
          value: 0.94,
          display: "94%",
          source: { label: "客户用量画像 · 质检类调用占比", collectedAt: "2026-06-07" },
        },
        {
          key: "certainty",
          label: "落地确定性",
          value: 0.92,
          display: "92%",
          source: { label: "同行业落地案例库", collectedAt: "2026-05-20" },
        },
        {
          key: "valueFactor",
          label: "增值系数",
          value: 1.02,
          display: "×1.02",
          source: { label: "增值产品策略", collectedAt: "2026-06-01" },
        },
      ],
    },
  },
];

const SCRIPTS: TalkScript[] = [
  {
    id: "s-1",
    scene: "opening",
    title: "续约切入",
    content:
      "周经理您好,这季度贵司调用量涨了约 40%,稳定性一直保持在 99.8%。续约前我把用量和选型给您过一遍,顺便锁个价,避免后面调价影响预算。",
  },
  {
    id: "s-2",
    scene: "sellingPoint",
    title: "合规 + 锁价",
    content:
      "我们是天翼云备案直连、渠道纯度可出证明,合同锁价 + 调价提前公示,发票对公正规 —— 这几点是中转站给不了的,贵司做预算和审计都省心。",
  },
  {
    id: "s-3",
    scene: "objection",
    title: "价格异议",
    objection: "市面上有更便宜的中转",
    content:
      "便宜的多是逆向渠道、随时可能跳价或跑路,日志里还可能掺别的模型。我们贵在确定性:锁价、SLA、7×24 和数据不出境。需要的话我把证据链摊给您看每一分数据的来源。",
  },
];

export default function BriefingPage({
  params,
}: {
  params: { customerId: string };
}) {
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
              <span className="text-lg font-semibold">{CUSTOMER.name}</span>
              <OpportunityTag stage={CUSTOMER.stage} />
            </div>
            <p className="text-sm text-muted-foreground">
              {CUSTOMER.industry} · 联系人 {CUSTOMER.contact} · 在用{" "}
              {CUSTOMER.currentModel} / {CUSTOMER.currentPlan}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Fact icon={<Wallet className="h-4 w-4" />} label="余额" value={formatCNY(CUSTOMER.balance)} />
            <Fact icon={<CalendarClock className="h-4 w-4" />} label="到期" value={CUSTOMER.expireAt} />
            <Fact icon={<AlertTriangle className="h-4 w-4" />} label="近30天限流" value={`${CUSTOMER.rateLimitHits} 次`} />
            <Fact icon={<Bug className="h-4 w-4" />} label="近30天报错" value={`${CUSTOMER.errorCount} 次`} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommend">
        <TabsList>
          <TabsTrigger value="usage">使用情况</TabsTrigger>
          <TabsTrigger value="recommend">推荐选型</TabsTrigger>
          <TabsTrigger value="scripts">随身话术</TabsTrigger>
          <TabsTrigger value="opportunity">商机判断</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">用量趋势(万 token / 月)</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={USAGE} unit=" 万" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommend" className="space-y-4">
          {RECOMMENDATIONS.map((r, i) => (
            <RecommendationCard
              key={r.id}
              recommendation={r}
              defaultOpenEvidence={i === 0}
            />
          ))}
        </TabsContent>

        <TabsContent value="scripts" className="grid gap-3 md:grid-cols-2">
          {SCRIPTS.map((s) => (
            <TalkScriptCard key={s.id} script={s} />
          ))}
        </TabsContent>

        <TabsContent value="opportunity">
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <OpportunityTag stage={CUSTOMER.stage} />
                <span className="text-sm text-muted-foreground">
                  距到期 {CUSTOMER.expireAt} 约 1 个月,处于续约窗口
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium">下一步动作</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>· 本周内电话确认续约意向,主推包年锁价</li>
                  <li>· 同步抛出质检 Agent 增值包,试探加推空间</li>
                  <li>· 通话要点回流话术库 / 商机库,便于复盘</li>
                </ul>
              </div>
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
