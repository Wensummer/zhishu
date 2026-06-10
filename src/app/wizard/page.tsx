import { getModels } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { WizardClient } from "@/components/wizard/wizard-client";

/** P1-4 四问选型向导(toC 自助入口)。 */
export default async function WizardPage() {
  const models = await getModels();
  return (
    <>
      <PageHeader
        title="四问选型向导"
        description="回答 4 个问题,基于同一套选型引擎给出推荐 + 可核验证据链。"
      />
      <WizardClient models={models} />
    </>
  );
}
