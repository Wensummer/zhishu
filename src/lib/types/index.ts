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
  value: number; // 分项数值(参与计算)
  display?: string; // 预格式化展示串(各分项单位不同,如 "99.8%" / "×1.05");缺省则展示 value
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
  telecomProducts?: string[]; // 其他电信业务推荐(产品名称列表)
}

export interface UsageRecord {
  customerId: string;
  series: TimeSeriesPoint[]; // 用量趋势(按日/周)
  rateLimitHits: number; // 限流次数
  errorCount: number; // 报错次数
  lastActiveAt: string;
}

// ============ 企业画像(企查查嵌入) ============

/** 工商基本信息。 */
export interface EnterpriseProfile {
  name: string;
  /** 统一社会信用代码 */
  creditCode: string;
  legalPerson: string;
  registeredCapital: string;
  /** 成立日期 */
  establishDate: string;
  /** 经营状态 */
  businessStatus: string;
  address: string;
  /** 经营范围(摘要) */
  businessScope: string;
  /** 联系人/决策人(销售话术用) */
  contactPerson?: string;
  /** 联系电话 */
  contactPhone?: string;
}

/** 主要人员。 */
export interface EnterpriseKeyPersonnel {
  name: string;
  title: string;     // 董事长 / 总经理 / 财务负责人 / 技术总监
}

/** 股东信息。 */
export interface EnterpriseShareholder {
  name: string;
  /** 出资比例 */
  ratio: string;
  /** 认缴出资额 */
  amount: string;
}

/** 实际控制人。 */
export interface EnterpriseController {
  name: string;
  /** 控制比例 */
  ratio: string;
  /** 控制路径简述 */
  path?: string;
}

/** 对外投资/分支机构。 */
export interface EnterpriseBranch {
  name: string;
  /** 投资比例 */
  ratio: string;
  /** 投资金额 */
  amount: string;
  businessStatus: string;
}

/** 荣誉资质。 */
export interface EnterpriseHonor {
  name: string;
  issuer: string;    // 颁发机构
  date: string;
}

/** 融资动态。 */
export interface EnterpriseFunding {
  round: string;     // 天使轮 / A轮 / B轮
  amount: string;
  date: string;
  investors: string; // 投资方
}

/** 风险记录。 */
export interface EnterpriseRiskItem {
  type: string;       // "经营异常" / "行政处罚" / "裁判文书" / "失信被执行"
  title: string;
  date: string;
  amount?: string;    // 涉及金额(可选)
  department?: string; // 执行机关
  detail: string;
}

/** 新闻舆情。 */
export interface EnterpriseNews {
  title: string;
  url: string;
  date: string;
  /** 情感:积极 / 中性 / 消极 */
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
}

/** 知识产权。 */
export interface EnterpriseIPR {
  type: "patent" | "trademark" | "copyright";
  name: string;
  regNo: string;
  status: string;
  applyDate: string;
}

/** 招投标记录。 */
export interface EnterpriseBid {
  title: string;
  publishDate: string;
  amount: string;
  buyer: string;
}

/** 企业画像(企查查信息聚合)。 */
export interface EnterpriseInfo {
  profile: EnterpriseProfile;
  /** 主要人员(决策链,用于话术/拜访对象)。 */
  personnel: EnterpriseKeyPersonnel[];
  /** 股东信息。 */
  shareholders: EnterpriseShareholder[];
  /** 实际控制人。 */
  controller?: EnterpriseController;
  /** 对外投资/分支机构(判断交叉销售机会)。 */
  branches: EnterpriseBranch[];
  /** 荣誉资质(简报资质背书)。 */
  honors: EnterpriseHonor[];
  /** 融资动态(了解资金状况)。 */
  funding: EnterpriseFunding[];
  risks: EnterpriseRiskItem[];
  news: EnterpriseNews[];
  ipr: EnterpriseIPR[];
  bids: EnterpriseBid[];
}

// ============ 计费明细 ============
export interface BillingRecord {
  id: string;
  date: string; // ISO date
  model: string; // 模型名称
  modelId: string;
  apiKeyName: string; // API Key 名称
  tokens: number; // 消费 token 数
  inputTokens: number;
  outputTokens: number;
  amount: number; // 消费金额(元)
  unitPrice: number; // 单价(元/千 token)
  billingMode: BillingMode;
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

// ============ 其他电信业务推荐 ============
export interface TelecomProduct {
  id: string;
  name: string;
  description: string;
  category: string; // 如 "云专线" / "云安全" / "云会议"
  reason: string; // 推荐理由
  estimatedPrice: string; // 预估价格描述
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

// ============ 系统模型配置(各能力位绑定的模型) ============
/** 语音转写(ASR)模型 —— 与对话模型池不同的一类候选。 */
export interface AsrModel {
  id: string;
  name: string;
  vendor: string;
  filed: boolean; // 是否已备案
  realtime: boolean; // 是否支持流式实时转写
  latencyMs?: number; // 参考首字延迟
}

/** 系统能力位:平台自身各环节用哪个模型(对内编排,区别于对外可售的模型池)。 */
export type CapabilitySlotKey =
  | "asr" // 语音转写
  | "chatbot" // 配置答疑
  | "intent" // 意图识别
  | "summary" // 复盘摘要
  | "selection"; // 选型 RAG

/** 候选来源:对话模型池 / 语音模型。 */
export type SlotKind = "chat" | "asr";

/** 系统模型配置:能力位 → 选定模型 id。 */
export interface SystemModelConfig {
  bindings: Record<CapabilitySlotKey, string>;
  updatedAt?: string;
}
