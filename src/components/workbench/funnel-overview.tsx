import { ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface FunnelStage {
  label: string;
  value: number;
}

/** 商机漏斗概览:线索 → 商机 → 报价 → 成交(纵向,自上而下逐级收窄)。 */
export function FunnelOverview({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">商机漏斗概览</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-1">
        {stages.map((stage, i) => {
          const prev = i > 0 ? stages[i - 1].value : stage.value;
          const rate = prev > 0 ? Math.round((stage.value / prev) * 100) : 100;
          return (
            <div key={stage.label}>
              {/* 阶段间转化率 */}
              {i > 0 && (
                <div className="flex items-center gap-1 py-0.5 pl-1 text-xs text-muted-foreground">
                  <ChevronDown className="h-3.5 w-3.5" />
                  转化率 {rate}%
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    {stage.label}
                  </span>
                  <span className="text-xl font-semibold tabular-nums">
                    {stage.value}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(stage.value / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
