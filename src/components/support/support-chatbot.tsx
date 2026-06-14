"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bot, X, Send, User, Loader2, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Msg {
  role: "user" | "bot";
  text: string;
}

const DEFAULT_SUGGESTIONS = ["如何接入?", "怎么计费?", "报错 429 怎么办?", "帮我选型"];

/**
 * 页面上下文表:让 chatbot 知道用户当前在哪个页面,给本页相关帮助。
 * label 显示在头部、hint 随请求发给后端注入提示词、suggestions 是本页的快捷问题。
 * 匹配按 match 前缀,最长优先(见 pageCtxFor)。
 */
interface PageCtx {
  match: string;
  label: string;
  hint: string;
  suggestions: string[];
}

const PAGE_CONTEXTS: PageCtx[] = [
  { match: "/models", label: "模型横评", hint: "对比各模型的综合分/能力/价格/延迟,辅助选型", suggestions: ["综合分是怎么算的?", "怎么挑性价比最高的?", "能力分看哪些维度?"] },
  { match: "/status", label: "状态监控", hint: "查看各模型实时可用率与延迟", suggestions: ["可用率怎么统计的?", "某模型报错率高怎么办?", "延迟看哪个指标?"] },
  { match: "/wizard", label: "四问选型", hint: "按场景/量级/延迟/预算自助选型,产出推荐+可核验证据链", suggestions: ["这四个问题怎么填?", "证据链怎么看?", "推荐结果可信吗?"] },
  { match: "/console", label: "API 控制台", hint: "接入示例、One Key、SDK 调用方式", suggestions: ["怎么接入?给个示例", "One Key 在哪里拿?", "支持哪些 SDK?"] },
  { match: "/billing", label: "计费明细", hint: "按 token 与缓存折扣的费用明细", suggestions: ["这笔费用怎么算的?", "缓存折扣怎么生效?", "能导出账单吗?"] },
  { match: "/workbench/copilot", label: "通话中 Copilot", hint: "实时转写 + 意图识别 + 动态推荐与话术", suggestions: ["意图识别准吗?", "话术是怎么生成的?", "推荐依据是什么?"] },
  { match: "/workbench/briefing", label: "通话前简报", hint: "客户背景 + 选型推荐 + 随身话术", suggestions: ["证据链怎么看?", "推荐理由可信吗?", "这个客户该聊什么?"] },
  { match: "/admin/system-models", label: "系统模型配置", hint: "平台各能力位绑定的模型 + 系统提示词", suggestions: ["系统提示词怎么配?", "为什么绑能力位不绑模型?", "改了立刻生效吗?"] },
  { match: "/admin/pricing", label: "价格配置", hint: "对外售卖模型的定价管理", suggestions: ["怎么改某模型单价?", "调价会怎么公示?"] },
  { match: "/admin/products", label: "产品配置", hint: "对外可售模型池/套餐的管理", suggestions: ["怎么上下架模型?", "套餐怎么配?"] },
  { match: "/admin/operations", label: "运营分析", hint: "平台运营与转化分析", suggestions: ["这些指标怎么看?", "转化率怎么算?"] },
  { match: "/admin/compliance", label: "合规管理", hint: "备案、数据不出境、审计留痕", suggestions: ["合规要点有哪些?", "数据怎么保证不出境?"] },
  { match: "/admin", label: "数据大屏", hint: "平台经营与效率总览", suggestions: ["这些数字怎么理解?", "效率提升怎么算的?"] },
  { match: "/panel/boss", label: "经营总览", hint: "甲方视角的用量与成本总览", suggestions: ["我的成本花在哪了?", "怎么降本?"] },
  { match: "/panel/user", label: "我的用量", hint: "C 端用户的用量与额度", suggestions: ["我的额度还剩多少?", "用超了怎么办?"] },
];

const DEFAULT_CTX: Omit<PageCtx, "match"> = {
  label: "",
  hint: "",
  suggestions: DEFAULT_SUGGESTIONS,
};

function pageCtxFor(pathname: string): Omit<PageCtx, "match"> {
  const hit = [...PAGE_CONTEXTS]
    .sort((a, b) => b.match.length - a.match.length)
    .find((c) => pathname === c.match || pathname.startsWith(c.match + "/"));
  return hit ?? DEFAULT_CTX;
}

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
  const pathname = usePathname();
  const ctx = pageCtxFor(pathname);
  // 当前页面简述,发给后端注入提示词(无具体页则不发)
  const page = ctx.label ? `${ctx.label} — ${ctx.hint}` : undefined;

  // LLM 按页生成的"猜你想问"(键=页面 label),覆盖手写兜底。未生成前用手写,0 延迟。
  const [gen, setGen] = React.useState<Record<string, string[]>>({});
  const suggestions =
    (ctx.label && gen[ctx.label]?.length ? gen[ctx.label] : null) ?? ctx.suggestions;

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  // 打开 chatbot 且当前页有上下文时,异步拉取 LLM 生成的快捷问句(每页只拉一次)
  React.useEffect(() => {
    if (!open || !page || !ctx.label || gen[ctx.label]) return;
    let cancelled = false;
    fetch(`/api/chat/suggestions?page=${encodeURIComponent(page)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        const arr: string[] = Array.isArray(d?.suggestions) ? d.suggestions : [];
        if (!cancelled && arr.length) setGen((g) => ({ ...g, [ctx.label]: arr }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, page, ctx.label, gen]);

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
        body: JSON.stringify({ messages: payload, page }),
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
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-medium">
                <Bot className="h-4 w-4 text-primary" />
                智枢答疑助手
              </div>
              {ctx.label && (
                <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  当前页面 · {ctx.label}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
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

          {/* 快捷问题(随当前页面变化;LLM 生成好后替换手写兜底) */}
          <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
            {suggestions.map((s) => (
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
