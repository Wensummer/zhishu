"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import type { Model, Recommendation, WizardQuestion } from "@/lib/types";
import { blendedPrice } from "@/lib/demo/models";
import { scoreModel } from "@/lib/recommendation/score";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuestionStep } from "@/components/wizard/question-step";
import { RecommendationCard } from "@/components/workbench/recommendation-card";

const QUESTIONS: WizardQuestion[] = [
  {
    id: "q1",
    field: "scene",
    question: "1 / 4 · 你的主要使用场景是?",
    options: [
      { label: "通用对话 / 智能客服", value: "general" },
      { label: "代码 / 研发提效", value: "code" },
      { label: "长文档 / 知识库 RAG", value: "longdoc" },
      { label: "复杂推理 / 数据分析", value: "reasoning" },
    ],
  },
  {
    id: "q2",
    field: "scale",
    question: "2 / 4 · 预计月调用量级?",
    options: [
      { label: "小(< 100 万 token / 月)", value: "small" },
      { label: "中(100 万 ~ 1000 万)", value: "medium" },
      { label: "大(> 1000 万)", value: "large" },
    ],
  },
  {
    id: "q3",
    field: "latency",
    question: "3 / 4 · 对响应延迟的敏感度?",
    options: [
      { label: "高(实时交互,越快越好)", value: "high" },
      { label: "一般", value: "mid" },
      { label: "低(离线批处理可接受)", value: "low" },
    ],
  },
  {
    id: "q4",
    field: "budget",
    question: "4 / 4 · 预算取向?",
    options: [
      { label: "性价比优先", value: "low" },
      { label: "均衡", value: "mid" },
      { label: "效果优先", value: "high" },
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
      if (m.useCases.some((u) => sceneKw.some((k) => u.includes(k)))) s += 4;
      if (answers.latency === "high") s -= (m.ttftMs - 400) / 120;
      if (answers.budget === "low") s += (0.06 - blendedPrice(m)) * 30;
      if (answers.budget === "high") s += (m.capabilityScore - 88) * 0.4;
      return { model: m, adjusted: Math.round(s * 10) / 10 };
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

  const done = step >= QUESTIONS.length;
  const current = QUESTIONS[step];
  const canNext = current && answers[current.field];

  function select(value: string) {
    setAnswers((a) => ({ ...a, [current.field]: value }));
  }
  function reset() {
    setStep(0);
    setAnswers({});
  }

  const ranked = done ? rankModels(models, answers) : [];
  const top = ranked[0];
  const alternatives = ranked.slice(1, 3);

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
            />
          )}

          {alternatives.length > 0 && (
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-sm font-medium">备选(综合分接近)</p>
                {alternatives.map(({ model, adjusted }) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {model.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {model.vendor}
                      </span>
                    </span>
                    <Badge variant="outline" className="tabular-nums">
                      {adjusted.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
