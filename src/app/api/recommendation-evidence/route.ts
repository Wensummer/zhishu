import { NextResponse } from "next/server";

import { retrieveKnowledge } from "@/lib/dify/knowledge";

const OPTIONS = {
  scene: ["general", "code", "longdoc", "reasoning"],
  scale: ["small", "medium", "large"],
  latency: ["high", "mid", "low"],
  budget: ["low", "mid", "high"],
} as const;

const LABELS = {
  scene: {
    general: "通用对话与智能客服",
    code: "代码与研发提效",
    longdoc: "长文档与知识库 RAG",
    reasoning: "复杂推理与数据分析",
  },
  scale: {
    small: "月调用量小于 100 万 token",
    medium: "月调用量 100 万至 1000 万 token",
    large: "月调用量超过 1000 万 token",
  },
  latency: {
    high: "实时交互且高度延迟敏感",
    mid: "一般延迟敏感",
    low: "可接受离线批处理",
  },
  budget: {
    low: "性价比优先",
    mid: "效果与成本均衡",
    high: "模型效果优先",
  },
} as const;

type AnswerKey = keyof typeof OPTIONS;
type Answers = Record<AnswerKey, string>;

function validAnswer<K extends AnswerKey>(
  key: K,
  value: string
): value is (typeof OPTIONS)[K][number] {
  return (OPTIONS[key] as readonly string[]).includes(value);
}

function buildQuery(modelName: string, answers: Answers) {
  const scene = validAnswer("scene", answers.scene)
    ? LABELS.scene[answers.scene]
    : "";
  const scale = validAnswer("scale", answers.scale)
    ? LABELS.scale[answers.scale]
    : "";
  const latency = validAnswer("latency", answers.latency)
    ? LABELS.latency[answers.latency]
    : "";
  const budget = validAnswer("budget", answers.budget)
    ? LABELS.budget[answers.budget]
    : "";

  return [
    `大模型选型：${scene}场景，${scale}，${latency}，${budget}。`,
    `评估推荐${modelName}的理论依据、适用条件、关键指标、成本性能权衡和潜在风险。`,
  ].join("");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      candidates?: Array<{ modelId?: string; modelName?: string }>;
      answers?: Partial<Answers>;
    };
    const candidates = body.candidates
      ?.slice(0, 3)
      .map((candidate) => ({
        modelId: candidate.modelId?.trim() ?? "",
        modelName: candidate.modelName?.trim() ?? "",
      }));
    const answers = body.answers;

    if (
      !candidates?.length ||
      candidates.some(
        ({ modelId, modelName }) =>
          !modelId ||
          !modelName ||
          modelId.length > 80 ||
          modelName.length > 80
      ) ||
      !answers ||
      !Object.keys(OPTIONS).every((key) => {
        const answerKey = key as AnswerKey;
        const value = answers[answerKey];
        return typeof value === "string" && validAnswer(answerKey, value);
      })
    ) {
      return NextResponse.json(
        { message: "选型参数不完整或无效" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      candidates.map(async ({ modelId, modelName }) => ({
        modelId,
        modelName,
        ...(await retrieveKnowledge(
          buildQuery(modelName, answers as Answers)
        )),
      }))
    );
    return NextResponse.json({ results });
  } catch (error) {
    console.error(
      "Recommendation evidence retrieval failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { message: "知识库检索暂时不可用" },
      { status: 502 }
    );
  }
}
