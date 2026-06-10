import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  value: number;
}

/** 商机漏斗概览:线索 → 商机 → 报价 → 成交。 */
export function FunnelOverview({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">商机漏斗概览</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {stages.map((stage, i) => {
            const prev = i > 0 ? stages[i - 1].value : stage.value;
            const rate = prev > 0 ? Math.round((stage.value / prev) * 100) : 100;
            return (
              <div key={stage.label} className="flex flex-1 items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      {stage.label}
                    </span>
                    <span className="text-lg font-semibold">{stage.value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full rounded-full bg-primary")}
                      style={{ width: `${(stage.value / max) * 100}%` }}
                    />
                  </div>
                  {i > 0 && (
                    <span className="text-xs text-muted-foreground">
                      转化率 {rate}%
                    </span>
                  )}
                </div>
                {i < stages.length - 1 && (
                  <ChevronRight className="mb-6 hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
