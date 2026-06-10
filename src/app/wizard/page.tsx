import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P1-4 四问选型向导(toC 自助入口)。 */
export default function WizardPage() {
  return (
    <>
      <PageHeader
        title="四问选型向导"
        description="3~5 个结构化问题(场景 / 量级 / 延迟敏感度 / 预算)→ 推荐 + 证据链,复用同一选型逻辑。"
      />
      <Placeholder
        priority="P1"
        points={[
          "结构化问答步进:场景、量级、延迟敏感度、预算",
          "调用 lib/recommendation/score.ts 统一选型引擎",
          "结果区:推荐型号/套餐 + EvidenceChainCard",
        ]}
      />
    </>
  );
}
