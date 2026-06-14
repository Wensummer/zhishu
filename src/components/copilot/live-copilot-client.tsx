"use client";

import * as React from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Radio,
  ClipboardCheck,
  FileText,
  Copy,
  Check,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Circle,
  Smartphone,
  Send,
} from "lucide-react";

import type {
  IntentEvent,
  Recommendation,
  TalkScript,
  TranscriptLine,
} from "@/lib/types";
import {
  analyzeUtterance,
  generateScript,
  generateCallSummary,
  saveCallSummary,
  type NeedProfile,
  type CallSummary,
  type CallTurn,
} from "@/lib/api";
import {
  calculateConfidence,
  type ConfidenceBreakdown,
} from "@/lib/recommendation/confidence";
import type { KnowledgeEvidenceRecord } from "@/lib/dify/types";
import { cn, formatCNY } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranscriptStream } from "@/components/copilot/transcript-stream";
import { IntentBadge } from "@/components/copilot/intent-badge";
import { RecommendationCard } from "@/components/workbench/recommendation-card";
import { TalkScriptCard } from "@/components/workbench/talk-script-card";

/** 静音超过这么久(毫秒)自动停止聆听,无需手动点停止。 */
const SILENCE_MS = 5000;

/** 通话中一轮:客户原话 + 意图 + 推荐 + 话术(累积,不覆盖)。 */
interface LiveTurn {
  said: string;
  level: IntentEvent["level"];
  needType: string;
  note?: string;
  recommendation?: string;
  script?: string;
}

/**
 * 实时麦克风 Copilot —— 浏览器 Web Speech 本地转写,定稿后送后端做意图识别。
 *
 * ASR:浏览器 Web Speech API(zh-CN,中间结果实时上字)。
 * 意图/推荐:后端 /api/copilot/analyze → Python 后端(DeepSeek)。
 * 自动停止:静音 SILENCE_MS 后自动结束聆听。
 * 注:仅 Chrome/Edge 支持;音频经浏览器走谷歌识别,正式生产换讯飞(数据不出境)。
 */
