import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-9 甲方个人面板。 */
export default function MemberPanelPage() {
  return (
    <>
      <PageHeader title="个人面板(甲方成员)" description="个人用量与额度。" />
      <Placeholder priority="P2" points={["个人用量", "额度与限额"]} />
    </>
  );
}
