"use client";

import * as React from "react";

import type { Recommendation } from "@/lib/types";
import type { RecommendationKnowledgeBatchResponse } from "@/lib/dify/types";
import { calculateConfidence } from "@/lib/recommendation/confidence";
import { RecommendationCard } from "@/components/workbench/recommendation-card";
import { RecommendationInsightCard } from "@/components/evidence/recommendation-insight-card";

interface BriefingRecommendationsClientProps {
  recommendations: Recommendation[];
  customerName: string;
  industry: string;
}

export function BriefingRecommendationsClient({
  recommendations,
  customerName,
  industry,
}: BriefingRecommendationsClientProps) {
  const [knowledgeData, setKnowledgeData] =
    React.useState<RecommendationKnowledgeBatchResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const candidatesJson = React.useMemo(
    () =>
      JSON.stringify(
        recommendations.slice(0, 3).map((r) => ({
          modelId: r.targetModelId,
          title: r.title,
          type: r.type,
        }))
      ),
    [recommendations]
  );

  React.useEffect(() => {
    if (!recommendations.length) return;

    const controller = new AbortController();
    setKnowledgeData(null);
    setError(null);
    setLoading(true);

    fetch("/api/recommendation-evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidates: recommendations.slice(0, 3).map((r) => ({
          modelId: r.targetModelId,
          modelName: r.title,
        })),
        answers: {
          scene: "general",
          scale: "medium",
          latency: "mid",
          budget: "mid",
        },
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("knowledge_retrieval_failed");
        return res.json() as Promise<RecommendationKnowledgeBatchResponse>;
      })
      .then(setKnowledgeData)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("知识库依据暂时不可用，量化评分结果不受影响。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [candidatesJson, recommendations.length]);

  const knowledgeByModel = React.useMemo(
    () =>
      new Map(
        (knowledgeData?.results ?? []).map((r) => [r.modelId, r.records])
      ),
    [knowledgeData]
  );

  return (
    <>
      {recommendations.map((r, index) => {
        const records = knowledgeByModel.get(r.targetModelId) ?? [];
        const confidence = calculateConfidence({
          rank: index,
          adjustedScore: r.evidenceChain.score,
          nextScore: recommendations[index + 1]?.evidenceChain.score,
          sceneMatched: true,
          records,
        });
        return (
          <div key={r.id} className="space-y-3">
            <RecommendationCard
              recommendation={r}
              defaultOpenEvidence={index === 0}
              confidence={confidence}
              records={records}
              loading={loading}
            />
            {error && index === 0 && (
              <p className="text-xs text-muted-foreground">{error}</p>
            )}
          </div>
        );
      })}
    </>
  );
}
