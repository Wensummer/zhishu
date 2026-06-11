/**
 * 演示用系统模型配置数据(临时)。Phase 后期由 lib/api 取/存(后端 GET/PUT)替换。
 * 区别于 lib/demo/models(对外可售的对话模型池):这里是平台自身各能力位的模型编排。
 */
import type {
  AsrModel,
  CapabilitySlotKey,
  SlotKind,
  SystemModelConfig,
} from "@/lib/types";

/** 语音转写(ASR)候选模型(均为国产合规)。 */
export const DEMO_ASR_MODELS: AsrModel[] = [
  { id: "asr-tianyi", name: "天翼云实时语音转写", vendor: "天翼云", filed: true, realtime: true, latencyMs: 320 },
  { id: "asr-xfyun", name: "讯飞实时语音转写", vendor: "科大讯飞", filed: true, realtime: true, latencyMs: 280 },
  { id: "asr-aliyun", name: "阿里云实时语音识别", vendor: "阿里云", filed: true, realtime: true, latencyMs: 300 },
  { id: "asr-tencent", name: "腾讯云实时语音识别", vendor: "腾讯云", filed: true, realtime: true, latencyMs: 310 },
];

/** 能力位定义(UI 配置)。kind 决定候选来自对话模型池还是语音模型。 */
export interface CapabilitySlot {
  key: CapabilitySlotKey;
  label: string;
  desc: string;
  kind: SlotKind;
}

export const CAPABILITY_SLOTS: CapabilitySlot[] = [
  { key: "asr", label: "语音转写(ASR)", desc: "通话 Copilot 实时语音转文字", kind: "asr" },
  { key: "chatbot", label: "配置答疑 Chatbot", desc: "接入/计费/报错问答助手", kind: "chat" },
  { key: "intent", label: "意图识别", desc: "通话快路径意向/需求分类,宜选快而省的模型", kind: "chat" },
  { key: "summary", label: "复盘摘要", desc: "通话结束生成摘要与待办", kind: "chat" },
  { key: "selection", label: "选型 RAG", desc: "推荐引擎生成可核验证据链", kind: "chat" },
];

/** 默认能力位绑定。 */
export const DEFAULT_SYSTEM_CONFIG: SystemModelConfig = {
  bindings: {
    asr: "asr-tianyi",
    chatbot: "qwen-plus",
    intent: "qwen-plus",
    summary: "qwen-max",
    selection: "deepseek-v3",
  },
  updatedAt: "2026-06-10",
};
