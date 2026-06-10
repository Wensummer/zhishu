import * as React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Trend } from "@/lib/types";

interface StatCardProps {
  label: string;
  value: string;
  /** 同比/环比说明,如 "较上月 +12%" */
  hint?: string;
  trend?: Trend;
  icon?: React.ReactNode;
}

const trendMeta: Record<Trend, { icon: React.ReactNode; className: string }> = {
  up: { icon: <ArrowUp className="h-3.5 w-3.5" />, className: "text-success" },
  down: {
    icon: <ArrowDown className="h-3.5 w-3.5" />,
    className: "text-destructive",
  },
  flat: { icon: <Minus className="h-3.5 w-3.5" />, className: "text-muted-foreground" },
};

/** 通用指标卡。 */
export function StatCard({ label, value, hint, trend, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs",
                trend ? trendMeta[trend].className : "text-muted-foreground"
              )}
            >
              {trend && trendMeta[trend].icon}
              {hint}
            </p>
          )}
        </div>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
