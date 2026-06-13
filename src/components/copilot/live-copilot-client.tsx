"use client";

import * as React from "react";
import { Mic, MicOff, Sparkles, Radio } from "lucide-react";

import type {
  IntentEvent,
  Recommendation,
  TalkScript,
  TranscriptLine,
} from "@/lib/types";
import { analyzeUtterance, generateScript, type NeedProfile } from "@/lib/api";
import {
  calculateConfidence,
  type ConfidenceBreakdown,
} from "@/lib/recommendation/confidence";
import type { KnowledgeEvidenceRecord } from "@/lib/dify/types";
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
  const [intent, setIntent] = React.useState<IntentEvent | null>(null);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = React.useRef<any>(null);
  const linesRef = React.useRef<TranscriptLine[]>([]);
  const silenceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const restartGuardRef = React.useRef(0); // 连续异常结束计数,防 aborted 死循环
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
    r: Recommendation | null
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
      setIntent(res.intent);
      // 命中才更新,没命中保留上一次(也可按需清空)
      if (res.recommendation) {
        setRec(res.recommendation);
        // Dify 证据+置信度异步,不阻塞弹屏
        fetchEvidence(res.recommendation, res.need);
      }
      // 话术:每轮有意义的意图都更新(贴合客户刚说的话),带上当前/上一次推荐做背景
      if (res.intent.needType !== "无明显意图") {
        fetchScript(
          text,
          context || undefined,
          res.intent,
          res.recommendation ?? recRef.current
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
          listening ? (
            <Button variant="outline" onClick={stop}>
              <MicOff className="h-4 w-4" />
              停止
            </Button>
          ) : (
            <Button onClick={start}>
              <Mic className="h-4 w-4" />
              开始说话
            </Button>
          )
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                实时意图识别
              </CardTitle>
            </CardHeader>
            <CardContent>
              {intent ? (
                <div className="flex items-start gap-2 text-sm">
                  <IntentBadge level={intent.level} />
                  <Badge
                    variant="outline"
                    className="shrink-0 whitespace-nowrap"
                  >
                    {intent.needType}
                  </Badge>
                  <span className="text-muted-foreground">{intent.note}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  点「开始说话」,对着麦克风说一句客户的话试试。
                </p>
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
    </>
  );
}