export function LiveCopilotClient({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [lines, setLines] = React.useState<TranscriptLine[]>([]);
  const [interim, setInterim] = React.useState("");
  // 本通对话轨迹(累积,不覆盖):每轮 客户原话 + 意图 + 推荐 + 话术
  const [turns, setTurns] = React.useState<LiveTurn[]>([]);
  const [followUpSent, setFollowUpSent] = React.useState(false); // 一键发送跟进(mock 动作)
  const [rec, setRec] = React.useState<Recommendation | null>(null);
  const [script, setScript] = React.useState<TalkScript | null>(null);
  const [listening, setListening] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // 推荐的知识库依据 + 推荐置信度(量化 + Dify 缝合)
  const [recRecords, setRecRecords] = React.useState<KnowledgeEvidenceRecord[]>(
    []
  );
  const [recConfidence, setRecConfidence] =
    React.useState<ConfidenceBreakdown | null>(null);
  const [evidenceLoading, setEvidenceLoading] = React.useState(false);
  const [scriptLoading, setScriptLoading] = React.useState(false);
  // 通话小结(结束通话后 LLM 生成 → 可回流到客户档案)
  const [summary, setSummary] = React.useState<CallSummary | null>(null);
  const [summarizing, setSummarizing] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = React.useRef<any>(null);
  const linesRef = React.useRef<TranscriptLine[]>([]);
  const silenceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const restartGuardRef = React.useRef(0); // 连续异常结束计数,防 aborted 死循环
  // 权威逐轮数据(同步可写);turns 为其渲染副本(setTurns 同步)
  const turnsRef = React.useRef<LiveTurn[]>([]);
  React.useEffect(() => {
    linesRef.current = lines;
  }, [lines]);
  // 镜像最新推荐,供"无新推荐的轮次"做话术背景
  const recRef = React.useRef<Recommendation | null>(null);
  React.useEffect(() => {
    recRef.current = rec;
  }, [rec]);

  function clearSilenceTimer() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  }
  // 有语音活动就重置;静音超过 SILENCE_MS 自动停止
  function armSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => stop(), SILENCE_MS);
  }

  // 把抽出的需求映射成 Dify 检索用的"四问场景"(对齐 recommendation-evidence 路由的取值)
  function needToAnswers(need?: NeedProfile) {
    const sceneMap: Record<string, string> = {
      代码: "code",
      长文本: "longdoc",
      数学推理: "reasoning",
    };
    return {
      scene: (need?.task && sceneMap[need.task]) || "general",
      scale: "medium",
      latency: "mid",
      budget: need?.priceSensitive ? "low" : "mid",
    };
  }

  // 拿到推荐后,从 Dify 选型知识库检索定性依据,并把量化分 + 知识依据缝成推荐置信度
  async function fetchEvidence(r: Recommendation, need?: NeedProfile) {
    setEvidenceLoading(true);
    setRecRecords([]);
    setRecConfidence(null);
    let records: KnowledgeEvidenceRecord[] = [];
    try {
      const res = await fetch("/api/recommendation-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: [{ modelId: r.targetModelId, modelName: r.targetModelId }],
          answers: needToAnswers(need),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        records = data?.results?.[0]?.records ?? [];
      }
    } catch {
      // Dify 不可用不影响推荐,置信度退回主要看量化指标
    } finally {
      setRecRecords(records);
      setRecConfidence(
        calculateConfidence({
          rank: 0,
          adjustedScore: r.evidenceChain.score,
          sceneMatched: true,
          records,
        })
      );
      setEvidenceLoading(false);
    }
  }

  // 每轮客户发言后异步生成话术(慢路径,不阻塞弹屏);有推荐就带上模型,没有就纯异议应对
  async function fetchScript(
    text: string,
    context: string | undefined,
    currentIntent: IntentEvent,
    r: Recommendation | null,
    turnIndex?: number
  ) {
    setScriptLoading(true);
    setScript(null);
    try {
      const s = await generateScript({
        text,
        context,
        needType: currentIntent.needType,
        note: currentIntent.note,
        targetModelId: r?.targetModelId,
        reason: r?.reason,
        score: r?.evidenceChain.score,
      });
      setScript(s);
      // 回填该轮的话术,供逐轮记录(并同步渲染)
      if (turnIndex != null && turnsRef.current[turnIndex]) {
        turnsRef.current[turnIndex].script = s.content;
        setTurns(turnsRef.current.slice());
      }
    } catch {
      // 话术生成失败就不显示,不影响推荐
    } finally {
      setScriptLoading(false);
    }
  }

  async function onFinalUtterance(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setLines((prev) => [...prev, { speaker: "customer", text, atSec: 0 }]);
    setAnalyzing(true);
    try {
      // 取最近 3 轮做上下文(此刻 linesRef 还没含当前这句,正好当"之前的对话")
      const context = linesRef.current
        .slice(-3)
        .map((l) => `${l.speaker === "customer" ? "客户" : "销售"}: ${l.text}`)
        .join("\n");
      const res = await analyzeUtterance(text, context || undefined);
      // 命中才更新,没命中保留上一次(也可按需清空)
      if (res.recommendation) {
        setRec(res.recommendation);
        // Dify 证据+置信度异步,不阻塞弹屏
        fetchEvidence(res.recommendation, res.need);
      }
      // 逐轮记录:客户原话 + 当轮意图/推荐(话术由 fetchScript 异步回填),累积不覆盖
      const turnIndex = turnsRef.current.length;
      turnsRef.current.push({
        said: text,
        level: res.intent.level,
        needType: res.intent.needType,
        note: res.intent.note,
        recommendation: res.recommendation?.targetModelId,
      });
      setTurns(turnsRef.current.slice());
      // 话术:每轮有意义的意图都更新(贴合客户刚说的话),带上当前/上一次推荐做背景
      if (res.intent.needType !== "无明显意图") {
        fetchScript(
          text,
          context || undefined,
          res.intent,
          res.recommendation ?? recRef.current,
          turnIndex
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "意图分析失败");
    } finally {
      setAnalyzing(false);
    }
  }

  function start() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("这个浏览器不支持 Web Speech API,请用 Chrome 或 Edge。");
      return;
    }
    setError(null);
    const recog = new SR();
    recog.lang = "zh-CN";
    recog.continuous = true;
    recog.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recog.onresult = (e: any) => {
      restartGuardRef.current = 0; // 收到结果说明会话健康,清零
      let it = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) onFinalUtterance(tr);
        else it += tr;
      }
      setInterim(it);
      armSilenceTimer(); // 有声音就续命
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recog.onerror = (e: any) => {
      console.error("[Web Speech error]", e.error, e.message ?? "");
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("麦克风未授权:请点浏览器地址栏左侧允许麦克风,再点开始说话。");
        recogRef.current = null; // 别再自动重启
        setListening(false);
        return;
      }
      // 诊断用:把原始错误码显示出来(network=连不上谷歌;no-speech=没收到声音;aborted=被中断)
      setError(`识别错误码:${e.error}` + (e.error === "network" ? "(连不上谷歌识别服务,国内常见)" : ""));
      // no-speech / aborted / network 等交给 onend 决定是否重启
    };
    // Chrome 在连续模式下可能自己结束;延迟重启(立刻重启会和 Chrome 抢,触发 aborted 死循环)
    recog.onend = () => {
      if (recogRef.current !== recog) return; // 已主动停止或被替换
      restartGuardRef.current += 1;
      if (restartGuardRef.current > 5) {
        setError("麦克风识别反复中断,请检查麦克风权限或网络后重试。");
        recogRef.current = null;
        setListening(false);
        return;
      }
      setTimeout(() => {
        if (recogRef.current !== recog) return;
        try {
          recog.start();
        } catch {
          /* InvalidStateError 等忽略 */
        }
      }, 250);
    };

    recogRef.current = recog;
    restartGuardRef.current = 0;
    recog.start();
    setListening(true);
    armSilenceTimer(); // 开始后先起一个静音计时
  }

  function stop() {
    clearSilenceTimer();
    const recog = recogRef.current;
    recogRef.current = null; // 先清,onend 才不会自动重启
    if (recog) recog.stop();
    setListening(false);
    setInterim("");
  }

  React.useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      const recog = recogRef.current;
      recogRef.current = null;
      if (recog) recog.stop();
    };
  }, []);

  // 结束通话 → 据整通转写生成小结(真 LLM)
  async function endCall() {
    stop();
    const transcript = linesRef.current
      .map((l) => l.text)
      .join("\n")
      .trim();
    if (!transcript) {
      setSummaryError("还没有对话内容,先说几句再结束通话。");
      return;
    }
    setSummary(null);
    setSaved(false);
    setSummaryError(null);
    setSummarizing(true);
    try {
      const s = await generateCallSummary({
        transcript,
        customerId,
        customerName,
      });
      // 把前端收集的逐轮记录并进小结(随回流一起持久化)
      const turnsForSave: CallTurn[] = turnsRef.current.map((t) => ({
        customerSaid: t.said,
        needType: t.needType,
        recommendation: t.recommendation,
        script: t.script,
      }));
      setSummary({ ...s, turns: turnsForSave });
    } catch {
      setSummaryError("小结生成失败,请重试。");
    } finally {
      setSummarizing(false);
    }
  }

  // 回流:存到客户名下(沟通历史)+ 回流商机标签
  async function saveSummary() {
    if (!summary) return;
    try {
      await saveCallSummary(summary);
      setSaved(true);
    } catch {
      setSummaryError("回流失败,请重试。");
    }
  }

  function copySummary() {
    if (!summary) return;
    const text = [
      `客户诉求:${summary.demand}`,
      `意图与异议:${summary.intents}`,
      `推荐与报价:${summary.recommendation}`,
      `成交温度:${summary.temperature}`,
      `下一步跟进:\n${summary.nextSteps.map((s) => `- ${s}`).join("\n")}`,
      summary.scripts.length
        ? `可沉淀话术:\n${summary.scripts.map((s) => `- ${s}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function sendFollowUp() {
    setFollowUpSent(true); // 演示:接真企微/短信网关即实际下发
  }

  // 关键动作 checklist:状态全部从真实对话轨迹推导(非写死)
  const hasNeed = turns.some((t) => t.needType && t.needType !== "无明显意图");
  const hasRec = turns.some((t) => !!t.recommendation);
  const priceConcern = turns.some((t) =>
    /价|成本|报价|预算|贵|套餐|续费/.test(t.needType)
  );
  const closeSignal = turns.some((t) => /成交|续费|确认/.test(t.needType));
  type Step = "done" | "todo" | "pending";
  const checklist: { label: string; status: Step }[] = [
    { label: "了解客户需求", status: hasNeed ? "done" : "pending" },
    {
      label: "匹配模型推荐",
      status: hasRec ? "done" : hasNeed ? "todo" : "pending",
    },
    {
      label: "发送跟进 / 加微信",
      status: followUpSent ? "done" : hasRec ? "todo" : "pending",
    },
    {
      label: "推进促成",
      status: closeSignal ? (followUpSent ? "done" : "todo") : "pending",
    },
  ];
  const doneCount = checklist.filter((c) => c.status === "done").length;
  // 动态漏讲提醒(该做没做)
  const alerts: string[] = [];
  if (priceConcern && !followUpSent)
    alerts.push("客户在意价格,建议把报价发到客户手机");
  if (closeSignal && !followUpSent)
    alerts.push("出现成交信号,可尝试促成 + 发送方案");
  if (hasNeed && !hasRec) alerts.push("已了解需求,还没给客户匹配模型推荐");

  // 把当前中间结果作为一条"未定稿"的灰行接在后面
  const displayLines: TranscriptLine[] = interim
    ? [...lines, { speaker: "customer", text: interim, atSec: 0 }]
    : lines;

  return (
    <>
      <PageHeader
        title="通话中实时 Copilot · 实时麦克风"
        description={`${customerName}(${customerId}) · 浏览器实时转写 + DeepSeek 意图识别 · 静音 ${
          SILENCE_MS / 1000
        } 秒自动停止`}
        actions={
          <div className="flex gap-2">
            {listening ? (
              <Button variant="outline" onClick={stop}>
                <MicOff className="h-4 w-4" />
                停止
              </Button>
            ) : (
              <Button onClick={start}>
                <Mic className="h-4 w-4" />
                开始说话
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={endCall}
              disabled={summarizing || lines.length === 0}
            >
              {summarizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              结束通话 · 生成小结
            </Button>
          </div>
        }
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Badge variant={listening ? "success" : "secondary"} className="gap-1">
          <Radio className="h-3 w-3" />
          {listening ? "聆听中" : "未开始"}
        </Badge>
        {analyzing && (
          <span className="text-xs text-muted-foreground">意图分析中…</span>
        )}
        {listening && (
          <span className="text-xs text-muted-foreground">
            停顿 {SILENCE_MS / 1000} 秒会自动停止
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左:实时转写 */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">实时转写(浏览器 ASR)</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[24rem]">
            <TranscriptStream lines={displayLines} pending={listening} />
          </CardContent>
        </Card>

        {/* 右:实时 copilot 弹屏 */}
        <div className="space-y-4">
          {/* 关键动作 checklist(漏讲提醒)—— 状态从真实对话推导 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                关键动作
                <Badge variant="secondary" className="ml-auto font-normal">
                  {doneCount}/{checklist.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : item.status === "todo" ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <span
                    className={cn(
                      item.status === "done" &&
                        "text-muted-foreground line-through",
                      item.status === "todo" && "font-medium text-warning",
                      item.status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                  {item.status === "todo" && (
                    <Badge
                      variant="warning"
                      className="ml-auto shrink-0 text-[10px]"
                    >
                      待办
                    </Badge>
                  )}
                </div>
              ))}
              {alerts.map((a) => (
                <p
                  key={a}
                  className="flex items-start gap-1.5 rounded-md bg-warning/10 px-2 py-1.5 text-xs text-warning"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {a}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* 一键发送跟进(有推荐时出现);内容真实、发送动作 mock */}
          {hasRec && (
            <Card className="border-primary/40">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Smartphone className="h-4 w-4 text-primary" />
                  发送跟进到客户手机
                </div>
                <p className="text-xs text-muted-foreground">
                  引导话术:“方案和报价我发您手机,您加我微信我同步给您。”
                </p>
                <div className="space-y-0.5 rounded-md border bg-muted/30 p-2 text-xs">
                  <p>
                    📦 推荐方案:
                    <span className="font-medium">
                      {rec?.title ?? rec?.targetModelId}
                    </span>
                  </p>
                  {rec?.quoteRange && (
                    <p>
                      💰 报价:{formatCNY(rec.quoteRange[0])} ~{" "}
                      {formatCNY(rec.quoteRange[1])}
                    </p>
                  )}
                  <p>🔗 方案落地页 + 销售企微二维码</p>
                </div>
                {followUpSent ? (
                  <p className="flex items-center gap-1.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    已发送到客户手机(模拟)
                  </p>
                ) : (
                  <Button size="sm" className="w-full" onClick={sendFollowUp}>
                    <Send className="h-4 w-4" />
                    一键发送到客户手机
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                对话轨迹
                {turns.length > 0 && (
                  <Badge variant="secondary" className="ml-auto font-normal">
                    本通 {turns.length} 轮
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {turns.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  点「开始说话」,对着麦克风说一句客户的话试试。
                </p>
              ) : (
                <div className="relative space-y-3 pl-5">
                  {/* 时间线竖线:贯穿所有节点 */}
                  <span className="absolute bottom-1 left-[6px] top-2 w-px bg-border" />
                  {turns
                    .map((t, i) => ({ t, i }))
                    .reverse()
                    .map(({ t, i }, idx) => {
                      const latest = idx === 0;
                      return (
                        <div key={i} className="relative">
                          {/* 节点圆点:最新实心高亮,历史空心 */}
                          <span
                            className={cn(
                              "absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2",
                              latest
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/40 bg-background"
                            )}
                          />
                          <div
                            className={cn(
                              "rounded-md p-2 text-xs",
                              latest && "bg-primary/[0.04]"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="shrink-0 font-medium text-muted-foreground">
                                第 {i + 1} 轮
                              </span>
                              {latest && <IntentBadge level={t.level} />}
                              <Badge
                                variant="outline"
                                className="shrink-0 text-[10px]"
                              >
                                {t.needType}
                              </Badge>
                              {latest && (
                                <Badge
                                  variant="secondary"
                                  className="ml-auto shrink-0 text-[10px]"
                                >
                                  最新
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-muted-foreground">
                              “{t.said}”
                            </p>
                            {t.recommendation && (
                              <p className="mt-1 font-medium text-primary">
                                推荐:{t.recommendation}
                              </p>
                            )}
                            {t.script && (
                              <p className="mt-0.5 text-muted-foreground">
                                话术:{t.script}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {(script || scriptLoading) && (
            <div className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 给销售的话术
              </p>
              {script ? (
                <TalkScriptCard script={script} />
              ) : (
                <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                  话术生成中…(检索话术库 + AI 生成)
                </p>
              )}
            </div>
          )}

          {rec && (
            <div className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 动态推荐(证据链 + 知识库依据)
              </p>
              <RecommendationCard
                recommendation={rec}
                defaultOpenEvidence
                confidence={recConfidence ?? undefined}
                records={recRecords}
                loading={evidenceLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* 通话小结(结束通话后生成) */}
      {(summary || summarizing || summaryError) && (
        <Card className="animate-fade-in border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              通话小结(AI 生成)
              {summary && <TempBadge t={summary.temperature} />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {summarizing && (
              <p className="text-muted-foreground">
                正在根据本通对话生成小结…
              </p>
            )}
            {summaryError && <p className="text-red-600">{summaryError}</p>}
            {summary && (
              <>
                <SummaryField label="客户诉求" value={summary.demand} />
                <SummaryField label="意图与异议" value={summary.intents} />
                <SummaryField label="推荐与报价" value={summary.recommendation} />
                {summary.nextSteps.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      下一步跟进(含客情维护)
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      {summary.nextSteps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.scripts.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      可沉淀话术
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      {summary.scripts.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.turns && summary.turns.length > 0 && (
                  <details className="rounded-md border bg-muted/30 p-2">
                    <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                      通话回放（{summary.turns.length} 轮 · 客户原话 + 给销售话术）
                    </summary>
                    <div className="mt-2 space-y-2">
                      {summary.turns.map((t, i) => (
                        <div
                          key={i}
                          className="border-l-2 border-primary/30 pl-2 text-xs"
                        >
                          <p>
                            <span className="text-muted-foreground">客户:</span>{" "}
                            {t.customerSaid}
                          </p>
                          {t.recommendation && (
                            <p className="font-medium text-primary">
                              <span className="text-muted-foreground">推荐:</span>{" "}
                              {t.recommendation}
                            </p>
                          )}
                          {t.script && (
                            <p className="text-muted-foreground">
                              话术:{t.script}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={copySummary}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "已复制" : "复制"}
                  </Button>
                  <Button size="sm" onClick={saveSummary} disabled={saved}>
                    {saved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saved ? "已回流到客户档案" : "回流到客户档案"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>{" "}
      <span>{value}</span>
    </div>
  );
}

function TempBadge({ t }: { t: string }) {
  const variant =
    t === "热" ? "destructive" : t === "冷" ? "secondary" : "warning";
  return <Badge variant={variant}>{t}·意向</Badge>;
}
