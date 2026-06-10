"use client";

import * as React from "react";
import { Bot, X, Send, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Msg {
  role: "user" | "bot";
  text: string;
}

// mock 技术 RAG 知识库:命中关键词即返回对应答案。
const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["接入", "base", "url", "sdk", "对接", "怎么用"],
    answer:
      "用 OpenAI 兼容方式接入:base_url 填 https://api.zhishu.example/v1,api_key 用你的 One Key,model 改成模型池里的型号(如 qwen-max)。详见「API 控制台」的接入示例。",
  },
  {
    keywords: ["key", "密钥", "鉴权", "认证"],
    answer:
      "一个 One Key 即可调用模型池全部模型。密钥在服务端签发,前端只脱敏展示;支持随时轮换。切勿把 Key 写进前端代码。",
  },
  {
    keywords: ["计费", "价格", "多少钱", "费用", "缓存", "折扣"],
    answer:
      "按输入/输出 token 分别计价,命中缓存可享缓存折扣。ToB 支持按量或包年(可合同锁价),调价会提前公示。具体单价见「模型横评」页。",
  },
  {
    keywords: ["报错", "错误", "限流", "429", "失败", "超时"],
    answer:
      "429 多为触发限流,建议指数退避重试或申请提额;超时可缩短 max_tokens 或换用 TTFT 更低的型号。模型实时可用率见「状态监控」页。",
  },
  {
    keywords: ["选型", "推荐", "哪个模型", "选哪个"],
    answer:
      "可用「四问选型」按场景/量级/延迟/预算自助选型,会给出推荐 + 可核验证据链;也可在「模型横评」对比综合分。",
  },
  {
    keywords: ["合规", "备案", "数据", "隐私", "发票"],
    answer:
      "仅接已备案国产模型,数据不出境、全程脱敏与审计留痕;对公结算、开正规增值税发票。渠道纯度可出具证明。",
  },
];

const SUGGESTIONS = ["如何接入?", "怎么计费?", "报错 429 怎么办?", "帮我选型"];

function answerFor(q: string): string {
  const hit = FAQ.find((f) => f.keywords.some((k) => q.toLowerCase().includes(k)));
  return (
    hit?.answer ??
    "我可以解答接入、密钥、计费、报错、选型与合规等问题。也可以点下方快捷问题试试,或前往对应功能页查看详情。"
  );
}

/** P2-11 配置答疑 chatbot —— 全局浮窗(mock 技术 RAG)。 */
export function SupportChatbot() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "bot", text: "你好,我是智枢配置答疑助手。接入、计费、报错、选型,问我都可以。" },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    // 模拟检索延迟
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: answerFor(q) }]);
    }, 350);
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

          {/* 消息区 */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
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
                    "max-w-[78%] rounded-lg px-3 py-2 leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* 快捷问题 */}
          <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
              placeholder="输入问题…"
              className="h-9"
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
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
