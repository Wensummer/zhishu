import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

/** P2-12 合规管理(脱敏/权限/审计/留痕)。 */
export default function AdminCompliancePage() {
  return (
    <>
      <PageHeader
        title="合规管理"
        description="数据脱敏、权限控制、日志审计、合规留痕 —— 作为护城河而非免责声明。"
      />
      <Placeholder
        priority="P2"
        points={["数据脱敏策略", "权限控制(等保级)", "日志审计与合规留痕"]}
      />
    </>
  );
}
