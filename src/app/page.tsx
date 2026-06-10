import { Users, Target, RefreshCw, CheckCircle2 } from "lucide-react";

import { getWorkbench } from "@/lib/api";
import type { WorkbenchStat } from "@/lib/demo/customers";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FunnelOverview } from "@/components/workbench/funnel-overview";
import { CustomerTable } from "@/components/workbench/customer-table";

const STAT_ICONS: Record<WorkbenchStat["icon"], React.ReactNode> = {
  users: <Users className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  adoption: <CheckCircle2 className="h-5 w-5" />,
  renew: <RefreshCw className="h-5 w-5" />,
};

/** P0-1 客户经理工作台首页(根路由)。 */
export default async function WorkbenchPage() {
  const { customers, funnel, stats } = await getWorkbench();

  return (
    <>
      <PageHeader
        title="客户经理工作台"
        description="存量 + 新客客户/商机一览,商机判断、漏斗概览与人效。点击客户进入通话前简报。"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              hint={s.hint}
              trend={s.trend}
              icon={STAT_ICONS[s.icon]}
            />
          ))}
        </div>

        <FunnelOverview stages={funnel} />
      </div>

      <CustomerTable customers={customers} />
    </>
  );
}
