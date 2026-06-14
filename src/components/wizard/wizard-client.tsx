"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  MessagesSquare,
  Code2,
  Library,
  Brain,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
  Clock,
  Moon,
  PiggyBank,
  Scale,
  Gem,
} from "lucide-react";

import type { Model, Recommendation } from "@/lib/types";
import type { RecommendationKnowledgeBatchResponse } from "@/lib/dify/types";
import { blendedPrice } from "@/lib/demo/models";
import { calculateConfidence } from "@/lib/recommendation/confidence";
import { scoreModel } from "@/lib/recommendation/score";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  QuestionStep,
  type StepQuestion,
} from "@/components/wizard/question-step";
import { RecommendationCard } from "@/components/workbench/recommendation-card";

const QUESTIONS: StepQuestion[] = [
  {
    id: "q1",
    field: "scene",
    question: "1 / 4 · 你的主要使用场景是?",
    options: [
      { label: "通用对话 / 智能客服", value: "general", icon: MessagesSquare, desc: "聊天机器人、客服问答、写文案" },
      { label: "代码 / 研发提效", value: "code", icon: Code2, desc: "写代码、代码补全、技术问答" },
      { label: "长文档 / 知识库 RAG", value: "longdoc", icon: Library, desc: "上传长文档 / 资料库做问答" },
      { label: "复杂推理 / 数据分析", value: "reasoning", icon: Brain, desc: "数学、逻辑推理、数据分析" },
    ],
  },
  {
    id: "q2",
    field: "scale",
    question: "2 / 4 · 预计月调用量级?",
    options: [
      { label: "小(< 100 万 token / 月)", value: "small", icon: BatteryLow, desc: "个人或小项目,偶尔调用" },
      { label: "中(100 万 ~ 1000 万)", value: "medium", icon: BatteryMedium, desc: "团队日常使用" },
      { label: "大(> 1000 万)", value: "large", icon: BatteryFull, desc: "高频、规模化调用" },
    ],
  },
  {
    id: "q3",
    field: "latency",
    question: "3 / 4 · 对响应延迟的敏感度?",
    options: [
      { label: "高(实时交互,越快越好)", value: "high", icon: Zap, desc: "对话要秒回,如在线客服" },
      { label: "一般", value: "mid", icon: Clock, desc: "等一两秒可以接受" },
      { label: "低(离线批处理可接受)", value: "low", icon: Moon, desc: "夜间跑批,不赶时间最省钱" },
    ],
  },
  {
    id: "q4",
    field: "budget",
    question: "4 / 4 · 预算取向?",
    options: [
      { label: "性价比优先", value: "low", icon: PiggyBank, desc: "够用就好,优先省钱" },
      { label: "均衡", value: "mid", icon: Scale, desc: "效果与价格兼顾" },
      { label: "效果优先", value: "high", icon: Gem, desc: "要最好的效果,预算其次" },
    ],
  },
];

const SCENE_KEYWORDS: Record<string, string[]> = {
  general: ["通用对话", "高并发", "工具调用"],
  code: ["代码", "数学"],
  longdoc: ["长文档", "RAG", "超长上下文", "文档分析"],
  reasoning: ["复杂推理", "深度推理", "数学", "Agent"],
};

const QUOTE_BY_SCALE: Record<string, [number, number]> = {
  small: [200, 2000],
  medium: [3000, 20000],
  large: [25000, 120000],
};

/** 按答案微调评分后排序。 */
function rankModels(models: Model[], answers: Record<string, string>) {
  const sceneKw = SCENE_KEYWORDS[answers.scene] ?? [];
  return models
    .map((m) => {
      let s = scoreModel(m).score;
      const sceneMatched = m.useCases.some((u) =>
        sceneKw.some((k) => u.includes(k))
      );
      if (sceneMatched) s += 4;
      if (answers.latency === "high") s -= (m.ttftMs - 400) / 120;
      if (answers.budget === "low") s += (0.06 - blendedPrice(m)) * 30;
      if (answers.budget === "high") s += (m.capabilityScore - 88) * 0.4;
      return {
        model: m,
        adjusted: Math.round(s * 10) / 10,
        sceneMatched,
      };
    })
    .sort((a, b) => b.adjusted - a.adjusted);
}

