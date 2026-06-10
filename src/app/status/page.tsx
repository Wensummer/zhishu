import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P1-6 可用性监控状态页。 */
export default function StatusPage() {
  return (
    <>
      <PageHeader
        title="可用性监控状态页"
        description="模型晴雨表(整体健康度)+ 分模型实时指标与 7/30 天趋势 + 调价/故障公告。"
      />
      <Placeholder
        priority="P1"
        points={[
          "HealthBarometer:模型池整体健康度一眼可见",
          "分模型可用率 / 缓存率 / TTFT / TPOT 实时值 + 7/30 天趋势",
          "价格与套餐变更公告制度(提前公示、全程留痕)",
          "故障公告与处理时间线",
        ]}
      />
    </>
  );
}
