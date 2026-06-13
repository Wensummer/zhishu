"use client";

import * as React from "react";
import { Bot, X, Send, User, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Msg {
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = ["如何接入?", "怎么计费?", "报错 429 怎么办?", "帮我选型"];

// 后端连不上时的诚实提示(不再用关键词硬编码瞎答,避免答非所问)。
const OFFLINE_MSG =
  "抱歉,答疑助手暂时连不上,请稍后再试,或前往对应功能页查看(模型横评 / 四问选型 / 状态监控 / API 控制台)。";

const GREETING =
  "你好,我是智枢答疑助手。平台使用、API 接入、计费、报错、选型、合规,问我都可以。";

/** P2-11 配置答疑 chatbot —— 全局浮窗,接 LLM(DeepSeek)流式问答;后端连不上才提示离线。 */
export function SupportChatbot() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "bot", text: GREETING },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);

    // 先落用户消息,再占一个空 bot 气泡用于流式填充
    const history = [...messages, { role: "user" as const, text: q }];
    setMessages([...history, { role: "bot", text: "" }]);

    // 本地会话映射成后端要的 role(bot → assistant),并去掉开头的问候语
    const payload = history
      .filter((m, i) => !(i === 0 && m.role === "bot"))
      .map((m) => ({
        role: m.role === "bot" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "bot", text: acc };
          return next;
        });
      }
      if (!acc.trim()) throw new Error("空回复");
    } catch {
      // 后端连不上 → 诚实提示,不瞎答
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: "bot", text: OFFLINE_MSG };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 w-[min(23rem,calc(100vw-2rem))] origin-bottom-right transition-all md:right-6",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <div className="flex h-[28rem] flex-col overflow-hidden rounded-lg border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 font-medium">
              <Bot className="h-4 w-4 text-primary" />
              智枢答疑助手
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

          {/* 消息区 */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => {
              const streaming =
                busy && m.role === "bot" && i === messages.length - 1 && !m.text;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2 text-sm",
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      m.role === "user"
                        ? "bg-secondary"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {m.role === "user" ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div
                    className={cn(
                      "max-w-[78%] whitespace-pre-wrap rounded-lg px-3 py-2 leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {streaming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 快捷问题 */}
          <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* 输入 */}
          <form
            className="flex items-center gap-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={busy ? "回复中…" : "输入问题…"}
              disabled={busy}
              className="h-9"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* 触发按钮 */}
      <Button
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:right-6"
        onClick={() => setOpen((v) => !v)}
        aria-label="智枢答疑助手"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Button>
    </>
  );
}
