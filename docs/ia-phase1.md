# 智枢 · 第一阶段信息架构(Phase 1 IA)

> 状态:**待确认**。本文件只定义架构(页面/功能点/组件/数据类型/路由),不含实现。确认后进入 Phase 2 脚手架。

---

## 0. 总体决策

| 维度 | 决策 |
| --- | --- |
| 框架 | Next.js 14 App Router + TypeScript |
| 样式 | Tailwind + shadcn/ui,图表 Recharts |
| 数据 | 全 mock,集中放 `/lib/mock`,`/lib/types` 定义 interface,`/lib/recommendation` 抽出选型评分逻辑(简报/向导/横评共用) |
| 角色 | 单应用 + 顶部角色切换器:`manager`(客户经理)/`admin`(管理员)/`boss`(甲方老板)/`enduser`(C端)。角色存于 React Context + URL query,切换即换导航与可见页面 |
| 主题 | 明暗双主题(next-themes),数据可读性优先 |
| 演示动线 | `/wizard` 选型 → `/workbench/briefing/[id]` 简报 → `/workbench/copilot/[id]` 通话,P0 三页打通 |
| 根路由 | `/` = 客户经理工作台(开箱即进主动线);落地页移到 `/landing` |
| 数据规模 | 中等:约 8 模型 / 15 客户 / 1~2 条完整 copilot 剧本 |
| 答疑 chatbot | 全局浮窗(右下角),任意页可唤起 |
| 招牌组件 | `EvidenceChainCard` 在简报、四问向导、横评表三处复用,是差异化主线 |

---

## 1. 路由与目录结构

```
src/
├── app/
│   ├── layout.tsx                      # 根布局:主题/角色 Provider、顶栏、角色切换器、全局 SupportChatbot 浮窗
│   ├── page.tsx                        # P0-1 客户经理工作台首页(根路由)
│   ├── landing/page.tsx                # P2-8 平台落地页
│   ├── workbench/
│   │   ├── briefing/[customerId]/page.tsx   # P0-2 通话前智能简报
│   │   └── copilot/[customerId]/page.tsx    # P0-3 通话中实时 copilot
│   ├── wizard/page.tsx                 # P1-4 四问选型向导(toC 自助)
│   ├── models/page.tsx                 # P1-5 模型横评 / 比价
│   ├── status/page.tsx                 # P1-6 可用性监控状态页
│   ├── admin/
│   │   ├── page.tsx                    # P1-7 管理侧数据大屏
│   │   ├── products/page.tsx           # P2-12 产品配置(模型/套餐上下架)
│   │   ├── pricing/page.tsx            # P2-12 价格与优惠配置(含调价公示)
│   │   ├── operations/page.tsx         # P2-12 运营分析
│   │   └── compliance/page.tsx         # P2-12 合规管理(脱敏/权限/审计/留痕)
│   ├── panel/
│   │   ├── boss/page.tsx               # P2-9 甲方老板面板
│   │   ├── member/page.tsx             # P2-9 甲方个人面板
│   │   └── user/page.tsx               # P2-9 C 端用户面板
│   └── console/page.tsx                # P2-10 统一接入 API 控制台(含接入文档入口)
│
├── components/
│   ├── layout/                         # TopNav、RoleSwitcher、ThemeToggle、SideNav、PageHeader
│   ├── evidence/EvidenceChainCard.tsx  # ★ 招牌:可核验证据链卡(可展开公式分解+分项+来源+采集时间)
│   ├── models/
│   │   ├── ModelComparisonTable.tsx    # ★ 可复用:横评表(排序/筛选/悬浮详情)
│   │   └── PriceCompareChart.tsx       # 比价图表(Recharts,悬浮看单点)
│   ├── status/
│   │   ├── HealthBarometer.tsx         # ★ 可复用:模型晴雨表(整体健康度)
│   │   ├── MetricTrendChart.tsx        # 可用率/缓存率/TTFT/TPOT 趋势
│   │   └── AnnouncementTimeline.tsx    # 调价/故障公告时间线
│   ├── copilot/
│   │   ├── LiveCopilotPanel.tsx        # ★ 可复用:实时弹屏推荐+话术容器
│   │   ├── TranscriptStream.tsx        # 模拟 ASR 逐句转写
│   │   └── IntentBadge.tsx             # 意图/商机意向标签
│   ├── workbench/
│   │   ├── CustomerTable.tsx           # 客户/商机列表
│   │   ├── OpportunityTag.tsx          # 该续费/可升级/可加推 标签
│   │   ├── FunnelOverview.tsx          # 漏斗概览
│   │   ├── RecommendationCard.tsx      # 推荐项(内嵌 EvidenceChainCard)
│   │   └── TalkScriptCard.tsx          # 随身话术
│   ├── wizard/QuestionStep.tsx         # 四问向导单步
│   ├── support/SupportChatbot.tsx      # P2-11 配置答疑 chatbot(mock RAG)
│   ├── charts/                         # 通用图表封装(Line/Bar/Funnel/Gauge)
│   └── shared/                         # MaskedField(密钥脱敏)、StatCard、TrendBadge、EmptyState
│
├── lib/
│   ├── types/                          # 所有 TS interface(见第 4 节),按域拆文件 + index 汇出
│   ├── mock/                           # mock 数据,按域拆文件:models, customers, usage, recommendations,
│   │                                   #   scripts, sessions, announcements, metrics, plans
│   ├── recommendation/score.ts         # ★ 选型评分逻辑(纯函数,产出 evidenceChain),三处复用
│   ├── roles.ts                        # 角色定义、各角色可见导航
│   └── utils.ts                        # 格式化(货币/百分比/时间)、脱敏函数
│
└── styles / tailwind / shadcn 配置
```

