"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** 带图标与通俗说明的向导选项(辅助小白理解)。 */
export interface StepOption {
  label: string;
  value: string;
  icon: LucideIcon;
  desc: string;
}

export interface StepQuestion {
  id: string;
  field: string;
  question: string;
  options: StepOption[];
}

interface QuestionStepProps {
  question: StepQuestion;
  value?: string;
  onSelect: (value: string) => void;
}

/** 四问向导单步:一个问题 + 选项卡片(图标 + 名称 + 一句话说明)。 */
export function QuestionStep({ question, value, onSelect }: QuestionStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{question.question}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((opt) => {
          const active = value === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:border-primary/50 hover:bg-accent"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-tight">
                  {opt.label}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {opt.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
