"use client";

import * as React from "react";
import { Mic, MicOff, Sparkles, Radio } from "lucide-react";

import type {
  IntentEvent,
  Recommendation,
  TalkScript,
  TranscriptLine,
} from "@/lib/types";
import { analyzeUtterance } from "@/lib/api";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = React.useRef<any>(null);
  const linesRef = React.useRef<TranscriptLine[]>([]);
  const silenceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  React.useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  function clearSilenceTimer() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  }
  // 有语音活动就重置;静音超过 SILENCE_MS 自动停止
  function armSilenceTimer() {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => stop(), SILENCE_MS);
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
      if (res.recommendation) setRec(res.recommendation);
      if (res.script) setScript(res.script);
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
    recog.onerror = (e: any) => setError("识别出错:" + e.error);
    // 连续模式下偶尔会自己结束,只要还在听就自动重启
    recog.onend = () => {
      if (recogRef.current) recog.start();
    };

    recogRef.current = recog;
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

          {script && (
            <div className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 触发话术
              </p>
              <TalkScriptCard script={script} />
            </div>
          )}

          {rec && (
            <div className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 动态推荐(附证据链)
              </p>
              <RecommendationCard recommendation={rec} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
