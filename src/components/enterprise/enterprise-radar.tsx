"use client";

import * as React from "react";
import type { EnterpriseInfo } from "@/lib/types";

/**
 * 企业五维雷达图 — 纯 SVG 实现,无外部依赖。
 *
 * 五个维度针对本项目(模型选型+营销赋能)场景设计:
 *   技术密集度 · 资金充裕度 · 业务扩张力 · 信用健康度 · 决策复杂度
 * 每个维度归一化为 0~100 分,画成五边形。
 */

interface RadarMetric {
  key: string;
  label: string;
  score: number; // 0–100
  description: string;
}

/** 从 EnterpriseInfo 计算五个维度的分数。 */
function computeRadarScores(info: EnterpriseInfo): RadarMetric[] {
  const patentCount = info.ipr.filter(i => i.type === "patent" || i.type === "copyright").length;
  const hasHighTech = info.honors.some(h => h.name.includes("高新技术"));
  const techScore = Math.min(100, patentCount * 18 + (hasHighTech ? 15 : 0) + 10);

  const fundingAmounts = info.funding.map(f => {
    const n = parseFloat(f.amount.replace(/[亿元]/g, m => m === "亿" ? "10000" : ""));
    return isNaN(n) ? 0 : n;
  });
  const latestFunding = fundingAmounts[fundingAmounts.length - 1] || 0;
  const regCap = parseFloat(info.profile.registeredCapital.replace(/[亿元]/g, m => m === "亿" ? "10000" : ""));
  const fundingScore = Math.min(100, (latestFunding / 2000) * 30 + (isNaN(regCap) ? 0 : regCap / 200) * 25 + info.funding.length * 8 + 10);

  const recentBids = info.bids.filter(b => b.publishDate >= "2026-01-01").length;
  const positiveNews = info.news.filter(n => n.sentiment === "positive").length;
  const branchScore = Math.min(100, recentBids * 18 + info.branches.length * 12 + positiveNews * 10 + 15);

  const highRisk = info.risks.filter(r => r.type === "失信被执行" || r.type === "限制高消费").length;
  const normalRisk = info.risks.length - highRisk;
  const creditScore = Math.max(0, 100 - highRisk * 40 - normalRisk * 15);

  const personCount = info.personnel.length;
  const shareholderCount = info.shareholders.length;
  const decisionScore = Math.min(100, personCount * 12 + shareholderCount * 8 + info.branches.length * 10 + 10);

  return [
    { key: "tech", label: "技术密集度", score: Math.round(techScore), description: `专利/软著 ${patentCount} 项${hasHighTech ? " · 国家高新技术企业" : ""}` },
    { key: "funding", label: "资金充裕度", score: Math.round(fundingScore), description: `最新融资 ${info.funding.length ? info.funding[info.funding.length - 1].amount : "无"} · 注册资本 ${info.profile.registeredCapital}` },
    { key: "growth", label: "业务扩张力", score: Math.round(branchScore), description: `近半年招标 ${recentBids} 项 · 子公司 ${info.branches.length} 家 · 正面舆情 ${positiveNews} 条` },
    { key: "credit", label: "信用健康度", score: Math.round(creditScore), description: info.risks.length ? `风险记录 ${info.risks.length} 条` : "暂无风险记录" },
    { key: "decision", label: "决策复杂度", score: Math.round(decisionScore), description: `主要人员 ${personCount} 人 · 股东 ${shareholderCount} 方` },
  ];
}

// ============ SVG 雷达图 ============

const SIDES = 5;
const CX = 170;
const CY = 130;
const RADIUS = 85;
const DOT_RADIUS = 4;
const DECORATION_CIRCLES = [0.25, 0.5, 0.75, 1.0];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function RadarChart({ metrics }: { metrics: RadarMetric[] }) {
  if (metrics.length !== SIDES) return null;

  const stepAngle = 360 / SIDES;

  const gridPaths = DECORATION_CIRCLES.map(ratio => {
    const pts = Array.from({ length: SIDES + 1 }, (_, i) =>
      polarToCartesian(CX, CY, RADIUS * ratio, stepAngle * i)
    );
    return pts.map((p, j) => `${j === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  });

  const dataPts = metrics.map((m, i) =>
    polarToCartesian(CX, CY, (m.score / 100) * RADIUS, stepAngle * i)
  );
  const dataPath = dataPts.map((p, j) => `${j === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  const vertices = Array.from({ length: SIDES }, (_, i) =>
    polarToCartesian(CX, CY, RADIUS, stepAngle * i)
  );

  // 标签位置: 顶点外扩
  const labelPositions = metrics.map((_, i) =>
    polarToCartesian(CX, CY, RADIUS + 5, stepAngle * i)
  );

  return (
    <svg width="360" height="280" viewBox="0 0 360 280" className="shrink-0">
      {/* 网格 */}
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
      ))}
      {/* 轴线 */}
      {vertices.map((p, i) => (
        <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.8" />
      ))}
      {/* 数据区域 */}
      <path d={dataPath} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
      {/* 数据点 */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={DOT_RADIUS} fill="hsl(var(--primary))" />
      ))}

      {/* 各角顶点外: 标签 */}
      {metrics.map((m, i) => {
        const lp = labelPositions[i];
        const isLeft = lp.x < CX;
        const isTop = lp.y < CY;
        const anchor: "end" | "start" = isLeft ? "end" : "start";
        const dx = isLeft ? "-6" : "6";
        const dy = isTop ? "-4" : "12";
        return (
          <text key={m.key} x={lp.x} y={lp.y} dx={dx} dy={dy} textAnchor={anchor}
            fontSize="12" fill="hsl(var(--foreground) / 0.8)" className="pointer-events-none select-none font-medium">
            {m.label}
          </text>
        );
      })}

      {/* 数据点上内缩: 数值 */}
      {metrics.map((m, i) => {
        const inward = polarToCartesian(CX, CY, Math.max((m.score / 100) * RADIUS - 16, 8), stepAngle * i);
        return (
          <text key={`v-${m.key}`} x={inward.x} y={inward.y} dx={0} dy={4}
            textAnchor="middle" fontSize="14" fontWeight="700"
            fill="hsl(var(--primary))" className="pointer-events-none select-none">
            {m.score}
          </text>
        );
      })}
    </svg>
  );
}

// ============ 雷达卡片 ============

export function EnterpriseRadarCard({ info }: { info: EnterpriseInfo }) {
  const metrics = computeRadarScores(info);
  return (
    <div className="flex flex-col items-center">
      <RadarChart metrics={metrics} />
    </div>
  );
}
