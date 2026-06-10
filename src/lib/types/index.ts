/**
 * 智枢 · 全局数据类型定义(Phase 1 IA 落地)
 *
 * 约定:
 * - 所有金额单位为「元」;百分比类字段(可用率、缓存折扣等)统一用 0~1 的小数表示。
 * - 时间统一用 ISO 字符串(如 "2026-06-01")。
 * - 这是 mock 与 UI 共用的契约;未来接后端时即为 API 返回结构,改这里即可。
 */

// ============ 通用 ============
export type Trend = "up" | "down" | "flat";

/** 时间序列单点,用于趋势图。 */
export interface TimeSeriesPoint {
  date: string; // ISO date
  value: number;
}

/** 数据来源与采集时间,挂在证据链每个分项上,支撑「可核验」。 */
export interface SourceRef {
  label: string; // 如 "天翼云模型评测台 / 2026Q2 基准集"
  collectedAt: string; // ISO date,采集时间
}

// ============ 证据链(招牌主线) ============
/** 评分公式中的一个分项。 */
export interface EvidenceFactor {
  key: string; // "capability" | "availability" | "costFactor" ...
  label: string; // "能力分" / "可用率" / "成本系数"
  value: number; // 分项数值
  weight?: number; // 权重(可选)
  source: SourceRef; // 该项数据来源与采集时间
}

/** 一条推荐背后的完整可核验证据链。 */
export interface EvidenceChain {
  formula: string; // "综合分 = 能力分 × 可用率 × 成本系数"
  score: number; // 综合分
  factors: EvidenceFactor[];
}

// ============ 模型 / 套餐 ============
export type CapabilityTier = "S" | "A" | "B" | "C";

export interface Model {
  id: string;
  name: string; // 脱敏/假数据
  vendor: string; // 备案厂商
  capabilityTier: CapabilityTier;
  capabilityScore: number; // 0~100
  priceInputPer1k: number; // 输入 token 单价(元/千 token)
  priceOutputPer1k: number; // 输出 token 单价(元/千 token)
  cacheDiscount: number; // 缓存折扣 0~1(越大越省)
  ttftMs: number; // 首 token 延迟(毫秒)
  tpotMs: number; // 单 token 输出耗时(毫秒)
  availability: number; // 可用率 0~1
  channelPurity: number; // 渠道纯度 0~1(差异化卖点)
  useCases: string[]; // 适配场景
  filed: boolean; // 是否已备案
}

export type BillingMode = "payg" | "package"; // 按量 / 包年包月

export interface PricingPlan {
  id: string;
  modelId: string;
  name: string;
  tier: "toB" | "toC";
  billingMode: BillingMode;
  listPrice: number; // 标准价(元)
  negotiableRange: [number, number]; // 议价区间
  quotaTokens?: number; // 套餐含量(token)
}

// ============ 客户 / 用量 ============
export type OpportunityStage =
  | "renew" // 该续费
  | "upgrade" // 可升级
  | "expand" // 可扩容
  | "silent" // 沉默预警
  | "newLead"; // 新客线索

export interface Customer {
  id: string;
  name: string; // 脱敏假企业名
  industry: string;
  isNew: boolean; // 新客无用量数据
  currentModelId?: string;
  currentPlanId?: string;
  balance?: number; // 余额(元)
  expireAt?: string; // 到期时间
  stage: OpportunityStage;
  tags: string[];
  ownerManagerId: string;
  contact?: string; // 联系人(脱敏)
  monthlySpend?: number; // 月消费(元)
}

export interface UsageRecord {
  customerId: string;
  series: TimeSeriesPoint[]; // 用量趋势(按日/周)
  rateLimitHits: number; // 限流次数
  errorCount: number; // 报错次数
  lastActiveAt: string;
}

// ============ 推荐 ============
export type RecommendationType =
  | "renew"
  | "upgrade"
  | "expand"
  | "switch"
  | "addon";

export interface Recommendation {
  id: string;
  customerId?: string; // 向导场景可空
  type: RecommendationType;
  title: string; // 一句话主张,如 "升级到 包年企业版"
  targetModelId: string;
  targetPlanId?: string;
  reason: string; // 更省 / 更稳 / 更配场景
  quoteRange: [number, number]; // 报价区间
  evidenceChain: EvidenceChain; // ★ 可核验证据链
}

// ============ 话术 ============
export type ScriptScene =
  | "opening"
  | "sellingPoint"
  | "objection"
  | "pricing"
  | "renewal";

export interface TalkScript {
  id: string;
  customerId?: string;
  scene: ScriptScene;
  title: string;
  content: string;
  objection?: string; // objection 场景:客户可能的异议
}

// ============ 通话会话 ============
export type IntentLevel = "high" | "medium" | "low";

export interface TranscriptLine {
  speaker: "customer" | "manager";
  text: string;
  atSec: number; // 进入时间(秒),驱动定时器
}

export interface IntentEvent {
  atSec: number;
  level: IntentLevel;
  needType: string; // 需求类型
  note?: string; // 弹屏提示语
  triggersRecommendationId?: string; // 触发动态推荐弹屏
  triggersScriptId?: string; // 触发动态话术弹屏
}

export interface CallSession {
  id: string;
  customerId: string;
  transcript: TranscriptLine[];
  intentTimeline: IntentEvent[];
  opportunity: {
    level: IntentLevel;
    needType: string;
    stage: OpportunityStage;
  };
  summary?: string; // 通话结束生成的复盘摘要
}

// ============ 公告 / 告警 ============
export type AnnouncementKind =
  | "priceChange"
  | "incident"
  | "maintenance"
  | "shelf";

export interface Announcement {
  id: string;
  kind: AnnouncementKind;
  title: string;
  body: string;
  modelId?: string;
  publishedAt: string;
  resolvedAt?: string; // 故障处理完成时间
}

// ============ 指标 ============
export interface Metric {
  key: string; // "managerEfficiency" | "renewRate" | "adoptionRate" ...
  label: string;
  value: number;
  unit?: string;
  baseline?: number; // 现状基线(对比用)
  target?: number; // 目标值
  trend?: Trend;
  series?: TimeSeriesPoint[];
}

// ============ 四问选型向导 ============
export interface WizardQuestion {
  id: string;
  question: string;
  field: "scene" | "scale" | "latency" | "budget";
  options: { label: string; value: string }[];
}
