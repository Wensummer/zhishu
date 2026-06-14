"use client";

import * as React from "react";
import {
  Wallet,
  CalendarClock,
  AlertTriangle,
  Bug,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ChevronDown,
  History,
} from "lucide-react";

import type { Briefing } from "@/lib/demo/briefings";
import type { EnterpriseInfo } from "@/lib/types";
import { formatCNY, cn } from "@/lib/utils";
import { getCallSummaries, type CallSummary } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/shared/sparkline";
import { OpportunityTag } from "@/components/workbench/opportunity-tag";
import { TalkScriptCard } from "@/components/workbench/talk-script-card";
import { StrategyInsights } from "@/components/enterprise/enterprise-panel";
import { EnterpriseRadarCard } from "@/components/enterprise/enterprise-radar";

const TEMP_VARIANT: Record<string, "destructive" | "warning" | "secondary"> = {
  热: "destructive",
  温: "warning",
  冷: "secondary",
};

const SCENE_LABEL: Record<string, string> = {
  opening: "开场",
  sellingPoint: "卖点",
  objection: "异议",
  pricing: "议价",
  renewal: "续费",
};

const avg = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);

/**
 * 通话页顶部「客户背景」面板 —— 复用通话前简报数据 + 企业画像快照,
 * 让销售一进门就有上下文。
 * 客户身份 + 商机阶段 + 当前模型/余额/到期 + 风险 + 用量趋势 + AI 预判 + 随身话术 + 企业快照。
 */
