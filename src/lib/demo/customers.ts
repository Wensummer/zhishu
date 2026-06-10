/**
 * 演示用客户与工作台数据(临时)。Phase 后期由 lib/api 从后端取数替换。
 * 客户名、企业名均为脱敏假数据。
 */
import type { Customer } from "@/lib/types";

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: "c-1024",
    name: "云帆智造科技",
    industry: "智能制造",
    isNew: false,
    currentModelId: "通义千问-Max",
    currentPlanId: "包年企业版",
    balance: 38000,
    expireAt: "2026-07-15",
    stage: "renew",
    tags: ["高活跃", "对延迟敏感"],
    ownerManagerId: "m-01",
    contact: "周经理",
    monthlySpend: 24800,
  },
  {
    id: "c-1031",
    name: "锦书文化传媒",
    industry: "内容/营销",
    isNew: false,
    currentModelId: "DeepSeek-V3",
    currentPlanId: "按量标准版",
    balance: 6200,
    expireAt: "2026-06-28",
    stage: "upgrade",
    tags: ["用量上涨", "可加推 Agent"],
    ownerManagerId: "m-01",
    contact: "林总",
    monthlySpend: 15600,
  },
  {
    id: "c-1042",
    name: "恒生金服数科",
    industry: "金融科技",
    isNew: false,
    currentModelId: "文心一言-4.0",
    currentPlanId: "包年企业版",
    balance: 120000,
    expireAt: "2026-09-30",
    stage: "expand",
    tags: ["多部门扩容", "合规要求高"],
    ownerManagerId: "m-01",
    contact: "吴总监",
    monthlySpend: 86000,
  },
  {
    id: "c-1055",
    name: "蓝橙教育",
    industry: "在线教育",
    isNew: false,
    currentModelId: "智谱 GLM-4",
    currentPlanId: "按量标准版",
    balance: 800,
    expireAt: "2026-06-12",
    stage: "silent",
    tags: ["用量下滑", "余额不足"],
    ownerManagerId: "m-01",
    contact: "陈老师",
    monthlySpend: 3200,
  },
  {
    id: "c-2003",
    name: "途新出行",
    industry: "出行/物流",
    isNew: true,
    stage: "newLead",
    tags: ["官网咨询", "待画像"],
    ownerManagerId: "m-01",
    contact: "赵经理",
  },
];

export interface FunnelStage {
  label: string;
  value: number;
}

export const WORKBENCH_FUNNEL: FunnelStage[] = [
  { label: "线索", value: 86 },
  { label: "商机", value: 42 },
  { label: "报价", value: 23 },
  { label: "成交", value: 11 },
];

export interface WorkbenchStat {
  label: string;
  value: string;
  hint: string;
  trend: "up" | "down" | "flat";
  icon: "users" | "target" | "adoption" | "renew";
}

export const WORKBENCH_STATS: WorkbenchStat[] = [
  { label: "本月跟进客户", value: "32", hint: "较上月 +6", trend: "up", icon: "users" },
  { label: "待跟进商机", value: "14", hint: "其中 5 个高意向", trend: "flat", icon: "target" },
  { label: "推荐采纳率", value: "68%", hint: "较上月 +9%", trend: "up", icon: "adoption" },
  { label: "续费率", value: "91%", hint: "较上月 +2%", trend: "up", icon: "renew" },
];
