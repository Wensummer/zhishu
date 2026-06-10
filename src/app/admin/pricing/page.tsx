import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-12 价格与优惠配置(含调价公示)。 */
export default function AdminPricingPage() {
  return (
    <>
      <PageHeader
        title="价格与优惠配置"
        description="各模型/套餐的定价、折扣、促销活动、议价区间配置,调价提前公示。"
      />
      <Placeholder
        priority="P2"
        points={["定价与折扣配置", "议价区间", "调价公示制度(提前公告、留痕)"]}
      />
    </>
  );
}
