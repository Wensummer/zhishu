import { getCopilotSession, getBriefing, getEnterpriseInfo } from "@/lib/api";
import { CopilotClient } from "@/components/copilot/copilot-client";

/** P0-3 通话中实时 copilot(服务端取数 → 客户端交互)。 */
export default async function CopilotPage({
  params,
}: {
  params: { customerId: string };
}) {
  // 同时取通话剧本 + 通话前简报(客户背景面板用) + 企业画像
  const [session, briefing, enterpriseInfo] = await Promise.all([
    getCopilotSession(params.customerId),
    getBriefing(params.customerId),
    getEnterpriseInfo(params.customerId),
  ]);
  return (
    <CopilotClient
      session={session}
      briefing={briefing}
      enterpriseInfo={enterpriseInfo}
      customerId={params.customerId}
    />
  );
}
