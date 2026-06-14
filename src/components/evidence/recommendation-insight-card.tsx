"use client";

import * as React from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  ChevronDown,
  FileText,
  Gauge,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { KnowledgeEvidenceRecord } from "@/lib/dify/types";
import {
  type ConfidenceBreakdown,
  summarizeTheory,
} from "@/lib/recommendation/confidence";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CONFIDENCE_STYLE = {
  高置信: {
    badge: "success" as const,
    bar: "bg-success",
    ring: "border-success/30 bg-success/5",
  },
  中置信: {
    badge: "warning" as const,
    bar: "bg-warning",
    ring: "border-warning/30 bg-warning/5",
  },
  需复核: {
    badge: "destructive" as const,
    bar: "bg-destructive",
    ring: "border-destructive/30 bg-destructive/5",
  },
};

export function RecommendationInsightCard({
  modelName,
  confidence,
  theory,
  records,
  loading,
  compact = false,
  embedded = false,
  onRefresh,
}: {
  modelName: string;
  confidence: ConfidenceBreakdown;
  theory?: string;
  records: KnowledgeEvidenceRecord[];
  loading?: boolean;
  compact?: boolean;
  embedded?: boolean;
  onRefresh?: () => void;
}) {
  const style = CONFIDENCE_STYLE[confidence.label];
  const [showRecords, setShowRecords] = React.useState(false);
  const hasRecords = records.length > 0;
  const hasContent = !!(theory || hasRecords);

  // 首次加载(无旧内容)时整张卡片显示骨架,避免空白状态闪烁
  if (loading && !hasContent) {
    return (
      <div className={cn(embedded ? "pt-2" : "rounded-lg border", "border-muted/40")}>
        <div className="grid gap-4 p-4 sm:grid-cols-[9rem_1fr]">
          <div className="space-y-3">
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            <div className="h-1.5 w-full animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-3 gap-1 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-16 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(embedded ? "pt-2" : "rounded-lg border", style.ring)}>
      <div className="grid gap-4 p-4 sm:grid-cols-[9rem_1fr]">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 sm:block">
            <div className="text-xs font-medium text-muted-foreground">
              推荐置信度
            </div>
            <Badge variant={style.badge} className="sm:mt-1">
              {confidence.label}
            </Badge>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {confidence.overall}
            </span>
            <span className="pb-1 text-sm text-muted-foreground">%</span>
          </div>
          <Progress
            value={confidence.overall}
            className="h-1.5 bg-background/80"
            indicatorClassName={style.bar}
          />
          <div className="grid grid-cols-3 gap-1 pt-1 text-center">
            <Metric label="量化" value={confidence.metrics} icon={<Gauge />} />
            <Metric label="场景" value={confidence.scene} icon={<Target />} />
            <Metric
              label="知识"
              value={confidence.knowledge}
              icon={<BookOpenCheck />}
            />
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium">支撑依据</div>
              <div className="text-xs text-muted-foreground">
                基于知识库的选型理论分析
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-40"
                >
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", loading && "animate-spin")}
                  />
                </button>
              )}
              {confidence.riskDetected && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  状态风险
                </Badge>
              )}
            </div>
          </div>

          {loading && !hasContent ? (
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          ) : theory || hasRecords ? (
            <>
              {/* LLM 生成的理论依据 */}
              {theory && (
                <div className="flex items-start gap-2 rounded-md border bg-background/50 px-3 py-2.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-foreground/85">
                    {theory}
                  </p>
                </div>
              )}

              {/* 折叠的知识库检索结果 — 参考随身话术卡片样式 */}
              {hasRecords && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRecords((v) => !v)}
                    className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/50"
                  >
                    <FileText className="h-3 w-3" />
                    <span>知识库检索记录 ({records.length})</span>
                    <ChevronDown
                      className={cn(
                        "ml-auto h-3 w-3 text-muted-foreground transition-transform",
                        showRecords && "rotate-180"
                      )}
                    />
                  </button>

                  {showRecords && (
                    <div className="animate-fade-in space-y-2">
                      {records.map((record) => (
                        <div
                          key={record.segmentId}
                          className="rounded-md border bg-background/50 px-2.5 py-2"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span className="font-medium">
                              {record.documentName}
                            </span>
                            <span className="ml-auto">
                              相关度 {Math.round(record.score * 100)}%
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs leading-5 text-foreground/80">
                            {summarizeTheory(record.content)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="rounded-md border border-dashed bg-background/50 p-3 text-sm text-muted-foreground">
              暂无达到阈值的知识依据，当前置信度主要来自量化指标与场景匹配。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactElement;
}) {
  return (
    <div className="rounded-md bg-background/70 px-1 py-1.5">
      <div className="mx-auto mb-0.5 flex h-3.5 w-3.5 items-center justify-center text-muted-foreground [&_svg]:h-3 [&_svg]:w-3">
        {icon}
      </div>
      <div className="text-xs font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