---

## 2. 各页面功能点 + 组件拆分

### P0-1 客户经理工作台首页 `/workbench`
- **功能点**:存量+新客客户列表(可搜索/筛选);每行商机判断标签(该续费/可升级/可加推/沉默预警);漏斗概览(线索→商机→报价→成交);关键人效卡片(本月跟进数/采纳率)。行点击 → 跳简报页。
- **组件**:`PageHeader`、`FunnelOverview`、`StatCard×N`、`CustomerTable`(内 `OpportunityTag`)。
- **数据**:`Customer[]`、`Metric[]`、漏斗聚合(由 mock 派生)。

### P0-2 通话前智能简报 `/workbench/briefing/[customerId]`
- **功能点(四块)**:
  1. 使用情况:在用模型/套餐、用量趋势(图)、余额与到期、限流/报错记录。
  2. 推荐选型:主推型号/套餐 + 理由 + 续费/升级/扩容建议 + 报价区间,**每条附 `EvidenceChainCard`**(综合分=能力分×可用率×成本系数,分项值+来源+采集时间)。
  3. 随身话术:开场/卖点/异议应对。
  4. 商机判断:当前阶段 + 下一步动作 + 「进入通话」按钮(→ copilot)。
- **组件**:`MetricTrendChart`、`RecommendationCard`(内嵌 `EvidenceChainCard`)、`TalkScriptCard`、`OpportunityTag`。
- **数据**:`Customer`、`UsageRecord[]`、`Recommendation[]`、`TalkScript[]`。

### P0-3 通话中实时 copilot `/workbench/copilot/[customerId]`
- **功能点**:定时器逐句喂入 mock 对话(`TranscriptStream`);实时意图识别 + 商机分类(高/中/低意向、需求类型,`IntentBadge`);客户抛新需求/异议时动态弹屏更新推荐与话术(`LiveCopilotPanel`,触发新 `Recommendation`/`EvidenceChainCard`);通话结束生成复盘摘要,标注回流话术库/商机库。
- **组件**:`TranscriptStream`、`LiveCopilotPanel`(含动态 `RecommendationCard` + `TalkScriptCard`)、`IntentBadge`、复盘摘要卡。
- **数据**:`CallSession`(transcript[] / intentTimeline / opportunity / summary)。
- **交互机制**:`setInterval` 推进 transcript 指针;预置「触发点」(某句触发某个意图/弹屏),纯前端驱动,可暂停/重播。

### P1-4 四问选型向导 `/wizard`(toC 自助)
- **功能点**:3~5 个结构化问题(场景/量级/延迟敏感度/预算)→ 调用 `lib/recommendation/score.ts` → 推荐 + `EvidenceChainCard`。复用同一选型逻辑。
- **组件**:`QuestionStep`、结果区 `RecommendationCard` + `EvidenceChainCard`。
- **数据**:`WizardQuestion[]`、产出 `Recommendation`。

