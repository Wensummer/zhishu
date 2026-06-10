import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-8 平台落地页。 */
export default function LandingPage() {
  return (
    <>
      <PageHeader
        title="智枢 · 合规大模型选型与营销赋能平台"
        description="依托天翼云已备案的国产大模型能力池,把合规模型 API 卖出去、用起来、续下去。"
      />
      <Placeholder
        priority="P2"
        points={[
          "定位与价值主张",
          "灰中转痛点对照表:跑路 / 倍率跳变 / 财税缺口 / 渠道掺假 / 服务上限 / 隐私",
          "合规差异化论证(央企背书、渠道纯度、合同锁价)",
          "CTA:进入四问选型 / 客户经理工作台",
        ]}
      />
    </>
  );
}
