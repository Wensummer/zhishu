import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P1-7 管理侧数据大屏。 */
export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title="管理侧数据大屏"
        description="客户经理人效、商机漏斗与转化归因、续费/扩容率、推荐采纳率、选型相关客诉率。"
      />
      <Placeholder
        priority="P1"
        points={[
          "客户经理人效(现状基线 vs 目标)",
          "商机漏斗与转化归因",
          "续费率 / 扩容率",
          "推荐采纳率 · 选型相关客诉率",
        ]}
      />
    </>
  );
}
