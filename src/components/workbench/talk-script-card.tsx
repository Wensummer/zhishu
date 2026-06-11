"use client";

import * as React from "react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  BadgeDollarSign,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import type { ScriptScene, TalkScript } from "@/lib/types";
import type { KnowledgeEvidenceRecord } from "@/lib/dify/types";
import { summarizeTheory } from "@/lib/recommendation/confidence";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SCENE_META: Record<
  ScriptScene,
  { label: string; icon: React.ReactNode }
> = {
  opening: { label: "开场", icon: <MessageSquare className="h-4 w-4" /> },
  sellingPoint: { label: "卖点", icon: <Sparkles className="h-4 w-4" /> },
  objection: { label: "异议应对", icon: <ShieldAlert className="h-4 w-4" /> },
  pricing: { label: "议价", icon: <BadgeDollarSign className="h-4 w-4" /> },
  renewal: { label: "续费", icon: <RefreshCw className="h-4 w-4" /> },
};

function scoreMeta(
  score: number
): { label: string; badge: "success" | "warning" | "destructive" } {
  if (score >= 0.7) return { label: "高置信", badge: "success" };
  if (score >= 0.4) return { label: "中置信", badge: "warning" };
  return { label: "低置信", badge: "destructive" };
}

/** 随身话术卡 —— 含参考信息。 */
export function TalkScriptCard({
  script,
  evidence,
  loading,
}: {
  script: TalkScript;
  evidence?: KnowledgeEvidenceRecord[];
  loading?: boolean;
}) {
  const meta = SCENE_META[script.scene];
  const [showEvidence, setShowEvidence] = React.useState(false);
  const hasEvidence = evidence && evidence.length > 0;
  const topScore =
    hasEvidence
      ? Math.max(...evidence!.map((r) => r.score))
      : 0;
  const confidence = hasEvidence ? scoreMeta(topScore) : undefined;

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        {/* 标题区 */}
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          {meta.icon}
          {meta.label}
          <span className="text-foreground">· {script.title}</span>
        </div>

        {/* 异议提示 */}
        {script.objection && (
          <p className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
            客户可能异议：{script.objection}
          </p>
        )}

        {/* 话术内容 */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {script.content}
        </p>

        {/* ─── 参考信息区 ─── */}
        <div className="pt-1">
          {loading ? (
            <div className="space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : hasEvidence ? (
            <>
              <button
                type="button"
                onClick={() => setShowEvidence((v) => !v)}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-muted/50"
              >
                <BookOpen className="h-3 w-3" />
                <span>参考信息 ({evidence!.length})</span>
                {confidence && (
                  <Badge
                    variant={confidence.badge}
                    className="ml-auto text-[10px] leading-none"
                  >
                    {confidence.label}
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-muted-foreground transition-transform",
                    showEvidence && "rotate-180"
                  )}
                />
              </button>

              {showEvidence && (
                <div className="animate-fade-in space-y-2 pt-1">
                  {evidence!.slice(0, 2).map((record) => (
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
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground/90">
                        {summarizeTheory(record.content)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="px-2 text-[11px] text-muted-foreground/60">
              暂无知识依据
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
