import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getModels } from "@/lib/api";
import { ModelComparisonTable } from "@/components/models/model-comparison-table";
import { PriceCompareChart } from "@/components/models/price-compare-chart";

/** P1-5 模型横评 / 比价。 */
export default async function ModelsPage() {
  const models = await getModels();
  return (
    <>
      <PageHeader
        title="模型横评 / 比价"
        description="一张表看全模型池:价格、可用率、TTFT、TPOT、缓存折扣、适配场景。点击任意行展开可核验证据链。"
        actions={
          <Badge variant="outline" className="gap-1">
            渠道纯度 100% · 全部已备案
          </Badge>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">价格 × 能力 比价图</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceCompareChart models={models} />
          <p className="mt-2 text-xs text-muted-foreground">
            每个气泡是一个模型(大小 = 可用率,颜色 = 厂商)。越靠
            <span className="font-medium text-emerald-600">左上「甜点区」</span>
            = 越便宜且能力越强;<span className="font-medium text-amber-500">★ 脉冲点</span>
            为综合分最优;绿色虚线是「帕累托最优前沿」(再往左上已没有更划算的)。悬浮查看单点详情。
          </p>
        </CardContent>
      </Card>

      <ModelComparisonTable models={models} />
    </>
  );
}
