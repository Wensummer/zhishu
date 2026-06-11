import { getModels, getSystemModels } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { SystemModelsClient } from "@/components/admin/system-models-client";

/** P2 · 系统模型配置:平台自身各能力位绑定的模型(对内编排)。 */
export default async function SystemModelsPage() {
  const [{ config, asrModels }, chatModels] = await Promise.all([
    getSystemModels(),
    getModels(),
  ]);

  return (
    <>
      <PageHeader
        title="系统模型配置"
        description="配置平台各能力位使用的模型(语音转写 / 答疑 / 意图 / 摘要 / 选型)。区别于对外可售的模型池。"
        actions={<Badge variant="outline">最近更新 {config.updatedAt ?? "—"}</Badge>}
      />
      <SystemModelsClient
        config={config}
        chatModels={chatModels}
        asrModels={asrModels}
      />
    </>
  );
}
