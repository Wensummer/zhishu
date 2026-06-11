import type { KnowledgeEvidenceRecord } from "@/lib/dify/types";

export interface ConfidenceBreakdown {
  overall: number;
  label: "高置信" | "中置信" | "需复核";
  metrics: number;
  scene: number;
  knowledge: number;
  riskDetected: boolean;
}

const RISK_PATTERN = /即将.{0,8}(下线|停售|停用)|已.{0,4}(下线|停售|停用)|不再提供|停止服务/;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateConfidence({
  rank,
  adjustedScore,
  nextScore,
  sceneMatched,
  records,
}: {
  rank: number;
  adjustedScore: number;
  nextScore?: number;
  sceneMatched: boolean;
  records: KnowledgeEvidenceRecord[];
}): ConfidenceBreakdown {
  const margin = Math.max(0, adjustedScore - (nextScore ?? adjustedScore));
  const metrics = Math.round(clamp(92 - rank * 7 + margin * 2, 68, 98));
  const scene = sceneMatched ? 94 : 58;
  const relevantRecords = records.slice(0, 2);
  const knowledge = relevantRecords.length
    ? Math.round(
        (relevantRecords.reduce((sum, record) => sum + record.score, 0) /
          relevantRecords.length) *
          100
      )
    : 45;
  const riskDetected = records.some((record) =>
    RISK_PATTERN.test(record.content)
  );
  const penalty = riskDetected ? 18 : 0;
  const overall = Math.round(
    clamp(metrics * 0.35 + scene * 0.3 + knowledge * 0.35 - penalty, 30, 96)
  );

  return {
    overall,
    label:
      riskDetected || overall < 65
        ? "需复核"
        : overall >= 82
          ? "高置信"
          : "中置信",
    metrics,
    scene,
    knowledge,
    riskDetected,
  };
}

export function summarizeTheory(content: string) {
  const normalized = content.replace(/[✅❌🔥⚠️]/g, "");
  const fieldPattern =
    /(能力定位|优势领域|选型建议|上下文长度|适用场景|首.?token延迟|定价区间|价格)[”"]?\s*[:：]\s*[”"]?([^;"\n]{2,120})/g;
  const fields = Array.from(normalized.matchAll(fieldPattern))
    .slice(0, 3)
    .map((match) => `${match[1]}：${match[2].trim()}`);
  const riskLine = normalized
    .split(/\r?\n/)
    .map((line) => line.replace(/[#>*|`]/g, " ").replace(/\s+/g, " ").trim())
    .find((line) => RISK_PATTERN.test(line));
  const summary =
    fields.length > 0
      ? fields.join("；")
      : riskLine
        ? riskLine
        : normalized;
  const cleaned = summary
    .replace(/[#>*|`]/g, " ")
    .replace(/[”"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 150 ? `${cleaned.slice(0, 150)}…` : cleaned;
}
