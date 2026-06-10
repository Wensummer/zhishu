"use client";

import * as React from "react";
import { Bot, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * P2-11 配置答疑 chatbot —— 全局浮窗壳。
 * Phase 2 仅搭壳(可开合 + 占位提示),mock 技术 RAG 问答留待 P2 实现。
 */
export function SupportChatbot() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* 浮窗面板 */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] origin-bottom-right transition-all md:right-6",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <div className="flex h-[26rem] flex-col overflow-hidden rounded-lg border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 font-medium">
              <Bot className="h-4 w-4 text-primary" />
              配置答疑助手
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
            接入、配置、计费、报错问答(mock 技术 RAG)将在 P2 阶段实现。
          </div>
          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            一个 Key 调用模型池全部模型 · OpenAI 兼容
          </div>
        </div>
      </div>

      {/* 触发按钮 */}
      <Button
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:right-6"
        onClick={() => setOpen((v) => !v)}
        aria-label="配置答疑助手"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Button>
    </>
  );
}
