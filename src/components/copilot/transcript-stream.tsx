import { cn } from "@/lib/utils";
import type { TranscriptLine } from "@/lib/types";

interface TranscriptStreamProps {
  lines: TranscriptLine[];
  /** 是否还有未播完的句子(显示"正在转写") */
  pending?: boolean;
}

/** 模拟实时 ASR 转写流(展示态,可见行由父组件按时钟计算)。 */
export function TranscriptStream({ lines, pending }: TranscriptStreamProps) {
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const isCustomer = line.speaker === "customer";
        return (
          <div
            key={i}
            className={cn(
              "flex animate-fade-in",
              isCustomer ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                isCustomer
                  ? "rounded-tl-sm bg-muted text-foreground"
                  : "rounded-tr-sm bg-primary text-primary-foreground"
              )}
            >
              <div
                className={cn(
                  "mb-0.5 text-xs",
                  isCustomer
                    ? "text-muted-foreground"
                    : "text-primary-foreground/70"
                )}
              >
                {isCustomer ? "客户" : "客户经理"}
              </div>
              {line.text}
            </div>
          </div>
        );
      })}
      {pending && (
        <div className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </span>
          正在转写…
        </div>
      )}
      {lines.length === 0 && !pending && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          点击「开始通话」播放模拟对话
        </p>
      )}
    </div>
  );
}
