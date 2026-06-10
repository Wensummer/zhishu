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

import type {
  IntentEvent,
  Recommendation,
  TalkScript,
  TranscriptLine,
} from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TranscriptStream } from "@/components/copilot/transcript-stream";
import { IntentBadge } from "@/components/copilot/intent-badge";
import { RecommendationCard } from "@/components/workbench/recommendation-card";
import { TalkScriptCard } from "@/components/workbench/talk-script-card";

// —— 临时演示剧本(定页面长相用);Phase 后期改为经 lib/api 取 CallSession ——
const TRANSCRIPT: TranscriptLine[] = [
  { speaker: "manager", text: "周经理您好,这季度贵司调用量涨了约 40%,稳定性一直 99.8%,今天想和您过一下续约。", atSec: 0 },
  { speaker: "customer", text: "嗯,量确实涨了。不过最近财务在压成本,续约这块预算卡得紧。", atSec: 3 },
  { speaker: "manager", text: "理解,我们可以包年锁价,后面调价不影响您,预算更好做。", atSec: 7 },
  { speaker: "customer", text: "说到这个,我看市面上有些中转便宜不少,你们价格能不能再松松?", atSec: 11 },
  { speaker: "manager", text: "便宜的多是逆向渠道、随时跳价甚至跑路。我们是备案直连、渠道纯度可出证明,还能开正规发票。", atSec: 16 },
  { speaker: "customer", text: "发票和合规这块我们确实必须要。对了,我们质检那边想试试更智能的方案。", atSec: 21 },
  { speaker: "manager", text: "正好,我们有行业 MCP + 质检 Agent 的增值包,同行业落地效果不错,我回头给您发个方案。", atSec: 26 },
  { speaker: "customer", text: "可以,那续约我们走起,增值包也发我看看。", atSec: 31 },
];

const REC_RENEW: Recommendation = {
  id: "r-1",
  type: "renew",
  title: "包年锁价续约,化解预算顾虑",
  targetModelId: "通义千问-Max",
  targetPlanId: "包年企业版",
  reason: "客户担心成本与调价 —— 包年锁价给预算确定性,正面回应。",
  quoteRange: [180000, 210000],
  evidenceChain: {
    formula: "综合分 = 能力分 × 可用率 × 成本系数",
    score: 96.4,
    factors: [
      { key: "capability", label: "能力分", value: 92, display: "92", source: { label: "天翼云模型评测台", collectedAt: "2026-05-30" } },
      { key: "availability", label: "可用率", value: 0.998, display: "99.8%", source: { label: "可用性监控 · 30 天", collectedAt: "2026-06-08" } },
      { key: "costFactor", label: "成本系数", value: 1.05, display: "×1.05", source: { label: "定价知识库 · 包年", collectedAt: "2026-06-01" } },
    ],
  },
};

const REC_ADDON: Recommendation = {
  id: "r-2",
  type: "addon",
  title: "加推质检 Agent 增值包",
  targetModelId: "通义千问-Max",
  reason: "客户主动提到质检场景 —— 顺势加推,采纳概率高。",
  quoteRange: [36000, 52000],
  evidenceChain: {
    formula: "综合分 = 场景匹配 × 落地确定性 × 增值系数",
    score: 88.2,
    factors: [
      { key: "fit", label: "场景匹配", value: 0.94, display: "94%", source: { label: "客户用量画像", collectedAt: "2026-06-07" } },
      { key: "certainty", label: "落地确定性", value: 0.92, display: "92%", source: { label: "同行业案例库", collectedAt: "2026-05-20" } },
      { key: "valueFactor", label: "增值系数", value: 1.02, display: "×1.02", source: { label: "增值产品策略", collectedAt: "2026-06-01" } },
    ],
  },
};

