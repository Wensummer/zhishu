/**
 * 演示用通话前简报数据(临时)。Phase 后期由 lib/api 按 customerId 取数替换。
 */
import type { Recommendation, TalkScript, TimeSeriesPoint } from "@/lib/types";

import {
  RENEW_SCRIPTS,
  UPGRADE_SCRIPTS,
  EXPAND_SCRIPTS,
  SILENT_SCRIPTS,
  NEWLEAD_SCRIPTS,
} from "@/lib/demo/scripts";

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

// ============ c-1024 · renew (续约) ============
const BRIEFING_RENEW: Briefing = {
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
  scripts: RENEW_SCRIPTS,
  nextActions: [
    "本周内电话确认续约意向,主推包年锁价",
    "同步抛出质检 Agent 增值包,试探加推空间",
    "通话要点回流话术库 / 商机库,便于复盘",
  ],
};

// ============ c-1031 · upgrade (升级) ============
const BRIEFING_UPGRADE: Briefing = {
  customer: {
    id: "c-1031",
    name: "锦书文化传媒",
    industry: "内容/营销",
    stage: "upgrade",
    contact: "林总",
    currentModel: "DeepSeek-V3",
    currentPlan: "按量标准版",
    balance: 6200,
    expireAt: "2026-06-28",
    rateLimitHits: 8,
    errorCount: 1,
  },
  usage: [
    { date: "1月", value: 42 },
    { date: "2月", value: 58 },
    { date: "3月", value: 74 },
    { date: "4月", value: 105 },
    { date: "5月", value: 148 },
    { date: "6月", value: 196 },
  ],
  recommendations: [
    {
      id: "r-1031-1",
      customerId: "c-1031",
      type: "upgrade",
      title: "升级至「DeepSeek-V3 包年企业版」,锁定更低单价",
      targetModelId: "DeepSeek-V3",
      targetPlanId: "包年企业版",
      reason:
        "用量近 3 个月翻了一倍,按量标准版即将触达配额上限;包年企业版单位成本降低约 35%,且附带优先调度权。",
      quoteRange: [72000, 96000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数",
        score: 91.7,
        factors: [
          { key: "capability", label: "能力分", value: 88, display: "88", source: { label: "天翼云模型评测台 / 2026Q2 基准集", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.995, display: "99.5%", source: { label: "可用性监控 · 30 天滚动", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 1.08, display: "×1.08", source: { label: "定价知识库 · 包年折扣", collectedAt: "2026-06-01" } },
        ],
      },
    },
    {
      id: "r-1031-2",
      customerId: "c-1031",
      type: "addon",
      title: "加推「内容生成 Agent」增值包,释放创作效率",
      targetModelId: "DeepSeek-V3",
      reason:
        "内容/营销行业的高频场景高度适配 Agent 化批量生产,预计可提升 3 倍内容产出效率。",
      quoteRange: [18000, 30000],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数",
        score: 85.6,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.91, display: "91%", source: { label: "客户用量画像 · 内容生成占比", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.88, display: "88%", source: { label: "同行业落地案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.05, display: "×1.05", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  ],
  scripts: UPGRADE_SCRIPTS,
  nextActions: [
    "本周内联系客户,建议升级到包年企业版锁定单价",
    "准备用量趋势对比表,量化超量风险",
    "根据行业案例推荐内容 Agent 增值包,做 POC 演示",
  ],
};

// ============ c-1042 · expand (扩容) ============
const BRIEFING_EXPAND: Briefing = {
  customer: {
    id: "c-1042",
    name: "恒生金服数科",
    industry: "金融科技",
    stage: "expand",
    contact: "吴总监",
    currentModel: "文心一言-4.0",
    currentPlan: "包年企业版",
    balance: 120000,
    expireAt: "2026-09-30",
    rateLimitHits: 6,
    errorCount: 0,
  },
  usage: [
    { date: "1月", value: 420 },
    { date: "2月", value: 480 },
    { date: "3月", value: 560 },
    { date: "4月", value: 720 },
    { date: "5月", value: 910 },
    { date: "6月", value: 1150 },
  ],
  recommendations: [
    {
      id: "r-1042-1",
      customerId: "c-1042",
      type: "expand",
      title: "扩容量化方案:多部门独立配额 + 统一结算",
      targetModelId: "文心一言-4.0",
      reason:
        "多部门调用量持续攀升,共享额度面临瓶颈;独立配额可避免部门间资源争抢,统一结算降低管理成本。",
      quoteRange: [320000, 420000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数",
        score: 94.2,
        factors: [
          { key: "capability", label: "能力分", value: 95, display: "95", source: { label: "天翼云模型评测台 / 2026Q2 基准集", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.999, display: "99.9%", source: { label: "可用性监控 · 30 天滚动", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 0.98, display: "×0.98", source: { label: "定价知识库 · 扩容折扣", collectedAt: "2026-06-01" } },
        ],
      },
    },
    {
      id: "r-1042-2",
      customerId: "c-1042",
      type: "addon",
      title: "推荐「合规审计 Agent」,满足金融监管需求",
      targetModelId: "文心一言-4.0",
      reason:
        "金融科技行业合规要求高,审计 Agent 可自动化输出调用审计日志,满足监管报送需求。",
      quoteRange: [42000, 68000],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数",
        score: 92.4,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.97, display: "97%", source: { label: "客户用量画像 · 合规类调用占比", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.95, display: "95%", source: { label: "同行业落地案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.03, display: "×1.03", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  ],
  scripts: EXPAND_SCRIPTS,
  nextActions: [
    "准备多部门扩容方案,包含独立配额与统一管控架构图",
    "联系客户,建议先做 1-2 个部门的扩容量化 POC",
    "推介合规审计 Agent,对接监管报送需求",
  ],
};

// ============ c-1055 · silent (沉默) ============
const BRIEFING_SILENT: Briefing = {
  customer: {
    id: "c-1055",
    name: "蓝橙教育",
    industry: "在线教育",
    stage: "silent",
    contact: "陈老师",
    currentModel: "智谱 GLM-4",
    currentPlan: "按量标准版",
    balance: 800,
    expireAt: "2026-06-12",
    rateLimitHits: 3,
    errorCount: 5,
  },
  usage: [
    { date: "1月", value: 88 },
    { date: "2月", value: 76 },
    { date: "3月", value: 52 },
    { date: "4月", value: 38 },
    { date: "5月", value: 28 },
    { date: "6月", value: 22 },
  ],
  recommendations: [
    {
      id: "r-1055-1",
      customerId: "c-1055",
      type: "renew",
      title: "降配至「轻量入门版」,保留核心能力削减成本",
      targetModelId: "智谱 GLM-4",
      targetPlanId: "轻量入门版",
      reason:
        "用量持续下滑,包年套餐性价比不再;轻量入门版保留核心对话能力,月费降低 60%。",
      quoteRange: [12000, 18000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数",
        score: 78.5,
        factors: [
          { key: "capability", label: "能力分", value: 82, display: "82", source: { label: "天翼云模型评测台 / 2026Q2 基准集", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.99, display: "99.0%", source: { label: "可用性监控 · 30 天滚动", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 0.85, display: "×0.85", source: { label: "定价知识库 · 轻量套餐", collectedAt: "2026-06-01" } },
        ],
      },
    },
    {
      id: "r-1055-2",
      customerId: "c-1055",
      type: "switch",
      title: "建议切换按量付费,零门槛恢复使用",
      targetModelId: "智谱 GLM-4",
      reason:
        "余额仅剩 800 元且即将到期,按量付费模式可避免预付费压力,用多少付多少。",
      quoteRange: [0, 9600],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数",
        score: 72.1,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.78, display: "78%", source: { label: "客户用量画像 · 调用频率", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.82, display: "82%", source: { label: "同行业案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 0.9, display: "×0.9", source: { label: "流失挽回策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  ],
  scripts: SILENT_SCRIPTS,
  nextActions: [
    "立即联系客户,了解用量下滑原因",
    "推荐轻量入门版或按量付费,降低续费门槛",
    "如客户坚持不再续费,了解原因并更新流失记录",
  ],
};

// ============ c-2003 · newLead (新客线索) ============
const BRIEFING_NEWLEAD: Briefing = {
  customer: {
    id: "c-2003",
    name: "途新出行",
    industry: "出行/物流",
    stage: "newLead",
    contact: "赵经理",
    currentModel: "",
    currentPlan: "",
    balance: 0,
    expireAt: "",
    rateLimitHits: 0,
    errorCount: 0,
  },
  usage: [
    { date: "1月", value: 0 },
    { date: "2月", value: 0 },
    { date: "3月", value: 0 },
    { date: "4月", value: 0 },
    { date: "5月", value: 0 },
    { date: "6月", value: 0 },
  ],
  recommendations: [
    {
      id: "r-2003-1",
      customerId: "c-2003",
      type: "upgrade",
      title: "入门推荐:「通义千问-Turbo 按量版」首月零风险试用",
      targetModelId: "通义千问-Turbo",
      targetPlanId: "按量标准版",
      reason:
        "出行/物流行业常见的路线规划与客服场景,通义千问-Turbo 性价比最优,适合作为首次接入选型。",
      quoteRange: [5000, 15000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数",
        score: 85.3,
        factors: [
          { key: "capability", label: "能力分", value: 86, display: "86", source: { label: "天翼云模型评测台 / 2026Q2 基准集", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.995, display: "99.5%", source: { label: "可用性监控 · 30 天滚动", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 0.92, display: "×0.92", source: { label: "定价知识库 · 新客优惠", collectedAt: "2026-06-01" } },
        ],
      },
    },
    {
      id: "r-2003-2",
      customerId: "c-2003",
      type: "addon",
      title: "推荐 POC 验证:智能客服 + 路线规划场景",
      targetModelId: "通义千问-Turbo",
      reason:
        "出行/物流行业的典型高频场景,通过免费 POC 环境帮客户快速验证效果,降低决策风险。",
      quoteRange: [0, 5000],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数",
        score: 82.8,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.85, display: "85%", source: { label: "行业场景画像 · 出行/物流", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.84, display: "84%", source: { label: "同行业落地案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.0, display: "×1.0", source: { label: "新客转化策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  ],
  scripts: NEWLEAD_SCRIPTS,
  nextActions: [
    "尽快首次联系客户,了解具体业务场景",
    "准备出行/物流行业案例,建立信任",
    "推荐零风险试用方案 + POC 环境,降低客户决策门槛",
  ],
};

const BRIEFINGS: Record<string, Briefing> = {
  "c-1024": BRIEFING_RENEW,
  "c-1031": BRIEFING_UPGRADE,
  "c-1042": BRIEFING_EXPAND,
  "c-1055": BRIEFING_SILENT,
  "c-2003": BRIEFING_NEWLEAD,
};

/** 取某客户的简报;演示阶段未命中则回退到 c-1024。 */
export function getBriefingData(customerId: string): Briefing {
  return BRIEFINGS[customerId] ?? BRIEFING_RENEW;
}
