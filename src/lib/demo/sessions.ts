/**
 * 演示用通话 copilot 剧本数据(临时)。Phase 后期由 lib/api 取 CallSession 替换。
 */
import type {
  IntentEvent,
  Recommendation,
  TalkScript,
  TranscriptLine,
} from "@/lib/types";

import {
  RENEW_SCRIPTS,
  UPGRADE_SCRIPTS,
  EXPAND_SCRIPTS,
  SILENT_SCRIPTS,
  NEWLEAD_SCRIPTS,
} from "@/lib/demo/scripts";

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

/** 把 TalkScript[] 转成 id-keyed Record。 */
function toScriptMap(scripts: TalkScript[]): Record<string, TalkScript> {
  const map: Record<string, TalkScript> = {};
  for (const s of scripts) map[s.id] = s;
  return map;
}

// ============ c-1024 · renew (续约) ============
const SESSION_RENEW: CopilotScript = {
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
    { atSec: 11, level: "medium", needType: "价格异议", note: "拿中转比价施压", triggersScriptId: "renew-s-objection", triggersRecommendationId: "r-1024-1" },
    { atSec: 21, level: "high", needType: "质检新需求", note: "主动抛出质检智能化诉求", triggersRecommendationId: "r-1024-2" },
    { atSec: 31, level: "high", needType: "成交信号", note: "确认续约 + 索要增值包方案" },
  ],
  recommendations: {
    "r-1024-1": {
      id: "r-1024-1",
      type: "renew",
      title: "包年锁价续约,化解预算顾虑",
      targetModelId: "通义千问-Max",
      targetPlanId: "包年企业版",
      reason: "客户担心成本与调价 —— 包年锁价给预算确定性,正面回应。",
      quoteRange: [180000, 210000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数", score: 96.4,
        factors: [
          { key: "capability", label: "能力分", value: 92, display: "92", source: { label: "天翼云模型评测台", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.998, display: "99.8%", source: { label: "可用性监控 · 30 天", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 1.05, display: "×1.05", source: { label: "定价知识库 · 包年", collectedAt: "2026-06-01" } },
        ],
      },
    },
    "r-1024-2": {
      id: "r-1024-2",
      type: "addon",
      title: "加推质检 Agent 增值包",
      targetModelId: "通义千问-Max",
      reason: "客户主动提到质检场景 —— 顺势加推,采纳概率高。",
      quoteRange: [36000, 52000],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数", score: 88.2,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.94, display: "94%", source: { label: "客户用量画像", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.92, display: "92%", source: { label: "同行业案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.02, display: "×1.02", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  },
  scripts: toScriptMap(RENEW_SCRIPTS),
  summary:
    "客户确认续约「通义千问-Max 包年企业版」,接受包年锁价;对质检 Agent 增值包有明确兴趣,需补发方案。比价异议已用合规 + 锁价话术化解。",
};

// ============ c-1031 · upgrade (升级) ============
const SESSION_UPGRADE: CopilotScript = {
  customerId: "c-1031",
  customerName: "锦书文化传媒",
  maxSec: 32,
  transcript: [
    { speaker: "manager", text: "林总您好,这几个月贵司调用量翻了一倍,按量版额度可能快触顶了,今天想跟您聊聊升级方案。", atSec: 0 },
    { speaker: "customer", text: "对,我们内容团队用得越来越多,确实感觉有时候会限流。", atSec: 4 },
    { speaker: "manager", text: "升级到包年企业版后,并发配额翻 3 倍,还能享受优先调度,高峰期不再排队。", atSec: 9 },
    { speaker: "customer", text: "但包年一下子要多付不少,我们老板那边怕不好过。", atSec: 14 },
    { speaker: "manager", text: "按当前的增速,下季度超量费用会比升级费高出 30% 以上,升级等于提前锁定更低单价。", atSec: 18 },
    { speaker: "customer", text: "嗯,这么算倒是有道理。那除了额度,还有什么别的优势?对了,能加内容批量生成的 Agent 吗?我们产出压力挺大。", atSec: 23 },
    { speaker: "manager", text: "有的!升级后可以加推内容生成 Agent,批量产出效率翻 3 倍,同行业用得非常好,我给您做个 POC 演示。", atSec: 27 },
    { speaker: "customer", text: "好,先把升级方案发我,我找老板汇报。", atSec: 30 },
  ],
  intents: [
    { atSec: 4, level: "medium", needType: "限流感知", note: "客户确认用量增长且有感知" },
    { atSec: 14, level: "medium", needType: "价格顾虑", note: "客户担心升级预算不好过", triggersScriptId: "upgrade-s-objection", triggersRecommendationId: "r-1031-1" },
    { atSec: 23, level: "high", needType: "内容生成需求", note: "主动提出批量生成诉求", triggersRecommendationId: "r-1031-2" },
    { atSec: 30, level: "high", needType: "成交信号", note: "要求发方案,准备汇报" },
  ],
  recommendations: {
    "r-1031-1": {
      id: "r-1031-1",
      type: "upgrade",
      title: "升级至包年企业版,锁定更低单价",
      targetModelId: "DeepSeek-V3",
      targetPlanId: "包年企业版",
      reason: "用量翻倍即将触达按量版上限 —— 升级后配额翻 3 倍,单位成本降 35%。",
      quoteRange: [72000, 96000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数", score: 91.7,
        factors: [
          { key: "capability", label: "能力分", value: 88, display: "88", source: { label: "天翼云模型评测台", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.995, display: "99.5%", source: { label: "可用性监控 · 30 天", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 1.08, display: "×1.08", source: { label: "定价知识库 · 包年折扣", collectedAt: "2026-06-01" } },
        ],
      },
    },
    "r-1031-2": {
      id: "r-1031-2",
      type: "addon",
      title: "加推内容生成 Agent,释放创作效率",
      targetModelId: "DeepSeek-V3",
      reason: "内容团队产出压力大 —— Agent 批量生产预计提升 3 倍效率。",
      quoteRange: [18000, 30000],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数", score: 85.6,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.91, display: "91%", source: { label: "客户用量画像", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.88, display: "88%", source: { label: "同行业案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.05, display: "×1.05", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  },
  scripts: toScriptMap(UPGRADE_SCRIPTS),
  summary:
    "客户用量翻倍,确认有升级意向;升级成本顾虑已用量化对比(超量费 > 升级费)化解。对内容生成 Agent 增值包有明确兴趣,需发方案并安排 POC 演示。",
};

// ============ c-1042 · expand (扩容) ============
const SESSION_EXPAND: CopilotScript = {
  customerId: "c-1042",
  customerName: "恒生金服数科",
  maxSec: 36,
  transcript: [
    { speaker: "manager", text: "吴总监您好,我们看到贵司最近多个部门都在接入模型能力,调用量增长非常快,想给您出个扩容方案。", atSec: 0 },
    { speaker: "customer", text: "确实,研发部、风控部、运营部都在用,共享一个额度经常打架。", atSec: 5 },
    { speaker: "manager", text: "我们可以给每个部门分配独立配额和独立密钥,统一走您的账户结算,互不影响。", atSec: 10 },
    { speaker: "customer", text: "这个好,但跨部门协调很麻烦,业务部门不一定配合。", atSec: 15 },
    { speaker: "manager", text: "我们有一键模板方案:您确定总预算和各部门占比后,我们帮配好独立密钥和监控看板,给到每个部门的直接是开箱即用的东西。", atSec: 19 },
    { speaker: "customer", text: "那不错,省了我们不少事。对了,监管那边要求我们留调用审计日志,这个能搞定吗?", atSec: 24 },
    { speaker: "manager", text: "没问题,我们可以加推合规审计 Agent,自动输出各部门调用审计日志,满足监管报送,同行业都在用。", atSec: 28 },
    { speaker: "customer", text: "行,那扩容方案和审计方案一起发我,我内部评估一下。", atSec: 33 },
  ],
  intents: [
    { atSec: 5, level: "medium", needType: "多部门争抢资源", note: "共享额度成为瓶颈" },
    { atSec: 15, level: "medium", needType: "管理复杂度顾虑", note: "担心跨部门协调困难", triggersScriptId: "expand-s-objection", triggersRecommendationId: "r-1042-1" },
    { atSec: 24, level: "high", needType: "监管合规需求", note: "审计日志为刚需", triggersRecommendationId: "r-1042-2" },
    { atSec: 33, level: "high", needType: "成交信号", note: "要求出方案评估" },
  ],
  recommendations: {
    "r-1042-1": {
      id: "r-1042-1",
      type: "expand",
      title: "多部门独立配额扩容方案",
      targetModelId: "文心一言-4.0",
      reason: "多部门争抢共享额度 —— 独立配额解决资源竞争,统一管控。",
      quoteRange: [320000, 420000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数", score: 94.2,
        factors: [
          { key: "capability", label: "能力分", value: 95, display: "95", source: { label: "天翼云模型评测台", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.999, display: "99.9%", source: { label: "可用性监控 · 30 天", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 0.98, display: "×0.98", source: { label: "定价知识库 · 扩容折扣", collectedAt: "2026-06-01" } },
        ],
      },
    },
    "r-1042-2": {
      id: "r-1042-2",
      type: "addon",
      title: "加推合规审计 Agent",
      targetModelId: "文心一言-4.0",
      reason: "监管审计日志为刚需 —— 自动输出各部门调用审计日志。",
      quoteRange: [42000, 68000],
      evidenceChain: {
        formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数", score: 92.4,
        factors: [
          { key: "fit", label: "场景匹配", value: 0.97, display: "97%", source: { label: "客户用量画像", collectedAt: "2026-06-07" } },
          { key: "certainty", label: "落地确定性", value: 0.95, display: "95%", source: { label: "同行业案例库", collectedAt: "2026-05-20" } },
          { key: "valueFactor", label: "增值系数", value: 1.03, display: "×1.03", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
        ],
      },
    },
  },
  scripts: toScriptMap(EXPAND_SCRIPTS),
  summary:
    "客户多部门用量激增,扩容意愿明确;管理复杂度顾虑已用一键模板方案化解。对合规审计 Agent 有刚需,需出扩容+审计联合方案。",
};

// ============ c-1055 · silent (沉默) ============
const SESSION_SILENT: CopilotScript = {
  customerId: "c-1055",
  customerName: "蓝橙教育",
  maxSec: 30,
  transcript: [
    { speaker: "manager", text: "陈老师您好,看到贵司近两个月调用量有些下降,想了解一下情况,看看是不是方案不太匹配了。", atSec: 0 },
    { speaker: "customer", text: "哎,行业淡季加上预算砍了一刀,现在余额也不多了。", atSec: 5 },
    { speaker: "manager", text: "理解,教育行业确实有季节性。我们有个轻量入门版,月费不到原来一半,核心对话能力全保留。", atSec: 9 },
    { speaker: "customer", text: "轻量版是便宜,但我们现在预算实在紧张,可能先停一停。", atSec: 14 },
    { speaker: "manager", text: "那要不帮您开一个最低成本的保号方案?月付几十块保留账号和数据配置,等旺季恢复时直接复用,不用重新对接。", atSec: 18 },
    { speaker: "customer", text: "这个倒可以,保留配置挺好的,省得到时候重新接。", atSec: 23 },
    { speaker: "manager", text: "好的我安排上,先给您切到保号方案,后面量上来了随时扩回去。", atSec: 27 },
  ],
  intents: [
    { atSec: 5, level: "low", needType: "行业淡季", note: "用量下滑主因是季节性+预算削减" },
    { atSec: 14, level: "medium", needType: "预算不足", note: "预算紧张,考虑暂停服务", triggersScriptId: "silent-s-objection", triggersRecommendationId: "r-1055-1" },
    { atSec: 23, level: "high", needType: "保号方案接受", note: "客户接受低成本保号方案" },
    { atSec: 27, level: "medium", needType: "后续可恢复", note: "承诺旺季可随时升级恢复" },
  ],
  recommendations: {
    "r-1055-1": {
      id: "r-1055-1",
      type: "renew",
      title: "切换至轻量入门版或按量付费,大幅降低成本",
      targetModelId: "智谱 GLM-4",
      targetPlanId: "轻量入门版",
      reason: "预算紧张 —— 轻量版月费降 60%,或按量付费零门槛。",
      quoteRange: [12000, 18000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数", score: 78.5,
        factors: [
          { key: "capability", label: "能力分", value: 82, display: "82", source: { label: "天翼云模型评测台", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.99, display: "99.0%", source: { label: "可用性监控 · 30 天", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 0.85, display: "×0.85", source: { label: "定价知识库 · 轻量套餐", collectedAt: "2026-06-01" } },
        ],
      },
    },
  },
  scripts: toScriptMap(SILENT_SCRIPTS),
  summary:
    "客户因行业淡季和预算削减导致用量下滑。预算不足异议已用保号方案化解,客户接受低成本保号方案保留配置。需跟进切换并记录回访时间。",
};

// ============ c-2003 · newLead (新客线索) ============
const SESSION_NEWLEAD: CopilotScript = {
  customerId: "c-2003",
  customerName: "途新出行",
  maxSec: 32,
  transcript: [
    { speaker: "manager", text: "赵经理您好,了解到贵司正在推进 AI 能力落地,我这边可以帮您看看出行行业的方案。", atSec: 0 },
    { speaker: "customer", text: "是的,我们在评估智能客服和路线规划这一块,你们能做什么?", atSec: 4 },
    { speaker: "manager", text: "出行行业我们很熟悉,同城货运和网约车平台都有落地案例。我们可以提供智能客服 + 路线规划的方案。", atSec: 8 },
    { speaker: "customer", text: "但我们已经在用别家的了,换起来太麻烦了吧?", atSec: 13 },
    { speaker: "manager", text: "理解您顾虑。我们可以提供免费 POC 环境,零承诺先跑一遍真实场景,看完效果再决定。而且我们是备案直连模型,数据不出境,渠道纯度可出证明。", atSec: 17 },
    { speaker: "customer", text: "数据不出境这个倒是加分项,合规那边一直强调。那你们首月怎么收费?", atSec: 23 },
    { speaker: "manager", text: "首月充值金额全额抵扣次月费用,效果不满意全额退。先把 POC 跑起来,我帮您安排对接。", atSec: 27 },
    { speaker: "customer", text: "好,先把 POC 方案发我看看。", atSec: 30 },
  ],
  intents: [
    { atSec: 4, level: "medium", needType: "需求确认", note: "客户明确智能客服和路线规划场景" },
    { atSec: 13, level: "medium", needType: "供应商锁定", note: "已有供应商,担心切换麻烦", triggersScriptId: "newlead-s-objection", triggersRecommendationId: "r-2003-1" },
    { atSec: 23, level: "high", needType: "合规关注", note: "数据不出境是加分项" },
    { atSec: 30, level: "high", needType: "成交信号", note: "要求发 POC 方案" },
  ],
  recommendations: {
    "r-2003-1": {
      id: "r-2003-1",
      type: "upgrade",
      title: "入门推荐:通义千问-Turbo 按量版 + POC 验证",
      targetModelId: "通义千问-Turbo",
      targetPlanId: "按量标准版",
      reason: "新客首次接入,建议从性价比最优的模型 + POC 方案开始。",
      quoteRange: [5000, 15000],
      evidenceChain: {
        formula: "综合分 = 能力分 × 可用率 × 成本系数", score: 85.3,
        factors: [
          { key: "capability", label: "能力分", value: 86, display: "86", source: { label: "天翼云模型评测台", collectedAt: "2026-05-30" } },
          { key: "availability", label: "可用率", value: 0.995, display: "99.5%", source: { label: "可用性监控 · 30 天", collectedAt: "2026-06-08" } },
          { key: "costFactor", label: "成本系数", value: 0.92, display: "×0.92", source: { label: "定价知识库 · 新客优惠", collectedAt: "2026-06-01" } },
        ],
      },
    },
  },
  scripts: toScriptMap(NEWLEAD_SCRIPTS),
  summary:
    "新客户有智能客服和路线规划场景需求,已有供应商顾虑用 POC 零风险方案化解。客户对数据不出境有明确偏好,需发送 POC 方案并安排技术对接。",
};

const SESSIONS: Record<string, CopilotScript> = {
  "c-1024": SESSION_RENEW,
  "c-1031": SESSION_UPGRADE,
  "c-1042": SESSION_EXPAND,
  "c-1055": SESSION_SILENT,
  "c-2003": SESSION_NEWLEAD,
};

/** 取某客户的通话剧本;演示阶段未命中则回退到 c-1024。 */
export function getCopilotScript(customerId: string): CopilotScript {
  return SESSIONS[customerId] ?? SESSION_RENEW;
}