export function CustomerProfilePanel({
  briefing,
  enterpriseInfo,
  customerId,
}: {
  briefing: Briefing;
  enterpriseInfo?: EnterpriseInfo;
  customerId: string;
}) {
  const { customer, usage, recommendations, scripts } = briefing;
  const [showScripts, setShowScripts] = React.useState(false);
  const [history, setHistory] = React.useState<CallSummary[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  // 沟通历史(历次通话小结,跟进时间线)—— 走 BFF 直连后端,不受 mock 影响
  React.useEffect(() => {
    getCallSummaries(customerId).then(setHistory).catch(() => {});
  }, [customerId]);

  const values = usage.map((u) => u.value);
  // 用近半段 vs 前半段均值算趋势,比首尾对比更稳
  const mid = Math.floor(values.length / 2);
  const prior = avg(values.slice(0, mid));
  const trend = prior > 0 ? Math.round((avg(values.slice(mid)) / prior - 1) * 100) : 0;
  const topRec = recommendations[0];

  return (
    <Card className="border-primary/30 bg-primary/[0.02]">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <Lightbulb className="h-3.5 w-3.5" />
          通话前简报 · 客户背景
        </div>

        {/* 客户身份 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-base font-semibold">{customer.name}</span>
          <OpportunityTag stage={customer.stage} />
          <span className="text-sm text-muted-foreground">
            {customer.industry} · 联系人 {customer.contact} · 在用{" "}
            {customer.currentModel} / {customer.currentPlan}
          </span>
        </div>

        {/* 关键事实 + 用量趋势 */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            <Fact icon={<Wallet className="h-3.5 w-3.5" />} label="余额" value={formatCNY(customer.balance)} />
            <Fact icon={<CalendarClock className="h-3.5 w-3.5" />} label="到期" value={customer.expireAt} />
            <Fact icon={<AlertTriangle className="h-3.5 w-3.5" />} label="近30天限流" value={`${customer.rateLimitHits} 次`} warn={customer.rateLimitHits > 0} />
            <Fact icon={<Bug className="h-3.5 w-3.5" />} label="近30天报错" value={`${customer.errorCount} 次`} warn={customer.errorCount > 0} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-28">
              <Sparkline data={values} height={36} />
            </div>
            <div className="text-xs leading-tight">
              <div
                className={cn(
                  "flex items-center gap-0.5 font-semibold",
                  trend >= 0 ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {trend >= 0 ? `↑${trend}%` : `↓${Math.abs(trend)}%`}
              </div>
              <div className="text-muted-foreground">近 6 月用量</div>
            </div>
          </div>
        </div>

        {/* AI 预判商机 */}
        {topRec && (
          <div className="flex flex-wrap items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm">
            <Badge variant="default" className="shrink-0">
              AI 预判
            </Badge>
            <span className="font-medium">{topRec.title}</span>
            <span className="text-muted-foreground">
              报价 {formatCNY(topRec.quoteRange[0])} ~ {formatCNY(topRec.quoteRange[1])}
            </span>
          </div>
        )}

        {/* 企业画像卡片: 策略提示 + 雷达图 */}
        {enterpriseInfo && (
          <EnterpriseBriefCard info={enterpriseInfo} />
        )}

        {/* 随身话术(折叠) */}
        <div>
          <button
            type="button"
            onClick={() => setShowScripts((v) => !v)}
            className="flex w-full items-center gap-2 text-left text-sm"
          >
            <span className="shrink-0 font-medium">📑 随身话术（{scripts.length}）</span>
            <div className="flex flex-wrap gap-1">
              {scripts.map((s) => (
                <Badge key={s.id} variant="outline" className="text-[11px]">
                  {SCENE_LABEL[s.scene] ?? s.scene}·{s.title}
                </Badge>
              ))}
            </div>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                showScripts && "rotate-180"
              )}
            />
          </button>
          {showScripts && (
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {scripts.map((s) => (
                <TalkScriptCard key={s.id} script={s} />
              ))}
            </div>
          )}
        </div>

        {/* 沟通历史(历次通话小结,跟进时间线) */}
        {history.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="flex w-full items-center gap-2 text-left text-sm"
            >
              <History className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="shrink-0 font-medium">
                沟通历史（{history.length}）
              </span>
              <span className="truncate text-xs text-muted-foreground">
                最近 {history[0].createdAt} · {history[0].temperature}意向
              </span>
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  showHistory && "rotate-180"
                )}
              />
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2">
                {history.map((h) => {
                  const key = h.id ?? h.createdAt;
                  const open = openId === key;
                  return (
                    <div
                      key={key}
                      className="overflow-hidden rounded-md border bg-background text-xs"
                    >
                      {/* 折叠态:一行摘要 */}
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : key)}
                        className="flex w-full items-center gap-2 p-2.5 text-left"
                      >
                        <span className="shrink-0 text-muted-foreground">
                          {h.createdAt}
                        </span>
                        <Badge
                          variant={TEMP_VARIANT[h.temperature] ?? "secondary"}
                          className="shrink-0 text-[10px]"
                        >
                          {h.temperature}意向
                        </Badge>
                        <span className="truncate">{h.demand}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-180"
                          )}
                        />
                      </button>
                      {/* 展开态:完整记录 */}
                      {open && (
                        <div className="space-y-1.5 border-t px-2.5 py-2 text-muted-foreground">
                          <HistField label="客户诉求" value={h.demand} />
                          <HistField label="意图与异议" value={h.intents} />
                          <HistField label="推荐与报价" value={h.recommendation} />
                          {h.nextSteps.length > 0 && (
                            <HistList label="下一步跟进" items={h.nextSteps} />
                          )}
                          {h.scripts.length > 0 && (
                            <HistList label="可沉淀话术" items={h.scripts} />
                          )}
                          {h.turns && h.turns.length > 0 && (
                            <details className="rounded border bg-muted/30 p-1.5">
                              <summary className="cursor-pointer font-medium text-foreground">
                                通话回放（{h.turns.length} 轮）
                              </summary>
                              <div className="mt-1.5 space-y-1.5">
                                {h.turns.map((t, i) => (
                                  <div
                                    key={i}
                                    className="border-l-2 border-primary/30 pl-2"
                                  >
                                    <p>
                                      <span className="font-medium text-foreground">
                                        客户:
                                      </span>{" "}
                                      {t.customerSaid}
                                    </p>
                                    {t.recommendation && (
                                      <p className="font-medium text-primary">
                                        推荐:{t.recommendation}
                                      </p>
                                    )}
                                    {t.script && (
                                      <p>话术:{t.script}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 企业画像卡片 — 策略提示(左) + 雷达图(右),通话中供销售快速了解企业画像。
 */
function EnterpriseBriefCard({ info }: { info: EnterpriseInfo }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-sm"
      >
        <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <span className="shrink-0 font-medium">企业画像</span>
        {info.risks.length > 0 && (
          <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-300">
            <AlertTriangle className="h-2.5 w-2.5" />
            {info.risks.length} 项风险
          </Badge>
        )}
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {info.profile.legalPerson} · {info.profile.registeredCapital}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <StrategyInsights info={info} />
          <Card>
            <CardContent className="flex items-center justify-center p-3">
              <EnterpriseRadarCard info={info} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function HistField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="font-medium text-foreground">{label}:</span> {value}
    </p>
  );
}

function HistList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="font-medium text-foreground">{label}:</p>
      <ul className="list-disc space-y-0.5 pl-4">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={cn("text-sm font-semibold tabular-nums", warn && "text-amber-600")}>
        {value}
      </div>
    </div>
  );
}
