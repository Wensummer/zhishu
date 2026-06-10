"use client";

import * as React from "react";
import { ChevronDown, Clock, FileSearch, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EvidenceChain, EvidenceFactor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface EvidenceChainCardProps {
  chain: EvidenceChain;
  /** 默认是否展开依据明细 */
  defaultOpen?: boolean;
  className?: string;
}

function factorText(f: EvidenceFactor) {
  return f.display ?? String(f.value);
}

/**
 * ★ 招牌组件:可核验证据链卡。
 * 展示评分公式分解 + 各分项数值 + 每项数据来源与采集时间。
 * 在简报、四问选型、横评表等多处复用 —— 产品差异化主线。
 */
export function EvidenceChainCard({
  chain,
  defaultOpen = false,
  className,
}: EvidenceChainCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/30",
        className
      )}
    >
      {/* 顶部:公式 + 综合分 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">可核验证据链</span>
            <Badge variant="outline" className="font-normal">
              综合分 {chain.score.toFixed(1)}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {chain.formula}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* 展开:公式可视化 + 分项来源 */}
      {open && (
        <div className="animate-fade-in space-y-3 border-t px-4 py-3">
          {/* 公式按分项数值拼出 */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {chain.factors.map((f, i) => (
              <React.Fragment key={f.key}>
                {i > 0 && <span className="text-muted-foreground">×</span>}
                <span className="rounded bg-background px-2 py-0.5">
                  <span className="text-muted-foreground">{f.label} </span>
                  <span className="font-medium tabular-nums">
                    {factorText(f)}
                  </span>
                </span>
              </React.Fragment>
            ))}
            <span className="text-muted-foreground">=</span>
            <span className="font-semibold tabular-nums text-primary">
              {chain.score.toFixed(1)}
            </span>
          </div>

          {/* 分项明细 + 来源/采集时间 */}
          <div className="divide-y rounded-md border bg-background">
            {chain.factors.map((f) => (
              <div
                key={f.key}
                className="flex items-start justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{f.label}</span>
                    {typeof f.weight === "number" && (
                      <Badge variant="secondary" className="font-normal">
                        权重 {f.weight}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <FileSearch className="h-3 w-3" />
                      {f.source.label}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      采集 {f.source.collectedAt}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {factorText(f)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