const SCRIPT_OBJECTION: TalkScript = {
  id: "s-3",
  scene: "objection",
  title: "应对比价异议",
  objection: "市面上有更便宜的中转",
  content:
    "便宜多是逆向渠道、随时跳价或跑路,日志还可能掺别的模型。我们贵在确定性:锁价、SLA、7×24、数据不出境,证据链每项来源都能摊给您看。",
};

const INTENTS: IntentEvent[] = [
  { atSec: 3, level: "medium", needType: "成本敏感", note: "客户提到财务压成本,预算紧" },
  { atSec: 11, level: "medium", needType: "价格异议", note: "拿中转比价施压", triggersScriptId: "s-3", triggersRecommendationId: "r-1" },
  { atSec: 21, level: "high", needType: "质检新需求", note: "主动抛出质检智能化诉求", triggersRecommendationId: "r-2" },
  { atSec: 31, level: "high", needType: "成交信号", note: "确认续约 + 索要增值包方案" },
];

const REC_MAP: Record<string, Recommendation> = { "r-1": REC_RENEW, "r-2": REC_ADDON };
const SCRIPT_MAP: Record<string, TalkScript> = { "s-3": SCRIPT_OBJECTION };

const MAX_SEC = 34;
const TICK_MS = 700; // 每 700ms 推进 1 秒

export default function CopilotPage({
  params,
}: {
  params: { customerId: string };
}) {
  const [elapsed, setElapsed] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e >= MAX_SEC) {
          setPlaying(false);
          return e;
        }
        return e + 1;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing]);

  const visibleLines = TRANSCRIPT.filter((l) => l.atSec <= elapsed);
  const firedIntents = INTENTS.filter((i) => i.atSec <= elapsed);
  const currentIntent = firedIntents[firedIntents.length - 1];
  const finished = elapsed >= MAX_SEC;
  const pending = playing && visibleLines.length < TRANSCRIPT.length;

  // 已触发的动态弹屏(按出现顺序,去重)
  const triggeredRecIds = Array.from(
    new Set(firedIntents.map((i) => i.triggersRecommendationId).filter(Boolean) as string[])
  );
  const triggeredScriptIds = Array.from(
    new Set(firedIntents.map((i) => i.triggersScriptId).filter(Boolean) as string[])
  );

  function start() {
    if (finished) setElapsed(0);
    setPlaying(true);
  }

  return (
    <>
      <PageHeader
        title="通话中实时 Copilot"
        description={`客户 ${params.customerId} · 实时 ASR + 意图识别 + 动态弹屏推荐与话术`}
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

      {/* 通话进度 */}
      <div className="flex items-center gap-3">
        <Badge variant={playing ? "success" : "secondary"} className="gap-1">
          <Radio className="h-3 w-3" />
          {playing ? "通话中" : finished ? "已结束" : "待开始"}
        </Badge>
        <Progress value={(elapsed / MAX_SEC) * 100} className="flex-1" />
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
          {/* 当前意图 */}
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

          {/* 动态弹屏:话术 */}
          {triggeredScriptIds.map((id) => (
            <div key={id} className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 触发话术
              </p>
              <TalkScriptCard script={SCRIPT_MAP[id]} />
            </div>
          ))}

          {/* 动态弹屏:推荐 */}
          {triggeredRecIds.map((id) => (
            <div key={id} className="animate-fade-in">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                ⚡ 动态推荐(附证据链)
              </p>
              <RecommendationCard recommendation={REC_MAP[id]} />
            </div>
          ))}

          {!currentIntent && (
            <p className="px-1 text-xs text-muted-foreground">
              客户提出新需求或异议时,这里会实时弹出对应推荐与话术。
            </p>
          )}
        </div>
      </div>

      {/* 通话结束:复盘摘要 */}
      {finished && (
        <Card className="animate-fade-in border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              通话复盘摘要
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              客户确认续约「通义千问-Max 包年企业版」,接受包年锁价;对质检 Agent
              增值包有明确兴趣,需补发方案。比价异议已用合规 + 锁价话术化解。
            </p>
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
