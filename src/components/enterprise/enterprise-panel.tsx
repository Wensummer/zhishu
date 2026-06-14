"use client";

import {
  Building2,
  UserCheck,
  Share2,
  GitBranch,
  Award,
  TrendingUp,
  AlertTriangle,
  Newspaper,
  Gavel,
  Copyright,
  ShieldCheck,
  Banknote,
  Phone,
  User,
  Lightbulb,
} from "lucide-react";

import type {
  EnterpriseInfo,
  EnterpriseKeyPersonnel,
  EnterpriseShareholder,
  EnterpriseController,
  EnterpriseBranch,
  EnterpriseHonor,
  EnterpriseFunding,
  EnterpriseNews,
  EnterpriseIPR,
  EnterpriseRiskItem,
  EnterpriseBid,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnterpriseRadarCard } from "@/components/enterprise/enterprise-radar";

// ============ 工商信息卡片(含联系人 + 联系方式) ============
export function EnterpriseProfileCard({
  profile,
}: {
  profile: EnterpriseInfo["profile"];
}) {
  const statusColor =
    profile.businessStatus === "存续"
      ? "bg-emerald-500/10 text-emerald-600"
      : profile.businessStatus === "注销"
        ? "bg-gray-500/10 text-gray-500"
        : "bg-amber-500/10 text-amber-600";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4 text-primary" />
          工商信息
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm lg:grid-cols-3">
        <InfoRow label="企业名称" value={profile.name} />
        <InfoRow label="统一社会信用代码" value={profile.creditCode} mono />
        <InfoRow label="法定代表人" value={profile.legalPerson} />
        <InfoRow label="注册资本" value={profile.registeredCapital} />
        <InfoRow label="成立日期" value={profile.establishDate} />
        <InfoRow
          label="经营状态"
          value={
            <Badge variant="secondary" className={`text-xs ${statusColor}`}>
              {profile.businessStatus}
            </Badge>
          }
        />
        {profile.contactPerson && (
          <InfoRow
            label={<span className="flex items-center gap-1"><User className="h-3 w-3" />联系人</span>}
            value={profile.contactPerson}
          />
        )}
        {profile.contactPhone && (
          <InfoRow
            label={<span className="flex items-center gap-1"><Phone className="h-3 w-3" />联系电话</span>}
            value={profile.contactPhone}
          />
        )}
        <div className="col-span-2 lg:col-span-3">
          <span className="text-xs text-muted-foreground">经营范围</span>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {profile.businessScope}
          </p>
        </div>
        <div className="col-span-2 lg:col-span-3">
          <span className="text-xs text-muted-foreground">注册地址</span>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {profile.address}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string | React.ReactNode;
  value: string | React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div
        className={`mt-0.5 font-medium ${mono ? "font-mono text-xs tracking-tight" : "text-sm"}`}
      >
        {value}
      </div>
    </div>
  );
}

