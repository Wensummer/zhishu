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
}

export interface RecommendationKnowledgeBatchResponse {
  results: RecommendationKnowledgeResult[];
}
