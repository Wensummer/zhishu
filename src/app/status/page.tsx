import { formatPercent } from "@/lib/utils";
import type { Announcement } from "@/lib/types";
import { DEMO_MODELS, modelHealth } from "@/lib/demo/models";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkline } from "@/components/shared/sparkline";
import { HealthBarometer } from "@/components/status/health-barometer";
import { AnnouncementTimeline } from "@/components/status/announcement-timeline";

const HEALTH_BADGE = {
  ok: { label: "正常", variant: "success" as const },
  warn: { label: "波动", variant: "warning" as const },
  down: { label: "异常", variant: "destructive" as const },
};

// 近 7 天可用率序列(确定性生成,避免水合不一致)
const OFFSETS = [-0.3, -0.1, 0.1, 0, 0.2, -0.2, 0.05];
function availSeries(avail: number, seed: number): number[] {
  return OFFSETS.map(
    (o, d) => Math.round((avail * 100 + OFFSETS[(seed + d) % OFFSETS.length] + o) * 10) / 10
  );
}

// —— 临时演示公告(定页面长相用);Phase 后期改为经 lib/api 取数 ——
const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a-1",
    kind: "priceChange",
    title: "DeepSeek-V3 输出价下调 12%",
    body: "自 2026-06-15 起生效,提前 7 天公示。老客户合同锁价不受影响。",
    modelId: "deepseek-v3",
    publishedAt: "2026-06-08",
  },
  {
    id: "a-2",
    kind: "incident",
    title: "DeepSeek-R1 短时延迟升高",
    body: "06-06 14:20 ~ 15:05 TTFT 升高约 300ms,已扩容恢复,期间无请求失败。",
    modelId: "deepseek-r1",
    publishedAt: "2026-06-06",
    resolvedAt: "2026-06-06",
  },
  {
    id: "a-3",
    kind: "shelf",
    title: "新增上架 Kimi-128K 超长上下文",
    body: "适配长文档 / RAG 场景,已纳入横评与选型引擎。",
    modelId: "moonshot-128k",
    publishedAt: "2026-06-01",
  },
  {
    id: "a-4",
    kind: "maintenance",
    title: "文心一言-4.0 例行维护",
    body: "05-30 02:00 ~ 02:30 滚动维护,采用灰度切换,服务不中断。",
    modelId: "ernie-4",
    publishedAt: "2026-05-30",
    resolvedAt: "2026-05-30",
  },
];

/** P1-6 可用性监控状态页。 */
export default function StatusPage() {
  return (
    <>
      <PageHeader
        title="可用性监控状态页"
        description="模型晴雨表、分模型实时指标与趋势、调价与故障公告 —— 对外可展示的信任资产。"
      />

      <HealthBarometer models={DEMO_MODELS} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">分模型实时指标</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>可用率</TableHead>
                <TableHead>缓存命中(参考)</TableHead>
                <TableHead>TTFT</TableHead>
                <TableHead>TPOT</TableHead>
                <TableHead className="w-32">近 7 天可用率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_MODELS.map((m, i) => {
                const h = modelHealth(m);
                const badge = HEALTH_BADGE[h];
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.vendor}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatPercent(m.availability)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatPercent(m.cacheDiscount, 0)}
                    </TableCell>
                    <TableCell className="tabular-nums">{m.ttftMs}ms</TableCell>
                    <TableCell className="tabular-nums">{m.tpotMs}ms</TableCell>
                    <TableCell>
                      <Sparkline
                        data={availSeries(m.availability, i)}
                        height={28}
                        color={
                          h === "ok"
                            ? "hsl(var(--success))"
                            : h === "warn"
                              ? "hsl(var(--warning))"
                              : "hsl(var(--destructive))"
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            调价与故障公告 · 全程公示留痕
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <AnnouncementTimeline items={ANNOUNCEMENTS} />
        </CardContent>
      </Card>
    </>
  );
}
