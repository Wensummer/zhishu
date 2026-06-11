import {
  AlertTriangle,
  BookOpenCheck,
  ChevronDown,
  Gauge,
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
  records,
  loading,
  compact = false,
  embedded = false,
}: {
  modelName: string;
  confidence: ConfidenceBreakdown;
  records: KnowledgeEvidenceRecord[];
  loading?: boolean;
  compact?: boolean;
  embedded?: boolean;
}) {
  const style = CONFIDENCE_STYLE[confidence.label];
  const basis = records.slice(0, compact ? 1 : 2);

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
                支撑 {modelName} 的知识库命中内容
              </div>
            </div>
            {confidence.riskDetected && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                状态风险
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          ) : basis.length ? (
            <div className="space-y-2">
              {basis.map((record) => (
                <div
                  key={record.segmentId}
                  className="rounded-md border bg-background/80 px-3 py-2"
                >
                  <p className="text-sm leading-5 text-foreground/90">
                    {summarizeTheory(record.content)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{record.documentName}</span>
                    <span>相关度 {Math.round(record.score * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed bg-background/50 p-3 text-sm text-muted-foreground">
              暂无达到阈值的知识依据，当前置信度主要来自量化指标与场景匹配。
            </p>
          )}

          {compact && records.length > 1 && (
            <details className="group text-xs text-muted-foreground">
              <summary className="flex cursor-pointer list-none items-center gap-1 font-medium text-primary">
                查看其余 {records.length - 1} 条依据
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 space-y-2">
                {records.slice(1, 3).map((record) => (
                  <p
                    key={record.segmentId}
                    className="rounded-md border bg-background/70 p-2 leading-5"
                  >
                    {summarizeTheory(record.content)}
                  </p>
                ))}
              </div>
            </details>
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
