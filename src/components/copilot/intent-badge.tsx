import { Badge } from "@/components/ui/badge";
import type { IntentLevel } from "@/lib/types";

const META: Record<
  IntentLevel,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  high: { label: "高意向", variant: "success" },
  medium: { label: "中意向", variant: "warning" },
  low: { label: "低意向", variant: "secondary" },
};

/** 意图/商机意向标签。 */
export function IntentBadge({ level }: { level: IntentLevel }) {
  const m = META[level];
  return (
    <Badge variant={m.variant} className="shrink-0 whitespace-nowrap">
      {m.label}
    </Badge>
  );
}
