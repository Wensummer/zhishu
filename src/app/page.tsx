import { Users, Target, RefreshCw, CheckCircle2 } from "lucide-react";

import type { Customer } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FunnelOverview } from "@/components/workbench/funnel-overview";
import { CustomerTable } from "@/components/workbench/customer-table";

/**
 * P0-1 客户经理工作台首页(根路由)。
 * 注:以下为临时演示内容,用于定下页面长相;Phase 后期改为经 lib/api 取数。
 */
const DEMO_CUSTOMERS: Customer[] = [
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

const FUNNEL = [
  { label: "线索", value: 86 },
  { label: "商机", value: 42 },
  { label: "报价", value: 23 },
  { label: "成交", value: 11 },
];

export default function WorkbenchPage() {
  return (
    <>
      <PageHeader
        title="客户经理工作台"
        description="存量 + 新客客户/商机一览,商机判断、漏斗概览与人效。点击客户进入通话前简报。"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="本月跟进客户"
          value="32"
          hint="较上月 +6"
          trend="up"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="待跟进商机"
          value="14"
          hint="其中 5 个高意向"
          trend="flat"
          icon={<Target className="h-5 w-5" />}
        />
        <StatCard
          label="推荐采纳率"
          value="68%"
          hint="较上月 +9%"
          trend="up"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          label="续费率"
          value="91%"
          hint="较上月 +2%"
          trend="up"
          icon={<RefreshCw className="h-5 w-5" />}
        />
      </div>

      <FunnelOverview stages={FUNNEL} />

      <CustomerTable customers={DEMO_CUSTOMERS} />
    </>
  );
}
