"use client";

import * as React from "react";
import { ChevronDown, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { cn, formatPercent } from "@/lib/utils";
import type { Model } from "@/lib/types";
import { scoreModel } from "@/lib/recommendation/score";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EvidenceChainCard } from "@/components/evidence/evidence-chain-card";

type SortKey =
  | "score"
  | "capabilityScore"
  | "availability"
  | "priceInputPer1k"
  | "priceOutputPer1k"
  | "ttftMs"
  | "tpotMs"
  | "cacheDiscount";

const TIER_VARIANT: Record<
  Model["capabilityTier"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  S: "default",
  A: "success",
  B: "secondary",
  C: "outline",
};

interface Column {
  key: SortKey;
  label: string;
  /** 数值越小越好(价格、延迟),排序图标/默认方向用 */
  lowerBetter?: boolean;
  render: (m: Model, score: number) => React.ReactNode;
}

export function ModelComparisonTable({ models }: { models: Model[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("score");
  const [asc, setAsc] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);

  // 预计算综合分
  const scored = React.useMemo(
    () => models.map((m) => ({ model: m, score: scoreModel(m).score })),
    [models]
  );

  const columns: Column[] = [
    {
      key: "capabilityScore",
      label: "能力",
      render: (m) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={TIER_VARIANT[m.capabilityTier]}>
            {m.capabilityTier}
          </Badge>
          <span className="tabular-nums">{m.capabilityScore}</span>
        </div>
      ),
    },
    {
      key: "priceInputPer1k",
      label: "输入价",
      lowerBetter: true,
      render: (m) => <span className="tabular-nums">¥{m.priceInputPer1k}</span>,
    },
    {
      key: "priceOutputPer1k",
      label: "输出价",
      lowerBetter: true,
      render: (m) => (
        <span className="tabular-nums">¥{m.priceOutputPer1k}</span>
      ),
    },
    {
      key: "cacheDiscount",
      label: "缓存折扣",
      render: (m) => (
        <span className="tabular-nums">{formatPercent(m.cacheDiscount, 0)}</span>
      ),
    },
    {
      key: "availability",
      label: "可用率",
      render: (m) => (
        <span className="tabular-nums">{formatPercent(m.availability)}</span>
      ),
    },
    {
      key: "ttftMs",
      label: "TTFT",
      lowerBetter: true,
      render: (m) => <span className="tabular-nums">{m.ttftMs}ms</span>,
    },
    {
      key: "tpotMs",
      label: "TPOT",
      lowerBetter: true,
      render: (m) => <span className="tabular-nums">{m.tpotMs}ms</span>,
    },
  ];

  const sorted = [...scored].sort((a, b) => {
    const get = (x: typeof a) =>
      sortKey === "score" ? x.score : (x.model[sortKey] as number);
    const diff = get(a) - get(b);
    return asc ? diff : -diff;
  });

  function toggleSort(key: SortKey, lowerBetter?: boolean) {
    if (sortKey === key) {
      setAsc((v) => !v);
    } else {
      setSortKey(key);
      setAsc(!!lowerBetter); // 价格/延迟默认升序(小在前),其余降序
    }
  }

  function SortIcon({ active, lowerBetter }: { active: boolean; lowerBetter?: boolean }) {
    if (!active)
      return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    return asc ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
    void lowerBetter;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[12rem]">模型</TableHead>
            {columns.map((col) => (
              <TableHead key={col.key}>
                <button
                  type="button"
                  onClick={() => toggleSort(col.key, col.lowerBetter)}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  {col.label}
                  <SortIcon active={sortKey === col.key} lowerBetter={col.lowerBetter} />
                </button>
              </TableHead>
            ))}
            <TableHead>适配场景</TableHead>
            <TableHead className="text-right">
              <button
                type="button"
                onClick={() => toggleSort("score")}
                className="ml-auto flex items-center gap-1 hover:text-foreground"
              >
                综合分
                <SortIcon active={sortKey === "score"} />
              </button>
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(({ model: m, score }) => {
            const open = openId === m.id;
            return (
              <React.Fragment key={m.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setOpenId(open ? null : m.id)}
                >
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.vendor}
                    </div>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render(m, score)}</TableCell>
                  ))}
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.useCases.slice(0, 2).map((u) => (
                        <Badge key={u} variant="outline" className="font-normal">
                          {u}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold tabular-nums text-primary">
                      {score.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </TableCell>
                </TableRow>
                {open && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length + 4} className="bg-muted/20">
                      <EvidenceChainCard chain={scoreModel(m)} defaultOpen />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
