import { PageHeader } from "@/components/layout/page-header";
import { PricingClient } from "@/components/admin/pricing-client";

/** P2-12 价格与优惠配置(含调价公示)。 */
export default function AdminPricingPage() {
  return (
    <>
      <PageHeader
        title="价格与优惠配置"
        description="各模型/套餐的定价、折扣、议价区间;任何调价提前公示、全程留痕。"
      />
      <PricingClient />
    </>
  );
}
