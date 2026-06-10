/**
 * 演示用通话 copilot 剧本数据(临时)。Phase 后期由 lib/api 取 CallSession 替换。
 */
import type {
  IntentEvent,
  Recommendation,
  TalkScript,
  TranscriptLine,
} from "@/lib/types";

export interface CopilotScript {
  customerId: string;
  customerName: string;
  maxSec: number;
  transcript: TranscriptLine[];
  intents: IntentEvent[];
  recommendations: Record<string, Recommendation>;
  scripts: Record<string, TalkScript>;
  summary: string;
}

const SESSION_C1024: CopilotScript = {
  customerId: "c-1024",
  customerName: "云帆智造科技",
  maxSec: 34,
  transcript: [
    { speaker: "manager", text: "周经理您好,这季度贵司调用量涨了约 40%,稳定性一直 99.8%,今天想和您过一下续约。", atSec: 0 },
    { speaker: "customer", text: "嗯,量确实涨了。不过最近财务在压成本,续约这块预算卡得紧。", atSec: 3 },
    { speaker: "manager", text: "理解,我们可以包年锁价,后面调价不影响您,预算更好做。", atSec: 7 },
    { speaker: "customer", text: "说到这个,我看市面上有些中转便宜不少,你们价格能不能再松松?", atSec: 11 },
    { speaker: "manager", text: "便宜的多是逆向渠道、随时跳价甚至跑路。我们是备案直连、渠道纯度可出证明,还能开正规发票。", atSec: 16 },
    { speaker: "customer", text: "发票和合规这块我们确实必须要。对了,我们质检那边想试试更智能的方案。", atSec: 21 },
    { speaker: "manager", text: "正好,我们有行业 MCP + 质检 Agent 的增值包,同行业落地效果不错,我回头给您发个方案。", atSec: 26 },
    { speaker: "customer", text: "可以,那续约我们走起,增值包也发我看看。", atSec: 31 },
  ],
  intents: [
    { atSec: 3, level: "medium", needType: "成本敏感", note: "客户提到财务压成本,预算紧" },
    { atSec: 11, level: "medium", needType: "价格异议", note: "拿中转比价施压", triggersScriptId: "s-3", triggersRecommendationId: "r-1" },
    { atSec: 21, level: "high", needType: "质检新需求", note: "主动抛出质检智能化诉求", triggersRecommendationId: "r-2" },
    { atSec: 31, level: "high", needType: "成交信号", note: "确认续约 + 索要增值包方案" },
  ],
  recommendations: {
    "r-1": {
      id: "r-1",
      type: "renew",
      title: "包年锁价续约,化解预算顾虑",
      targetModelId: "通义千问-Max",
      targetPlanId: "包年企业版",
      reason: "客户担心成本与调价 —— 包年锁价给预算确定性,正面回应。",
      quoteRange: [180000, 210000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数",
        score: 96.4,
        factors: [
          { key: "capability", label: "能力分", value: 92, display: "92", source: { label: "天翼云模型评测台", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.998, display: "99.8%", source: { label: "可用性监控 · 30 天", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 1.05, display: "×1.05", source: { label: "定价知识库 · 包年", collectedAt: "2026-06-01" } },
        ],
      },
    },
    "r-2": {
      id: "r-2",
      type: "addon",
      title: "加推质检 Agent 增值包",
      targetModelId: "通义千问-Max",
      reason: "客户主动提到质检场景 —— 顺势加推,采纳概率高。",
      quoteRange: [36000, 52000],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数",
        score: 88.2,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.94, display: "94%", source: { label: "客户用量画像", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.92, display: "92%", source: { label: "同行业案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.02, display: "×1.02", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  },
  scripts: {
    "s-3": {
      id: "s-3",
      scene: "objection",
      title: "应对比价异议",
      objection: "市面上有更便宜的中转",
      content:
        "便宜多是逆向渠道、随时跳价或跑路,日志还可能掺别的模型。我们贵在确定性:锁价、SLA、7×24、数据不出境,证据链每项来源都能摊给您看。",
    },
  },
  summary:
    "客户确认续约「通义千问-Max 包年企业版」,接受包年锁价;对质检 Agent 增值包有明确兴趣,需补发方案。比价异议已用合规 + 锁价话术化解。",
};

const SESSIONS: Record<string, CopilotScript> = {
  "c-1024": SESSION_C1024,
};

/** 取某客户的通话剧本;演示阶段未命中则回退到 c-1024。 */
export function getCopilotScript(customerId: string): CopilotScript {
  return SESSIONS[customerId] ?? SESSION_C1024;
}