### P1-5 模型横评 / 比价 `/models`
- **功能点**:简约表格(价格、可用率、TTFT、TPOT、缓存折扣、渠道纯度、适配场景),排序/筛选;比价图表悬浮看单点详情;行内可展开 `EvidenceChainCard`。
- **组件**:`ModelComparisonTable`、`PriceCompareChart`。
- **数据**:`Model[]`、`PricingPlan[]`。

### P1-6 可用性监控状态页 `/status`
- **功能点**:`HealthBarometer` 整体健康度;分模型可用率/缓存率/TTFT/TPOT 实时值 + 7/30 天趋势;调价公告制度;故障公告时间线。
- **组件**:`HealthBarometer`、`MetricTrendChart`、`AnnouncementTimeline`。
- **数据**:`Model[]`、`Metric[]`、`Announcement[]`/`Alert[]`。

### P1-7 管理侧数据大屏 `/admin`
- **功能点**:客户经理人效;商机漏斗与转化归因;续费/扩容率;推荐采纳率;选型相关客诉率。
- **组件**:`StatCard`、`FunnelOverview`、各类 `charts`。
- **数据**:`Metric[]`、聚合派生数据。

### P2(占位/可看版本)
- **8 平台落地页 `/`**:定位、价值主张、灰中转痛点对照表(跑路/倍率跳变/财税缺口/渠道掺假/服务上限/隐私)、合规差异化、CTA 进入向导/工作台。
- **9 多面板** `/panel/{boss,member,user}`:总量/成本/各部门用量 ‖ 个人用量额度 ‖ C端用量/计费/余额。
- **10 API 控制台 `/console`**:one key(`MaskedField` 脱敏)、OpenAI-compatible 说明、接入文档入口。
- **11 配置答疑 chatbot**:`SupportChatbot`,mock 技术 RAG,可作为全局浮窗或 `/support` 页。
- **12 管理侧其余** `/admin/{products,pricing,operations,compliance}`:产品上下架与分层 / 价格优惠与调价公示 / 运营分析 / 合规(脱敏/权限/审计/留痕)。

---

## 3. 角色 → 可见导航映射

| 角色 | 默认落地 | 可见入口 |
| --- | --- | --- |
| manager 客户经理 | `/` | 工作台、简报、copilot、模型横评、状态页、向导 |
| admin 管理员 | `/admin` | 数据大屏、产品配置、价格配置、运营分析、合规、状态页 |
| boss 甲方老板 | `/panel/boss` | 老板面板、API 控制台、状态页 |
| enduser C端 | `/panel/user` | 个人面板、向导、控制台、答疑 chatbot |

落地页 `/landing` 由顶栏 Logo/链接进入;答疑 chatbot 为全局浮窗,对所有角色可见。

---

## 4. 核心 TS 数据类型(草案)

> 放 `src/lib/types`,按域拆文件后由 `index.ts` 汇出。以下为 Phase 1 草案,字段命名/取值在确认后微调。

