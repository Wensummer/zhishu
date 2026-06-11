import { PageHeader } from "@/components/layout/page-header";
import { getModels } from "@/lib/api";
import { ProductsClient } from "@/components/admin/products-client";

/** P2-12 产品配置(模型/套餐上下架与分层)。 */
export default async function AdminProductsPage() {
  const models = await getModels();
  return (
    <>
      <PageHeader
        title="产品配置"
        description="模型 / 套餐的上下架管理,控制对外可售与面向的客户分层。"
      />
      <ProductsClient models={models} />
    </>
  );
}