function buildRecommendation(
  model: Model,
  answers: Record<string, string>
): Recommendation {
  const sceneLabel =
    QUESTIONS[0].options.find((o) => o.value === answers.scene)?.label ?? "你的场景";
  const latencyNote =
    answers.latency === "high"
      ? "低延迟优先,TTFT 表现优"
      : answers.budget === "low"
        ? "性价比突出"
        : "综合能力与稳定性兼顾";
  return {
    id: `wizard-${model.id}`,
    type: "switch",
    title: `推荐「${model.name}」`,
    targetModelId: model.id,
    reason: `匹配${sceneLabel}场景,${latencyNote};在能力、可用率与成本的综合评分中最优。`,
    quoteRange: QUOTE_BY_SCALE[answers.scale] ?? [2000, 20000],
    evidenceChain: scoreModel(model),
  };
}

export function WizardClient({ models }: { models: Model[] }) {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [knowledge, setKnowledge] =
    React.useState<RecommendationKnowledgeBatchResponse | null>(null);
  const [knowledgeLoading, setKnowledgeLoading] = React.useState(false);
  const [knowledgeError, setKnowledgeError] = React.useState<string | null>(
    null
  );

  const done = step >= QUESTIONS.length;
  const current = QUESTIONS[step];
  const canNext = current && answers[current.field];

  function select(value: string) {
    setAnswers((a) => ({ ...a, [current.field]: value }));
  }
  function reset() {
    setStep(0);
    setAnswers({});
    setKnowledge(null);
    setKnowledgeError(null);
  }

  const ranked = done ? rankModels(models, answers) : [];
  const top = ranked[0];
  const alternatives = ranked.slice(1, 3);
  const candidateJson = JSON.stringify(
    ranked.slice(0, 3).map(({ model }) => ({
      modelId: model.id,
      modelName: model.name,
    }))
  );

  React.useEffect(() => {
    if (!done || candidateJson === "[]") return;

    const controller = new AbortController();
    setKnowledge(null);
    setKnowledgeError(null);
    setKnowledgeLoading(true);

    fetch("/api/recommendation-evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidates: JSON.parse(candidateJson) as Array<{
          modelId: string;
          modelName: string;
        }>,
        answers: {
          scene: answers.scene,
          scale: answers.scale,
          latency: answers.latency,
          budget: answers.budget,
        },
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("knowledge_retrieval_failed");
        return response.json() as Promise<RecommendationKnowledgeBatchResponse>;
      })
      .then(setKnowledge)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setKnowledgeError("知识库依据暂时不可用，量化评分结果不受影响。");
      })
      .finally(() => {
        if (!controller.signal.aborted) setKnowledgeLoading(false);
      });

    return () => controller.abort();
  }, [
    done,
    candidateJson,
    answers.scene,
    answers.scale,
    answers.latency,
    answers.budget,
  ]);

  const knowledgeByModel = new Map(
    (knowledge?.results ?? []).map((result) => [result.modelId, result.records])
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      {!done ? (
        <Card>
          <CardContent className="space-y-6 p-6">
            <Progress value={(step / QUESTIONS.length) * 100} />
            <QuestionStep
              question={current}
              value={answers[current.field]}
              onSelect={select}
            />
            <div className="flex justify-between">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
                上一步
              </Button>
              <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                {step === QUESTIONS.length - 1 ? "查看推荐" : "下一步"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              选型完成,为你推荐
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              重新选型
            </Button>
          </div>

          {top && (
            <RecommendationCard
              recommendation={buildRecommendation(top.model, answers)}
              defaultOpenEvidence
              confidence={calculateConfidence({
                rank: 0,
                adjustedScore: top.adjusted,
                nextScore: ranked[1]?.adjusted,
                sceneMatched: top.sceneMatched,
                records: knowledgeByModel.get(top.model.id) ?? [],
              })}
              records={knowledgeByModel.get(top.model.id) ?? []}
              loading={knowledgeLoading}
            />
          )}
          {top && knowledgeError && (
            <p className="text-xs text-muted-foreground">{knowledgeError}</p>
          )}

          {alternatives.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">其他备选</p>
                <p className="text-xs text-muted-foreground">
                  评分相近的候选模型,可对比参考。
                </p>
              </div>
              {alternatives.map(
                ({ model, adjusted, sceneMatched }, alternativeIndex) => {
                  const rank = alternativeIndex + 1;
                  const records = knowledgeByModel.get(model.id) ?? [];
                  const altConfidence = calculateConfidence({
                    rank,
                    adjustedScore: adjusted,
                    nextScore: ranked[rank + 1]?.adjusted,
                    sceneMatched,
                    records,
                  });
                  return (
                    <RecommendationCard
                      key={model.id}
                      recommendation={buildRecommendation(model, answers)}
                      confidence={altConfidence}
                      records={records}
                      loading={knowledgeLoading}
                    />
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
