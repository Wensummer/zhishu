"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
  Radio,
} from "lucide-react";

import type { CopilotScript } from "@/lib/demo/sessions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TranscriptStream } from "@/components/copilot/transcript-stream";
import { IntentBadge } from "@/components/copilot/intent-badge";
import { RecommendationCard } from "@/components/workbench/recommendation-card";
import { TalkScriptCard } from "@/components/workbench/talk-script-card";
import { LiveCopilotClient } from "@/components/copilot/live-copilot-client";

const TICK_MS = 700; // 每 700ms 推进 1 秒

/** P0-3 通话中实时 copilot —— 客户端交互(定时器驱动转写与弹屏)。 */
export function CopilotClient({
  session,
  customerId,
}: {
  session: CopilotScript;
  customerId: string;
}) {
  const { maxSec, transcript, intents, recommendations, scripts } = session;
  const [elapsed, setElapsed] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [mode, setMode] = React.useState<"replay" | "live">("replay");

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e >= maxSec) {
          setPlaying(false);
          return e;
        }
        return e + 1;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, maxSec]);

  const visibleLines = transcript.filter((l) => l.atSec <= elapsed);
  const firedIntents = intents.filter((i) => i.atSec <= elapsed);
  const currentIntent = firedIntents[firedIntents.length - 1];
  const finished = elapsed >= maxSec;
  const pending = playing && visibleLines.length < transcript.length;

  const triggeredRecIds = Array.from(
    new Set(
      firedIntents.map((i) => i.triggersRecommendationId).filter(Boolean) as string[]
    )
  );
  const triggeredScriptIds = Array.from(
    new Set(firedIntents.map((i) => i.triggersScriptId).filter(Boolean) as string[])
  );

  function start() {
    if (finished) setElapsed(0);
    setPlaying(true);
  }

  const modeToggle = (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={mode === "replay" ? "default" : "outline"}
        onClick={() => setMode("replay")}
      >
        剧本回放(演示)
      </Button>
      <Button
        size="sm"
        variant={mode === "live" ? "default" : "outline"}
        onClick={() => setMode("live")}
      >
        实时麦克风(Web Speech)
      </Button>
    </div>
  );

  if (mode === "live") {
    return (
      <>
        {modeToggle}
        <LiveCopilotClient
          customerId={customerId}
          customerName={session.customerName}
        />
      </>
    );
  }

  return (
    <>
      {modeToggle}
      <PageHeader
        title="通话中实时 Copilot"
        description={`${session.customerName}(${customerId}) · 实时 ASR + 意图识别 + 动态弹屏推荐与话术`}
        actions={
          <div className="flex items-center gap-2">
            {playing ? (
              <Button variant="outline" onClick={() => setPlaying(false)}>
                <Pause className="h-4 w-4" />
                暂停
              </Button>
            ) : (
              <Button onClick={start}>
                <Play className="h-4 w-4" />
                {elapsed === 0 ? "开始通话" : finished ? "重新播放" : "继续"}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setPlaying(false);
                setElapsed(0);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <Badge variant={playing ? "success" : "secondary"} className="gap-1">
          <Radio className="h-3 w-3" />
          {playing ? "通话中" : finished ? "已结束" : "待开始"}
        </Badge>
        <Progress value={(elapsed / maxSec) * 100} className="flex-1" />
        <span className="text-xs tabular-nums text-muted-foreground">
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
          {String(elapsed % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左:实时转写 */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">实时转写(ASR)</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[24rem]">
            <TranscriptStream lines={visibleLines} pending={pending} />
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
              {currentIntent ? (
                <div className="flex items-center gap-2 text-sm">
                  <IntentBadge level={currentIntent.level} />
                  <Badge variant="outline">{currentIntent.needType}</Badge>
                  <span className="text-muted-foreground">
                    {currentIntent.note}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  等待客户开口…意图与商机分类将实时更新。
                </p>
              )}
            </CardContent>
          </Card>

          {triggeredScriptIds.map((id) => (
            <div key={id} className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 触发话术
              </p>
              <TalkScriptCard script={scripts[id]} />
            </div>
          ))}

          {triggeredRecIds.map((id) => (
            <div key={id} className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 动态推荐(附证据链)
              </p>
              <RecommendationCard recommendation={recommendations[id]} />
            </div>
          ))}

          {!currentIntent && (
            <p className="px-1 text-xs text-muted-foreground">
              客户提出新需求或异议时,这里会实时弹出对应推荐与话术。
            </p>
          )}
        </div>
      </div>

      {finished && (
        <Card className="animate-fade-in border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              通话复盘摘要
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{session.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">成交信号:续约确认</Badge>
              <Badge variant="warning">待办:发送质检增值包方案</Badge>
              <Badge variant="secondary">已回流话术库</Badge>
              <Badge variant="secondary">已回流商机库</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
