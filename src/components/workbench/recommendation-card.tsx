import { ArrowUpCircle, RefreshCw, PlusCircle, Repeat, Boxes } from "lucide-react";

import { formatRange } from "@/lib/utils";
import type { Recommendation, RecommendationType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceChainCard } from "@/components/evidence/evidence-chain-card";

const TYPE_META: Record<
  RecommendationType,
  { label: string; icon: React.ReactNode }
> = {
  renew: { label: "续费", icon: <RefreshCw className="h-4 w-4" /> },
  upgrade: { label: "升级", icon: <ArrowUpCircle className="h-4 w-4" /> },
  expand: { label: "扩容", icon: <Boxes className="h-4 w-4" /> },
  switch: { label: "换型", icon: <Repeat className="h-4 w-4" /> },
  addon: { label: "加推", icon: <PlusCircle className="h-4 w-4" /> },
};

/** 推荐项卡:主张 + 理由 + 报价区间 + 内嵌证据链。 */
export function RecommendationCard({
  recommendation: r,
  defaultOpenEvidence,
}: {
  recommendation: Recommendation;
  defaultOpenEvidence?: boolean;
}) {
  const meta = TYPE_META[r.type];
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {meta.icon}
                {meta.label}
              </Badge>
              <span className="font-semibold">{r.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">{r.reason}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-muted-foreground">报价区间</div>
            <div className="font-semibold tabular-nums">
              {formatRange(r.quoteRange)}
            </div>
          </div>
        </div>
        <EvidenceChainCard chain={r.evidenceChain} defaultOpen={defaultOpenEvidence} />
      </CardContent>
    </Card>
  );
}
