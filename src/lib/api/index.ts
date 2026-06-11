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
import type { Customer, TimeSeriesPoint } from "@/lib/types";

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
