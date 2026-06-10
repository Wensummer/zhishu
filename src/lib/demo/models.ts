/**
 * 演示用模型池数据(临时,定前端长相用)。
 * 横评页、四问向导、状态页共用同一份,保证指标一致。
 * Phase 后期由 lib/api 从后端取数替换。
 * 注:模型名为公开产品名;客户/企业名才需脱敏。
 */
import type { Model } from "@/lib/types";

export const DEMO_MODELS: Model[] = [
  {
    id: "qwen-max",
    name: "通义千问-Max",
    vendor: "阿里云百炼",
    capabilityTier: "S",
    capabilityScore: 94,
    priceInputPer1k: 0.04,
    priceOutputPer1k: 0.12,
    cacheDiscount: 0.4,
    ttftMs: 420,
    tpotMs: 28,
    availability: 0.998,
    channelPurity: 1,
    useCases: ["复杂推理", "长文档", "Agent"],
    filed: true,
  },
  {
    id: "qwen-plus",
    name: "通义千问-Plus",
    vendor: "阿里云百炼",
    capabilityTier: "A",
    capabilityScore: 88,
    priceInputPer1k: 0.008,
    priceOutputPer1k: 0.02,
    cacheDiscount: 0.4,
    ttftMs: 360,
    tpotMs: 22,
    availability: 0.997,
    channelPurity: 1,
    useCases: ["通用对话", "高并发", "性价比"],
    filed: true,
  },
  {
    id: "ernie-4",
    name: "文心一言-4.0",
    vendor: "百度智能云",
    capabilityTier: "S",
    capabilityScore: 92,
    priceInputPer1k: 0.03,
    priceOutputPer1k: 0.09,
    cacheDiscount: 0.3,
    ttftMs: 480,
    tpotMs: 30,
    availability: 0.995,
    channelPurity: 1,
    useCases: ["知识问答", "金融合规", "长文档"],
    filed: true,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek-V3",
    vendor: "深度求索",
    capabilityTier: "A",
    capabilityScore: 90,
    priceInputPer1k: 0.002,
    priceOutputPer1k: 0.008,
    cacheDiscount: 0.5,
    ttftMs: 520,
    tpotMs: 26,
    availability: 0.992,
    channelPurity: 1,
    useCases: ["代码", "性价比", "通用对话"],
    filed: true,
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    vendor: "深度求索",
    capabilityTier: "S",
    capabilityScore: 93,
    priceInputPer1k: 0.004,
    priceOutputPer1k: 0.016,
    cacheDiscount: 0.5,
    ttftMs: 900,
    tpotMs: 34,
    availability: 0.99,
    channelPurity: 1,
    useCases: ["深度推理", "数学", "代码"],
    filed: true,
  },
  {
    id: "glm-4",
    name: "智谱 GLM-4",
    vendor: "智谱 AI",
    capabilityTier: "A",
    capabilityScore: 87,
    priceInputPer1k: 0.05,
    priceOutputPer1k: 0.05,
    cacheDiscount: 0.3,
    ttftMs: 400,
    tpotMs: 24,
    availability: 0.996,
    channelPurity: 1,
    useCases: ["通用对话", "工具调用", "多模态"],
    filed: true,
  },
  {
    id: "moonshot-128k",
    name: "Kimi-128K",
    vendor: "月之暗面",
    capabilityTier: "A",
    capabilityScore: 86,
    priceInputPer1k: 0.06,
    priceOutputPer1k: 0.06,
    cacheDiscount: 0.2,
    ttftMs: 560,
    tpotMs: 27,
    availability: 0.994,
    channelPurity: 1,
    useCases: ["超长上下文", "文档分析", "RAG"],
    filed: true,
  },
  {
    id: "baichuan-4",
    name: "百川-4",
    vendor: "百川智能",
    capabilityTier: "B",
    capabilityScore: 82,
    priceInputPer1k: 0.01,
    priceOutputPer1k: 0.03,
    cacheDiscount: 0.25,
    ttftMs: 440,
    tpotMs: 25,
    availability: 0.991,
    channelPurity: 1,
    useCases: ["通用对话", "性价比"],
    filed: true,
  },
];

export function getModelById(id: string): Model | undefined {
  return DEMO_MODELS.find((m) => m.id === id);
}

/** 模型加权混合价(元/千 token):输入 0.3 + 输出 0.7。 */
export function blendedPrice(m: Model): number {
  return m.priceInputPer1k * 0.3 + m.priceOutputPer1k * 0.7;
}

/** 单模型健康档位:正常 / 波动 / 异常。 */
export function modelHealth(m: Model): "ok" | "warn" | "down" {
  if (m.availability >= 0.995) return "ok";
  if (m.availability >= 0.99) return "warn";
  return "down";
}
