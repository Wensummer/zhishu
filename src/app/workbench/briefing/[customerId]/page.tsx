import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P0-2 通话前智能简报(单客户详情)。 */
export default function BriefingPage({
  params,
}: {
  params: { customerId: string };
}) {
  return (
    <>
      <PageHeader
        title="通话前智能简报"
        description={`客户 ${params.customerId} · 进门前的静态底稿:使用情况 / 推荐选型 / 随身话术 / 商机判断`}
      />
      <Placeholder
        priority="P0"
        points={[
          "使用情况:在用模型/套餐、用量趋势、余额与到期、限流/报错记录",
          "推荐选型:主推型号/套餐 + 理由 + 续费/升级/扩容建议 + 报价区间",
          "每条推荐附 EvidenceChainCard(综合分 = 能力分 × 可用率 × 成本系数 + 来源/采集时间)",
          "随身话术:开场 / 卖点 / 异议应对",
          "商机判断:当前阶段 + 下一步动作 +「进入通话」按钮 → copilot",
        ]}
      />
    </>
  );
}
