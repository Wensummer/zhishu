/**
 * 统一选型评分引擎(纯函数)。
 * 简报、四问向导、横评三处共用同一套逻辑,产出可核验证据链。
 * Phase 后期数据来源切到 lib/api,公式与结构保持不变。
 */
import type { EvidenceChain, EvidenceFactor, Model } from "@/lib/types";
import { blendedPrice } from "@/lib/demo/models";

export const SCORE_FORMULA = "综合分 = 能力分 × 可用率 × 成本系数";

/** 成本系数基准混合价(元/千 token):比基准便宜则系数 > 1。 */
const COST_REFERENCE = 0.06;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** 成本系数:越便宜系数越高,限制在 [0.85, 1.15]。 */
export function costFactor(model: Model): number {
  const raw = COST_REFERENCE / blendedPrice(model);
  return Math.round(clamp(raw, 0.85, 1.15) * 100) / 100;
}

const COLLECTED = {
  capability: "2026-05-30",
  availability: "2026-06-08",
  cost: "2026-06-01",
};

/**
 * 根据模型指标计算综合分并返回可核验证据链。
 */
export function scoreModel(model: Model): EvidenceChain {
  const cf = costFactor(model);

  const factors: EvidenceFactor[] = [
    {
      key: "capability",
      label: "能力分",
      value: model.capabilityScore,
      display: String(model.capabilityScore),
      source: {
        label: "天翼云模型评测台 / 2026Q2 基准集",
        collectedAt: COLLECTED.capability,
      },
    },
    {
      key: "availability",
      label: "可用率",
      value: model.availability,
      display: `${(model.availability * 100).toFixed(1)}%`,
      source: { label: "可用性监控 · 30 天滚动", collectedAt: COLLECTED.availability },
    },
    {
      key: "costFactor",
      label: "成本系数",
      value: cf,
      display: `×${cf.toFixed(2)}`,
      source: { label: "定价知识库 · 混合价基准", collectedAt: COLLECTED.cost },
    },
  ];

  const score =
    Math.round(model.capabilityScore * model.availability * cf * 10) / 10;

  return { formula: SCORE_FORMULA, score, factors };
}
