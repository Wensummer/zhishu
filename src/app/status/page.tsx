import { formatPercent } from "@/lib/utils";
import { getModels, getAnnouncements } from "@/lib/api";
import { modelHealth } from "@/lib/demo/models";
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

/** P1-6 可用性监控状态页。 */
export default async function StatusPage() {
  const [models, announcements] = await Promise.all([
    getModels(),
    getAnnouncements(),
  ]);
  return (
    <>
      <PageHeader
        title="可用性监控状态页"
        description="模型晴雨表、分模型实时指标与趋势、调价与故障公告 —— 对外可展示的信任资产。"
      />

      <HealthBarometer models={models} />

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
              {models.map((m, i) => {
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
          <AnnouncementTimeline items={announcements} />
        </CardContent>
      </Card>
    </>
  );
}
