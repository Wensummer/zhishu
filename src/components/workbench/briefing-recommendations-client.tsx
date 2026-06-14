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
  customerId: string;
}

export function BriefingRecommendationsClient({
  recommendations,
  customerName,
  industry,
  customerId,
}: BriefingRecommendationsClientProps) {
  const [knowledgeData, setKnowledgeData] =
    React.useState<RecommendationKnowledgeBatchResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!recommendations.length) return;
    fetchEvidence(false);
  }, [recommendations]);

  const fetchEvidence = React.useCallback(
    (force: boolean) => {
      const controller = new AbortController();
      setError(null);
      setLoading(true);

      fetch("/api/recommendation-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: recommendations.slice(0, 3).map((r) => ({
            modelId: r.targetModelId,
            modelName: r.title,
            query: `${r.targetModelId} ${r.reason}`,
            customerId,
          })),
          forceRefresh: force,
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
    },
    [recommendations]
  );

  const knowledgeByModel = React.useMemo(
    () =>
      new Map(
        (knowledgeData?.results ?? []).map((r) => [r.modelId, r])
      ),
    [knowledgeData]
  );

  return (
    <>
      {recommendations.map((r, index) => {
        const result = knowledgeByModel.get(r.targetModelId);
        const records = result?.records ?? [];
        const theory = result?.theory;
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
              theory={theory}
              records={records}
              loading={loading}
              onRefresh={() => fetchEvidence(true)}
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
