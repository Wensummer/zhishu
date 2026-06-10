/**
 * 统一选型评分引擎(纯函数)。
 * 简报、四问向导、横评三处共用同一套逻辑,产出可核验证据链。
 *
 * Phase 2:仅定义函数签名与公式骨架(口子)。
 * Phase 3:接入 mock 数据,产出真实的 EvidenceChain。
 */
import type { EvidenceChain, EvidenceFactor, Model } from "@/lib/types";

export const SCORE_FORMULA = "综合分 = 能力分 × 可用率 × 成本系数";

/**
 * 根据模型指标计算综合分并返回证据链。
 * @param model 候选模型
 * @returns 含公式分解、各分项数值与来源的证据链
 */
export function scoreModel(model: Model): EvidenceChain {
  const capability: EvidenceFactor = {
    key: "capability",
    label: "能力分",
    value: model.capabilityScore,
    source: { label: "天翼云模型评测台", collectedAt: model.filed ? "" : "" },
  };
  const availability: EvidenceFactor = {
    key: "availability",
    label: "可用率",
    value: model.availability,
    source: { label: "可用性监控(滚动统计)", collectedAt: "" },
  };
  // 成本系数:价格越低系数越高(占位实现,Phase 3 细化)。
  const costFactor: EvidenceFactor = {
    key: "costFactor",
    label: "成本系数",
    value: 1,
    source: { label: "定价知识库", collectedAt: "" },
  };

  const factors = [capability, availability, costFactor];
  const score = capability.value * availability.value * costFactor.value;

  return { formula: SCORE_FORMULA, score, factors };
}