```ts
// ---------- 通用 ----------
export type Trend = "up" | "down" | "flat";
export interface TimeSeriesPoint { date: string; value: number; }      // ISO date
export interface SourceRef { label: string; collectedAt: string; }     // 数据来源 + 采集时间

// ---------- 证据链(招牌) ----------
export interface EvidenceFactor {
  key: string;            // 如 "capability" | "availability" | "costFactor"
  label: string;          // "能力分" / "可用率" / "成本系数"
  value: number;          // 分项数值
  weight?: number;        // 权重(可选)
  source: SourceRef;      // 该项来源与采集时间
}
export interface EvidenceChain {
  formula: string;        // "综合分 = 能力分 × 可用率 × 成本系数"
  score: number;          // 综合分
  factors: EvidenceFactor[];
}

// ---------- 模型 / 套餐 ----------
export type CapabilityTier = "S" | "A" | "B" | "C";
export interface Model {
  id: string;
  name: string;           // 如 "通义千问-Max"(脱敏/假数据)
  vendor: string;         // 备案厂商
  capabilityTier: CapabilityTier;
  capabilityScore: number;
  priceInputPer1k: number;   // 输入 token 单价
  priceOutputPer1k: number;  // 输出 token 单价
  cacheDiscount: number;     // 缓存折扣 0~1
  ttftMs: number;            // 首 token 延迟
  tpotMs: number;            // 单 token 输出耗时
  availability: number;      // 可用率 0~1
  channelPurity: number;     // 渠道纯度 0~1(差异化卖点)
  useCases: string[];        // 适配场景
  filed: boolean;            // 是否已备案
}
export type BillingMode = "payg" | "package";   // 按量 / 包年包月
export interface PricingPlan {
  id: string;
  modelId: string;
  name: string;
  tier: "toB" | "toC";
  billingMode: BillingMode;
  listPrice: number;
  negotiableRange: [number, number];  // 议价区间
  quotaTokens?: number;
}

// ---------- 客户 / 用量 ----------
export type OpportunityStage = "renew" | "upgrade" | "expand" | "silent" | "newLead";
export interface Customer {
  id: string;
  name: string;           // 脱敏假企业名
  industry: string;
  isNew: boolean;         // 新客无用量数据
  currentModelId?: string;
  currentPlanId?: string;
  balance?: number;
  expireAt?: string;
  stage: OpportunityStage;
  tags: string[];
  ownerManagerId: string;
}
export interface UsageRecord {
  customerId: string;
  series: TimeSeriesPoint[];   // 用量趋势
  rateLimitHits: number;       // 限流次数
  errorCount: number;          // 报错次数
  lastActiveAt: string;
}

// ---------- 推荐 ----------
export type RecommendationType = "renew" | "upgrade" | "expand" | "switch" | "addon";
export interface Recommendation {
  id: string;
  customerId?: string;          // 向导场景可空
  type: RecommendationType;
  targetModelId: string;
  targetPlanId?: string;
  reason: string;               // 更省/更稳/更配场景
  quoteRange: [number, number]; // 报价区间
  evidenceChain: EvidenceChain; // ★ 可核验证据链
}

// ---------- 话术 ----------
export type ScriptScene = "opening" | "sellingPoint" | "objection" | "pricing" | "renewal";
export interface TalkScript {
  id: string;
  customerId?: string;
  scene: ScriptScene;
  title: string;
  content: string;
  objection?: string;           // objection 场景:客户可能的异议
}

// ---------- 通话会话 ----------
export type IntentLevel = "high" | "medium" | "low";
export interface TranscriptLine {
  speaker: "customer" | "manager";
  text: string;
  atSec: number;                // 进入时间(秒),驱动定时器
}
export interface IntentEvent {
  atSec: number;
  level: IntentLevel;
  needType: string;             // 需求类型
  triggersRecommendationId?: string;  // 触发动态弹屏
  triggersScriptId?: string;
}
export interface CallSession {
  id: string;
  customerId: string;
  transcript: TranscriptLine[];
  intentTimeline: IntentEvent[];
  opportunity: { level: IntentLevel; needType: string; stage: OpportunityStage };
  summary?: string;             // 通话结束生成的复盘摘要
}

// ---------- 公告 / 告警 ----------
export type AnnouncementKind = "priceChange" | "incident" | "maintenance" | "shelf";
export interface Announcement {
  id: string;
  kind: AnnouncementKind;
  title: string;
  body: string;
  modelId?: string;
  publishedAt: string;
  resolvedAt?: string;          // 故障处理完成时间
}

// ---------- 指标 ----------
export interface Metric {
  key: string;                  // "managerEfficiency" | "renewRate" | "adoptionRate" | ...
  label: string;
  value: number;
  unit?: string;
  baseline?: number;            // 现状基线(对比用)
  target?: number;              // 目标值
  trend?: Trend;
  series?: TimeSeriesPoint[];
}

// ---------- 四问向导 ----------
export interface WizardQuestion {
  id: string;
  question: string;
  field: "scene" | "scale" | "latency" | "budget";
  options: { label: string; value: string }[];
}
```

---

## 5. 实施优先级(Phase 3 顺序)
1. **P0**:工作台 → 简报 → copilot(打通主演示动线)+ `EvidenceChainCard`、`recommendation/score.ts`。
2. **P1**:横评/比价 → 状态页 → 向导 → 数据大屏。
3. **P2**:落地页 → 多面板 → 控制台 → 答疑 chatbot → 管理侧其余。

每完成一阶段做一次小 commit。
```
