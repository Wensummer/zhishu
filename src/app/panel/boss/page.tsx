import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-9 甲方老板面板。 */
export default function BossPanelPage() {
  return (
    <>
      <PageHeader
        title="经营总览(甲方老板)"
        description="总量消耗、成本、宏观趋势、各部门用量。"
      />
      <Placeholder
        priority="P2"
        points={["总量与成本", "宏观趋势", "各部门用量分布"]}
      />
    </>
  );
}
