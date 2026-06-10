import { Badge } from "@/components/ui/badge";
import type { OpportunityStage } from "@/lib/types";

type Variant = React.ComponentProps<typeof Badge>["variant"];

export const STAGE_META: Record<
  OpportunityStage,
  { label: string; variant: Variant }
> = {
  renew: { label: "该续费", variant: "default" },
  upgrade: { label: "可升级", variant: "success" },
  expand: { label: "可扩容", variant: "secondary" },
  silent: { label: "沉默预警", variant: "destructive" },
  newLead: { label: "新客线索", variant: "warning" },
};

/** 商机判断标签。 */
export function OpportunityTag({ stage }: { stage: OpportunityStage }) {
  const meta = STAGE_META[stage];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
