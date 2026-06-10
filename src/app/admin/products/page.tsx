import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-12 产品配置(模型/套餐上下架与分层)。 */
export default function AdminProductsPage() {
  return (
    <>
      <PageHeader
        title="产品配置"
        description="模型 / 套餐的上下架管理,控制对外可售与面向的客户分层。"
      />
      <Placeholder
        priority="P2"
        points={["模型/套餐上下架", "面向客户分层配置", "与定价知识库联动"]}
      />
    </>
  );
}
