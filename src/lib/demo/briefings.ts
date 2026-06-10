/**
 * 演示用通话前简报数据(临时)。Phase 后期由 lib/api 按 customerId 取数替换。
 */
import type { Recommendation, TalkScript, TimeSeriesPoint } from "@/lib/types";

export interface BriefingCustomer {
  id: string;
  name: string;
  industry: string;
  stage: "renew" | "upgrade" | "expand" | "silent" | "newLead";
  contact: string;
  currentModel: string;
  currentPlan: string;
  balance: number;
  expireAt: string;
  rateLimitHits: number;
  errorCount: number;
}

export interface Briefing {
  customer: BriefingCustomer;
  usage: TimeSeriesPoint[];
  recommendations: Recommendation[];
  scripts: TalkScript[];
  nextActions: string[];
}

const BRIEFING_C1024: Briefing = {
  customer: {
    id: "c-1024",
    name: "云帆智造科技",
    industry: "智能制造",
    stage: "renew",
    contact: "周经理",
    currentModel: "通义千问-Max",
    currentPlan: "包年企业版",
    balance: 38000,
    expireAt: "2026-07-15",
    rateLimitHits: 12,
    errorCount: 3,
  },
  usage: [
    { date: "1月", value: 182 },
    { date: "2月", value: 196 },
    { date: "3月", value: 175 },
    { date: "4月", value: 224 },
    { date: "5月", value: 268 },
    { date: "6月", value: 312 },
  ],
  recommendations: [
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
          { key: "capability", label: "能力分", value: 92, display: "92", source: { label: "天翼云模型评测台 / 2026Q2 基准集", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.998, display: "99.8%", source: { label: "可用性监控 · 30 天滚动", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 1.05, display: "×1.05", source: { label: "定价知识库 · 包年折扣", collectedAt: "2026-06-01" } },
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
          { key: "fit", label: "场景匹配", value: 0.94, display: "94%", source: { label: "客户用量画像 · 质检类调用占比", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.92, display: "92%", source: { label: "同行业落地案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.02, display: "×1.02", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  ],
  scripts: [
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
  ],
  nextActions: [
    "本周内电话确认续约意向,主推包年锁价",
    "同步抛出质检 Agent 增值包,试探加推空间",
    "通话要点回流话术库 / 商机库,便于复盘",
  ],
};

const BRIEFINGS: Record<string, Briefing> = {
  "c-1024": BRIEFING_C1024,
};

/** 取某客户的简报;演示阶段未命中则回退到 c-1024。 */
export function getBriefingData(customerId: string): Briefing {
  return BRIEFINGS[customerId] ?? BRIEFING_C1024;
}
