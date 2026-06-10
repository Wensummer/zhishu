/**
 * 演示用管理侧大屏数据(临时)。Phase 后期由 lib/api 取数替换。
 */
import type { Metric, TimeSeriesPoint } from "@/lib/types";
import type { FunnelStage } from "@/lib/demo/customers";

export const EFFICIENCY_TREND: TimeSeriesPoint[] = [
  { date: "1月", value: 18 },
  { date: "2月", value: 19 },
  { date: "3月", value: 21 },
  { date: "4月", value: 24 },
  { date: "5月", value: 27 },
  { date: "6月", value: 31 },
];

export const ADMIN_FUNNEL: FunnelStage[] = [
  { label: "线索", value: 320 },
  { label: "商机", value: 168 },
  { label: "报价", value: 92 },
  { label: "成交", value: 47 },
];

/** 信任工程相关指标:现状 vs 目标。 */
export const TRUST_METRICS: Metric[] = [
  { key: "renewRate", label: "续费率", value: 0.91, baseline: 0.82, target: 0.93, unit: "%" },
  { key: "expandRate", label: "扩容率", value: 0.34, baseline: 0.21, target: 0.4, unit: "%" },
  { key: "adoptionRate", label: "推荐采纳率", value: 0.68, baseline: 0.45, target: 0.75, unit: "%" },
  { key: "complaintRate", label: "选型相关客诉率", value: 0.03, baseline: 0.08, target: 0.02, unit: "%" },
];

export interface DashboardStat {
  label: string;
  value: string;
  hint: string;
  trend: "up" | "down" | "flat";
  icon: "efficiency" | "renew" | "adoption" | "complaint";
  series: number[];
}

export const DASHBOARD_STATS: DashboardStat[] = [
  { label: "客户经理人效(单人月签约)", value: "31", hint: "较基线 +13", trend: "up", icon: "efficiency", series: [18, 19, 21, 24, 27, 31] },
  { label: "续费率", value: "91%", hint: "目标 93%", trend: "up", icon: "renew", series: [82, 85, 86, 88, 90, 91] },
  { label: "推荐采纳率", value: "68%", hint: "较基线 +23%", trend: "up", icon: "adoption", series: [45, 50, 55, 60, 64, 68] },
  { label: "选型相关客诉率", value: "3%", hint: "较基线 -5%(越低越好)", trend: "down", icon: "complaint", series: [8, 7, 6, 5, 4, 3] },
];
