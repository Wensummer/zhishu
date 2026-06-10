import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P0-3 通话中实时 copilot。 */
export default function CopilotPage({
  params,
}: {
  params: { customerId: string };
}) {
  return (
    <>
      <PageHeader
        title="通话中实时 Copilot"
        description={`客户 ${params.customerId} · 模拟实时 ASR + 意图识别 + 动态弹屏推荐与话术`}
      />
      <Placeholder
        priority="P0"
        points={[
          "模拟实时 ASR 转写:定时器逐句喂入 mock 对话(可暂停/重播)",
          "意图识别 + 商机分类:高/中/低意向、需求类型",
          "动态弹屏:客户抛新需求/异议时更新推荐与话术(复用 EvidenceChainCard)",
          "通话结束:生成复盘摘要,标注回流话术库/商机库",
        ]}
      />
    </>
  );
}
