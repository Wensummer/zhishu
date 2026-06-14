"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

import type { EnterpriseRiskItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

/**
 * 风险级别指示器 — 用于客户列表快速呈现企业风险状况。
 */
export function EnterpriseRiskBadge({
  risks,
}: {
  risks: EnterpriseRiskItem[];
}) {
  if (risks.length === 0) {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-[10px] text-emerald-600"
      >
        <ShieldCheck className="h-2.5 w-2.5" />
        无风险
      </Badge>
    );
  }

  const hasHighRisk = risks.some(
    (r) =>
      r.type === "失信被执行" ||
      r.type === "限制高消费" ||
      r.type === "行政处罚"
  );

  return (
    <Badge
      variant="outline"
      className={`gap-1 text-[10px] ${
        hasHighRisk
          ? "border-red-300 text-red-600"
          : "border-amber-300 text-amber-600"
      }`}
    >
      <AlertTriangle className="h-2.5 w-2.5" />
      {risks.length} 项风险
    </Badge>
  );
}
