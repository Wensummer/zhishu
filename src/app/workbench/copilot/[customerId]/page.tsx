import { getCopilotSession } from "@/lib/api";
import { CopilotClient } from "@/components/copilot/copilot-client";

/** P0-3 通话中实时 copilot(服务端取数 → 客户端交互)。 */
export default async function CopilotPage({
  params,
}: {
  params: { customerId: string };
}) {
  const session = await getCopilotSession(params.customerId);
  return <CopilotClient session={session} customerId={params.customerId} />;
}
