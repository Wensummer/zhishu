/**
 * 数据访问层(接缝)。
 *
 * 全站组件只从这里取数,不直接读 lib/demo。
 * 现在:返回 lib/demo 的演示数据。
 * 接后端:把 NEXT_PUBLIC_USE_MOCK 设为 "false" 并实现下方 fetch 分支即可,
 *         页面与组件一行都不用改(lib/types 即前后端共享契约)。
 */
import type {
  Announcement,
  AsrModel,
  Metric,
  Model,
  SystemModelConfig,
} from "@/lib/types";
import { DEMO_MODELS } from "@/lib/demo/models";
import {
  DEMO_ASR_MODELS,
  DEFAULT_SYSTEM_CONFIG,
} from "@/lib/demo/system-models";
import {
  DEMO_CUSTOMERS,
  WORKBENCH_FUNNEL,
  WORKBENCH_STATS,
  type FunnelStage,
  type WorkbenchStat,
} from "@/lib/demo/customers";
import { getBriefingData, type Briefing } from "@/lib/demo/briefings";
import { getCopilotScript, type CopilotScript } from "@/lib/demo/sessions";
import { DEMO_ANNOUNCEMENTS } from "@/lib/demo/announcements";
import {
  ADMIN_FUNNEL,
  DASHBOARD_STATS,
  EFFICIENCY_TREND,
  TRUST_METRICS,
  type DashboardStat,
} from "@/lib/demo/metrics";
import type {
  BillingRecord,
  Customer,
  IntentEvent,
  Recommendation,
  TalkScript,
  TimeSeriesPoint,
} from "@/lib/types";
import { getCEndBillingRecords, getCustomerBillingRecords } from "@/lib/demo/billing";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/** 真实后端取数(接后端时启用)。 */
async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} 失败:${res.status}`);
  return res.json() as Promise<T>;
}

/** 真实后端写入(接后端时启用)。 */
async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} 失败:${res.status}`);
  return res.json() as Promise<T>;
}

// ============ 模型池 ============
export async function getModels(): Promise<Model[]> {
  if (!USE_MOCK) return fetchJson<Model[]>("/models");
  return DEMO_MODELS;
}

// ============ 工作台 ============
export interface WorkbenchData {
  customers: Customer[];
  funnel: FunnelStage[];
  stats: WorkbenchStat[];
}
export async function getWorkbench(): Promise<WorkbenchData> {
  if (!USE_MOCK) return fetchJson<WorkbenchData>("/workbench");
  return {
    customers: DEMO_CUSTOMERS,
    funnel: WORKBENCH_FUNNEL,
    stats: WORKBENCH_STATS,
  };
}

// ============ 通话前简报 ============
export async function getBriefing(customerId: string): Promise<Briefing> {
  if (!USE_MOCK) return fetchJson<Briefing>(`/briefing/${customerId}`);
  return getBriefingData(customerId);
}

// ============ 通话 copilot 剧本 ============
export async function getCopilotSession(
  customerId: string
): Promise<CopilotScript> {
  if (!USE_MOCK) return fetchJson<CopilotScript>(`/copilot/${customerId}`);
  return getCopilotScript(customerId);
}

// ============ 实时通话:意图分析(浏览器转写后,文本送后端) ============
export interface NeedProfile {
  task?: string;
  scale?: string;
  priceSensitive?: boolean;
}

export interface AnalyzeResult {
  intent: IntentEvent;
  recommendation?: Recommendation;
  script?: TalkScript;
  need?: NeedProfile; // 抽出的结构化需求,用于查 Dify 推荐场景
}

/** 把客户一句话(已由浏览器 Web Speech 转写)送后端,换回意图 + 触发的推荐/话术。 */
export async function analyzeUtterance(
  text: string,
  context?: string
): Promise<AnalyzeResult> {
  // 走同源转发路由(见 app/api/copilot/analyze/route.ts),避免跨端口/跨域
  const res = await fetch(`/api/copilot/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, context }),
  });
  if (!res.ok) throw new Error(`analyze 失败:${res.status}`);
  return res.json() as Promise<AnalyzeResult>;
}

/** 每轮客户发言后,异步生成"给销售的话术"(后端检索话术库 + LLM)。模型字段可空(纯异议应对)。 */
export async function generateScript(params: {
  text: string;
  context?: string;
  needType?: string;
  note?: string;
  targetModelId?: string;
  reason?: string;
  score?: number;
}): Promise<TalkScript> {
  const res = await fetch(`/api/copilot/script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`script 失败:${res.status}`);
  return res.json() as Promise<TalkScript>;
}

// ============ 可用性公告 ============
export async function getAnnouncements(): Promise<Announcement[]> {
  if (!USE_MOCK) return fetchJson<Announcement[]>("/announcements");
  return DEMO_ANNOUNCEMENTS;
}

// ============ 管理侧大屏 ============
export interface DashboardData {
  stats: DashboardStat[];
  efficiencyTrend: TimeSeriesPoint[];
  funnel: FunnelStage[];
  trustMetrics: Metric[];
}
export async function getDashboard(): Promise<DashboardData> {
  if (!USE_MOCK) return fetchJson<DashboardData>("/admin/dashboard");
  return {
    stats: DASHBOARD_STATS,
    efficiencyTrend: EFFICIENCY_TREND,
    funnel: ADMIN_FUNNEL,
    trustMetrics: TRUST_METRICS,
  };
}

// ============ 系统模型配置 ============
export interface SystemModelsData {
  config: SystemModelConfig;
  asrModels: AsrModel[];
}
export async function getSystemModels(): Promise<SystemModelsData> {
  if (!USE_MOCK) {
    const [config, asrModels] = await Promise.all([
      fetchJson<SystemModelConfig>("/admin/system-models"),
      fetchJson<AsrModel[]>("/admin/asr-models"),
    ]);
    return { config, asrModels };
  }
  return { config: DEFAULT_SYSTEM_CONFIG, asrModels: DEMO_ASR_MODELS };
}

/** 保存系统模型配置。mock 下为空操作(仅前端状态);接后端时 PUT 落库。 */
export async function saveSystemModels(
  config: SystemModelConfig
): Promise<SystemModelConfig> {
  if (!USE_MOCK) return putJson<SystemModelConfig>("/admin/system-models", config);
  return config;
}

// ============ 计费明细 ============
export interface BillingQuery {
  startDate?: string;
  endDate?: string;
  model?: string;
  apiKeyName?: string;
  customerId?: string; // 为空表示 C 端用户
}

export async function getBillingRecords(
  query: BillingQuery = {}
): Promise<BillingRecord[]> {
  const { customerId, model, apiKeyName } = query;

  if (!USE_MOCK) {
    const params = new URLSearchParams();
    if (customerId) params.set("customer_id", customerId);
    if (model) params.set("model", model);
    if (apiKeyName) params.set("api_key_name", apiKeyName);
    const qs = params.toString();
    return fetchJson<BillingRecord[]>(`/billing${qs ? `?${qs}` : ""}`);
  }

  let records: BillingRecord[];
  if (customerId) {
    records = getCustomerBillingRecords(customerId);
  } else {
    records = getCEndBillingRecords();
  }

  // 前端过滤
  if (model) {
    records = records.filter((r) => r.model === model);
  }
  if (apiKeyName) {
    records = records.filter((r) => r.apiKeyName === apiKeyName);
  }

  return records;
}
