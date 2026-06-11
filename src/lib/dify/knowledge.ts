import "server-only";

import type {
  KnowledgeEvidenceRecord,
  KnowledgeEvidenceResponse,
} from "@/lib/dify/types";

interface DifyRetrieveResponse {
  query?: { content?: string };
  records?: Array<{
    score?: number;
    summary?: string | null;
    segment?: {
      id?: string;
      document_id?: string;
      content?: string;
      created_at?: number;
      completed_at?: number | null;
      document?: {
        id?: string;
        name?: string;
        doc_metadata?: Record<string, unknown> | null;
      };
    };
  }>;
}

function getConfig() {
  const apiBaseUrl = process.env.DIFY_API_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.DIFY_DATASET_API_KEY;
  const datasetId = process.env.DIFY_DATASET_ID;

  if (!apiBaseUrl || !apiKey || !datasetId) {
    throw new Error("Dify knowledge base is not configured");
  }

  return { apiBaseUrl, apiKey, datasetId };
}

function toIsoDate(timestamp?: number | null) {
  if (!timestamp) return undefined;
  return new Date(timestamp * 1000).toISOString();
}

function normalizeRecord(
  record: NonNullable<DifyRetrieveResponse["records"]>[number]
): KnowledgeEvidenceRecord | null {
  const segment = record.segment;
  if (!segment?.id || !segment.content) return null;
  const sourceContent = record.summary?.trim() || segment.content.trim();
  const content =
    sourceContent.length > 700
      ? `${sourceContent.slice(0, 700)}…`
      : sourceContent;

  return {
    segmentId: segment.id,
    documentId: segment.document?.id ?? segment.document_id ?? "",
    documentName: segment.document?.name ?? "未命名知识文档",
    content,
    score: typeof record.score === "number" ? record.score : 0,
    collectedAt: toIsoDate(segment.completed_at ?? segment.created_at),
    metadata: segment.document?.doc_metadata,
  };
}

/** 从 Dify 知识库检索选型理论依据，仅允许在服务端调用。 */
export async function retrieveKnowledge(
  query: string
): Promise<KnowledgeEvidenceResponse> {
  const { apiBaseUrl, apiKey, datasetId } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(
      `${apiBaseUrl}/datasets/${encodeURIComponent(datasetId)}/retrieve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.slice(0, 250),
          retrieval_model: {
            search_method: "semantic_search",
            reranking_enable: false,
            top_k: 4,
            score_threshold_enabled: true,
            score_threshold: 0.3,
          },
        }),
        cache: "no-store",
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      let code = "unknown_error";
      try {
        const body = (await response.json()) as { code?: string };
        code = body.code ?? code;
      } catch {
        // Keep the public error free of upstream response details.
      }
      throw new Error(`Dify retrieval failed (${response.status}, ${code})`);
    }

    const body = (await response.json()) as DifyRetrieveResponse;
    const records = (body.records ?? [])
      .map(normalizeRecord)
      .filter((record): record is KnowledgeEvidenceRecord => record !== null);

    return {
      query: body.query?.content ?? query,
      records,
    };
  } finally {
    clearTimeout(timeout);
  }
}
