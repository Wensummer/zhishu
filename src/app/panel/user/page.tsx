import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-9 C 端用户面板。 */
export default function UserPanelPage() {
  return (
    <>
      <PageHeader
        title="我的用量(C 端用户)"
        description="用量、计费、余额。"
      />
      <Placeholder priority="P2" points={["用量趋势", "计费明细", "余额与充值"]} />
    </>
  );
}
