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
            气泡越大代表可用率越高;越靠左上角 = 越便宜且能力越强。悬浮查看单点详情。
          </p>
        </CardContent>
      </Card>

      <ModelComparisonTable models={models} />
    </>
  );
}
