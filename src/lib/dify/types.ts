export interface KnowledgeEvidenceRecord {
  segmentId: string;
  documentId: string;
  documentName: string;
  content: string;
  score: number;
  collectedAt?: string;
  metadata?: Record<string, unknown> | null;
}

export interface KnowledgeEvidenceResponse {
  query: string;
  records: KnowledgeEvidenceRecord[];
}

export interface RecommendationKnowledgeResult
  extends KnowledgeEvidenceResponse {
  modelId: string;
  modelName: string;
  theory: string;
}

export interface RecommendationKnowledgeBatchResponse {
  results: RecommendationKnowledgeResult[];
}

export interface RecommendationKnowledgeRequest {
  candidates: Array<{ modelId: string; modelName: string; query: string }>;
  forceRefresh?: boolean;
}