// ============ 主要人员(决策链) ============
export function EnterprisePersonnelCard({
  personnel,
}: {
  personnel: EnterpriseKeyPersonnel[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-4 w-4 text-primary" />
          主要人员
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {personnel.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无主要人员信息</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {personnel.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {p.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ 股东信息 + 实际控制人 ============
export function EnterpriseShareholderCard({
  shareholders,
  controller,
}: {
  shareholders: EnterpriseShareholder[];
  controller?: EnterpriseController;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4 text-primary" />
          股东信息
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {controller && (
          <div className="rounded-md bg-primary/5 px-3 py-2">
            <span className="text-xs text-muted-foreground">实际控制人</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{controller.name}</span>
              <Badge variant="secondary" className="text-[10px]">
                控制比例 {controller.ratio}
              </Badge>
            </div>
            {controller.path && (
              <p className="text-xs text-muted-foreground">{controller.path}</p>
            )}
          </div>
        )}

        {shareholders.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无股东信息</p>
        ) : (
          <div className="space-y-1.5">
            {shareholders.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span className="font-medium">{s.name}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>出资 {s.amount}</span>
                  <span className="tabular-nums">{s.ratio}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============ 对外投资/分支机构 ============
export function EnterpriseBranchCard({
  branches,
}: {
  branches: EnterpriseBranch[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="h-4 w-4 text-primary" />
          对外投资 / 分支机构
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {branches.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无对外投资信息</p>
        ) : (
          branches.map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{b.name}</span>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>持股 {b.ratio}</span>
                  {b.amount !== "—" && <span>投资 {b.amount}</span>}
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`text-[10px] ${
                  b.businessStatus === "存续"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-gray-500/10 text-gray-600"
                }`}
              >
                {b.businessStatus}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============ 荣誉资质 ============
export function EnterpriseHonorCard({ honors }: { honors: EnterpriseHonor[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-amber-500" />
          荣誉资质（{honors.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {honors.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无荣誉资质记录</p>
        ) : (
          honors.map((h, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">{h.name}</span>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span>颁发机构: {h.issuer}</span>
                  <span>获评日期: {h.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============ 融资动态 ============
export function EnterpriseFundingCard({
  funding,
}: {
  funding: EnterpriseFunding[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="h-4 w-4 text-emerald-500" />
          融资动态（{funding.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {funding.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无融资记录</p>
        ) : (
          funding.map((f, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{f.round}</Badge>
                  <span className="text-sm font-medium">{f.amount}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span>日期: {f.date}</span>
                  <span>投资方: {f.investors}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============ 风险列表 ============
const RISK_TYPE_META: Record<string, { label: string; color: string }> = {
  "失信被执行": { label: "失信被执行", color: "bg-red-500/10 text-red-600" },
  "限制高消费": { label: "限制高消费", color: "bg-red-500/10 text-red-600" },
  "行政处罚": { label: "行政处罚", color: "bg-amber-500/10 text-amber-600" },
  "经营异常": { label: "经营异常", color: "bg-amber-500/10 text-amber-600" },
  "裁判文书": { label: "裁判文书", color: "bg-blue-500/10 text-blue-600" },
};

export function EnterpriseRiskList({ risks }: { risks: EnterpriseRiskItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className={`h-4 w-4 ${risks.length > 0 ? "text-amber-500" : "text-emerald-500"}`} />
          风险信息（{risks.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {risks.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>暂无风险记录，该企业信用状况良好</span>
          </div>
        ) : (
          risks.map((r, i) => {
            const meta = RISK_TYPE_META[r.type] ?? { label: r.type, color: "bg-gray-500/10 text-gray-600" };
            const colorClass = meta.color.includes("red") ? "text-red-500" : meta.color.includes("amber") ? "text-amber-500" : "text-blue-500";
            return (
              <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
                <Gavel className={`mt-0.5 h-4 w-4 shrink-0 ${colorClass}`} />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
                    <span className="text-sm font-medium">{r.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.detail}</p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>日期: {r.date}</span>
                    {r.department && <span>机关: {r.department}</span>}
                    {r.amount && <span>涉及金额: {r.amount}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ============ 新闻舆情(保持不变) ============
const SENTIMENT_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  positive: { label: "积极", color: "bg-emerald-500/10 text-emerald-600", icon: <TrendingUp className="h-3 w-3" /> },
  neutral: { label: "中性", color: "bg-gray-500/10 text-gray-600", icon: <TrendingUp className="h-3 w-3" /> },
  negative: { label: "消极", color: "bg-red-500/10 text-red-600", icon: <TrendingUp className="h-3 w-3" /> },
};

export function EnterpriseNewsList({ news }: { news: EnterpriseNews[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="h-4 w-4" />
          新闻舆情（{news.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无相关新闻舆情</p>
        ) : (
          news.map((n, i) => {
            const meta = SENTIMENT_META[n.sentiment];
            return (
              <div key={i} className="rounded-md border px-3 py-2 text-sm">
                <div className="mb-0.5 flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-snug">{n.title}</span>
                  <Badge variant="secondary" className={`flex shrink-0 items-center gap-1 text-[10px] ${meta.color}`}>
                    {meta.icon}{meta.label}
                  </Badge>
                </div>
                <p className="mb-0.5 text-xs leading-relaxed text-muted-foreground">{n.summary}</p>
                <span className="text-[11px] text-muted-foreground">{n.date}</span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ============ 知识产权(保持不变) ============
const IPR_META: Record<string, { label: string }> = {
  patent: { label: "专利" }, trademark: { label: "商标" }, copyright: { label: "软著" },
};

const IPR_STATUS_COLOR: Record<string, string> = {
  "授权": "bg-emerald-500/10 text-emerald-600", "注册": "bg-emerald-500/10 text-emerald-600",
  "登记": "bg-emerald-500/10 text-emerald-600", "实审": "bg-amber-500/10 text-amber-600",
};

export function EnterpriseIPRPanel({ ipr }: { ipr: EnterpriseIPR[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Copyright className="h-4 w-4 text-primary" />
          知识产权（{ipr.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {ipr.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无知识产权记录</p>
        ) : (
          ipr.map((item, i) => {
            const meta = IPR_META[item.type] ?? { label: item.type };
            const statusColor = IPR_STATUS_COLOR[item.status] ?? "bg-gray-500/10 text-gray-600";
            return (
              <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
                <Copyright className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                    <span className="text-sm font-medium">{item.name}</span>
                    <Badge variant="secondary" className={`text-[10px] ${statusColor}`}>{item.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>注册号: {item.regNo}</span>
                    <span>申请日: {item.applyDate}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ============ 招投标记录(保持不变) ============
export function EnterpriseBidList({ bids }: { bids: EnterpriseBid[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4" />
          招投标（{bids.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {bids.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无招投标记录</p>
        ) : (
          bids.map((b, i) => (
            <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">{b.title}</span>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                  <span>采购方: {b.buyer}</span>
                  <span>金额: {b.amount}</span>
                  <span>发布时间: {b.publishDate}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============ 整合面板(简报页使用) ============
export function EnterprisePanel({ info }: { info: EnterpriseInfo }) {
  const hasRisks = info.risks.length > 0;
  return (
    <div className="space-y-4">
      {/* 企业动态提示 + 雷达图(同行两个卡片) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StrategyInsights info={info} />
        <RadarInsights info={info} />
      </div>

      {/* 工商信息 + 主要人员 + 股东 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <EnterpriseProfileCard profile={info.profile} />
        <EnterprisePersonnelCard personnel={info.personnel} />
        <EnterpriseShareholderCard shareholders={info.shareholders} controller={info.controller} />
      </div>

      {/* 对外投资 + 荣誉资质 + 融资动态 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <EnterpriseBranchCard branches={info.branches} />
        <EnterpriseHonorCard honors={info.honors} />
        <EnterpriseFundingCard funding={info.funding} />
      </div>

      {/* 风险 + 新闻 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseRiskList risks={info.risks} />
        <EnterpriseNewsList news={info.news} />
      </div>

      {/* 知识产权 + 招投标 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseIPRPanel ipr={info.ipr} />
        <EnterpriseBidList bids={info.bids} />
      </div>
    </div>
  );
}

export function StrategyInsights({ info }: { info: EnterpriseInfo }) {
  const tips = buildStrategyTips(info);
  return (
    <Card className="h-full border-primary/30 bg-primary/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span>企业动态提示</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
          {tips}
        </ul>
      </CardContent>
    </Card>
  );
}

function RadarInsights({ info }: { info: EnterpriseInfo }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15 9 22 9 16 14 18 22 12 17 6 22 8 14 2 9 9 9 12 2" /></svg>
          企业五维评分
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center p-2">
        <EnterpriseRadarCard info={info} />
      </CardContent>
    </Card>
  );
}

function buildStrategyTips(info: EnterpriseInfo): React.ReactNode[] {
  const tips: React.ReactNode[] = [];

  // 融资健康度
  if (info.funding.length > 0) {
    const latest = info.funding[info.funding.length - 1];
    tips.push(<li key="fund" className="flex gap-2"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-500/10 text-center text-xs leading-5 text-emerald-600">$</span><span>近期完成<strong>{latest.round}</strong>（{latest.amount}），由<strong>{latest.investors}</strong>领投，企业资金充裕</span></li>);
  }

  // 分支机构 → 交叉销售
  if (info.branches.length >= 2) {
    tips.push(<li key="branch" className="flex gap-2"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-blue-500/10 text-center text-xs leading-5 text-blue-600">#</span><span>集团旗下有 <strong>{info.branches.length}</strong> 家子公司/分支机构，存在跨主体交叉销售空间</span></li>);
  }

  // 技术密集度 → 推荐策略
  const techIpr = info.ipr.filter(i => i.type === "patent" || i.type === "copyright").length;
  if (techIpr >= 3) {
    tips.push(<li key="tech" className="flex gap-2"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-purple-500/10 text-center text-xs leading-5 text-purple-600">AI</span><span>知识产权丰富（<strong>{techIpr}</strong> 项专利/软著），属技术密集型企业，适合推荐<strong>高能力模型与Agent增值服务</strong></span></li>);
  } else {
    tips.push(<li key="tech" className="flex gap-2"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-purple-500/10 text-center text-xs leading-5 text-purple-600">AI</span><span>技术密集度尚可，建议从<strong>性价比</strong>切入，先建立信任再引导升级</span></li>);
  }

  // 风险提示
  const highRisk = info.risks.filter(r => r.type === "失信被执行" || r.type === "限制高消费").length;
  if (highRisk > 0) {
    tips.push(<li key="risk" className="flex gap-2 text-amber-700"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-red-500/10 text-center text-xs leading-5 text-red-600">!</span><span className="font-medium">存在 {highRisk} 项严重风险，建议谨慎评估信用后决定是否先款后货</span></li>);
  } else if (info.risks.length > 0) {
    tips.push(<li key="risk" className="flex gap-2"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-amber-500/10 text-center text-xs leading-5 text-amber-600">i</span><span>存在 {info.risks.length} 条风险记录（均为一般性记录），可在通话中主动了解情况，展示关怀</span></li>);
  } else {
    tips.push(<li key="risk" className="flex gap-2"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-500/10 text-center text-xs leading-5 text-emerald-600">✓</span><span>暂无风险记录，<strong>信用状况良好</strong>，适合推进签约流程</span></li>);
  }

  // 招标 → 扩张信号
  const recentBids = info.bids.filter(b => b.publishDate >= "2026-01-01").length;
  if (recentBids >= 2) {
    tips.push(<li key="bid" className="flex gap-2"><span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-blue-500/10 text-center text-xs leading-5 text-blue-600">B</span><span>半年内中标 <strong>{recentBids}</strong> 个项目，业务扩张期，模型用量有望持续增长</span></li>);
  }

  return tips;
}
