import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P0-1 客户经理工作台首页(根路由)。 */
export default function WorkbenchPage() {
  return (
    <>
      <PageHeader
        title="客户经理工作台"
        description="存量 + 新客客户/商机列表、商机判断、漏斗概览与人效。点击客户进入通话前简报。"
      />
      <Placeholder
        priority="P0"
        points={[
          "客户/商机列表(存量 + 新客),可搜索/筛选",
          "每行商机判断标签:该续费 / 可升级 / 可加推 / 沉默预警",
          "漏斗概览:线索 → 商机 → 报价 → 成交",
          "人效卡片:本月跟进数、推荐采纳率",
          "点击客户行 → 通话前智能简报页",
        ]}
      />
    </>
  );
}
