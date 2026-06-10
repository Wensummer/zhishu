import Link from "next/link";
import {
  ShieldCheck,
  ScanSearch,
  Megaphone,
  Headset,
  ArrowRight,
  X,
  Check,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VALUES = [
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "合规可信",
    desc: "只接天翼云已备案国产模型,数据不出境,渠道纯度可审计、可出证明。",
  },
  {
    icon: <ScanSearch className="h-5 w-5" />,
    title: "透明选型",
    desc: "每条推荐都给可核验证据链:公式分解 + 分项数值 + 来源与采集时间。",
  },
  {
    icon: <Megaphone className="h-5 w-5" />,
    title: "全链路营销",
    desc: "选型 → 售前简报 → 通话 copilot → 售后增值,贯穿同一客户经营动线。",
  },
  {
    icon: <Headset className="h-5 w-5" />,
    title: "企业级服务",
    desc: "合同锁价 + SLA + 7×24 客户经理体系 + 正规增值税发票、对公结算。",
  },
];

// 灰中转痛点对照表(outline 第 7 节,路演核心论证素材)
const PAIN_POINTS: { pain: string; ours: string }[] = [
  {
    pain: "跑路风险常态化:头部站点持续宕机被定性为软跑路,导航站滚动警示「请勿囤积」",
    ours: "央企主体、资金安全,预付无跑路风险",
  },
  {
    pain: "倍率随时跳变:受上游风控影响倍率从 1.5 跳 2.5,无预算确定性",
    ours: "合同锁价 + SLA 保障 + 调价公示制度",
  },
  {
    pain: "财税合规缺口:个人仅能开国外 Invoice,国内开票限对公且收 6% 手续费",
    ours: "正规增值税发票、对公结算,适配企业采购与预算流程",
  },
  {
    pain: "渠道掺假:官方渠道掺逆向、日志中出现非承诺模型,供给侧本身不合法",
    ours: "只接备案模型,渠道纯度可审计、可出具证明",
  },
  {
    pain: "服务上限低:OneMan 站长「需要睡觉,可用率受影响」,客服找不到人",
    ours: "7×24 企业级服务 + 客户经理体系",
  },
  {
    pain: "数据隐私无保障:QQ 邮箱注册、退款索要个人信息",
    ours: "数据不出境、脱敏、等保级权限控制与审计留痕",
  },
];

/** P2-8 平台落地页。 */
export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="space-y-5 py-4">
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          依托天翼云已备案国产大模型能力池
        </Badge>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
          智枢 · 懂客户、会选型、能经营的
          <span className="text-primary">合规大模型营销赋能平台</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          帮电信客户经理把合规模型 API 高效卖出去、用起来、续下去。与灰色中转站的核心切割:供给侧合法
          + 经营侧专业 —— 备案模型、渠道纯度、合同锁价、正规发票、7×24 服务、数据不出境。
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/">
              进入客户经理工作台
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/wizard">体验四问选型</Link>
          </Button>
        </div>
      </section>

      {/* 价值主张 */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <Card key={v.title}>
            <CardContent className="space-y-2 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                {v.icon}
              </span>
              <div className="font-semibold">{v.title}</div>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* 痛点对照表 */}
      <section className="space-y-3">
        <PageHeader
          title="为什么是国央企平台,而不是灰色中转?"
          description="每一条都有灰中转生态的真实乱象可引;合规可信,正是企业客户最缺、灰中转给不了的。"
        />
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">
                  <span className="flex items-center gap-1.5 text-destructive">
                    <X className="h-4 w-4" />
                    灰中转真实痛点
                  </span>
                </TableHead>
                <TableHead className="w-1/2">
                  <span className="flex items-center gap-1.5 text-success">
                    <Check className="h-4 w-4" />
                    智枢 · 国央企平台优势
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PAIN_POINTS.map((row) => (
                <TableRow key={row.pain}>
                  <TableCell className="text-muted-foreground">
                    {row.pain}
                  </TableCell>
                  <TableCell className="font-medium">{row.ours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 收尾 CTA */}
      <section>
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <div className="text-lg font-semibold">把数据摊开,把推荐讲清</div>
              <p className="text-sm text-primary-foreground/80">
                从一份通话前简报开始,看看可核验证据链如何赢得企业客户的信任。
              </p>
            </div>
            <Button asChild variant="secondary" size="lg">
              <Link href="/workbench/briefing/c-1024">
                查看示例简报
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
