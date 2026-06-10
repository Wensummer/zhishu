import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P1-5 模型横评 / 比价。 */
export default function ModelsPage() {
  return (
    <>
      <PageHeader
        title="模型横评 / 比价"
        description="一张表看全模型池:价格、可用率、TTFT、TPOT、缓存折扣、渠道纯度、适配场景。"
      />
      <Placeholder
        priority="P1"
        points={[
          "ModelComparisonTable:排序 / 筛选 / 行内展开证据链",
          "PriceCompareChart:比价图表,悬浮看单点详情",
          "复用为客户经理随身比价工具",
        ]}
      />
    </>
  );
}
