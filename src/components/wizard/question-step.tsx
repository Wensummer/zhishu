"use client";

import { cn } from "@/lib/utils";
import type { WizardQuestion } from "@/lib/types";

interface QuestionStepProps {
  question: WizardQuestion;
  value?: string;
  onSelect: (value: string) => void;
}

/** 四问向导单步:一个问题 + 选项卡片。 */
export function QuestionStep({ question, value, onSelect }: QuestionStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{question.question}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                "rounded-lg border p-4 text-left text-sm transition-colors",
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "hover:border-primary/50 hover:bg-accent"
              )}
            >
              <span className="font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
