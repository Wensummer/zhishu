"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ChevronRight, Globe } from "lucide-react";

import { formatCNY } from "@/lib/utils";
import type { Customer, OpportunityStage } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  OpportunityTag,
  STAGE_META,
} from "@/components/workbench/opportunity-tag";

const STAGE_FILTERS: (OpportunityStage | "all")[] = [
  "all",
  "renew",
  "upgrade",
  "expand",
  "silent",
  "newLead",
];

/** 客户/商机列表(含搜索 + 商机阶段筛选)。 */
export function CustomerTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = React.useState("");
  const [stage, setStage] = React.useState<OpportunityStage | "all">("all");

  const rows = customers.filter((c) => {
    const matchQuery =
      !query ||
      c.name.includes(query) ||
      c.industry.includes(query);
    const matchStage = stage === "all" || c.stage === stage;
    return matchQuery && matchStage;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索客户名 / 行业"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STAGE_FILTERS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={stage === s ? "default" : "outline"}
              onClick={() => setStage(s)}
            >
              {s === "all" ? "全部" : STAGE_META[s].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客户</TableHead>
              <TableHead>行业</TableHead>
              <TableHead>在用 / 状态</TableHead>
              <TableHead className="text-right">月消费</TableHead>
              <TableHead>到期</TableHead>
              <TableHead>商机判断</TableHead>
              <TableHead>其他电信业务推荐</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  {c.contact && (
                    <div className="text-xs text-muted-foreground">
                      {c.contact}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.industry}
                </TableCell>
                <TableCell>
                  {c.isNew ? (
                    <Badge variant="outline">新客 · 无用量</Badge>
                  ) : (
                    <span className="text-sm">{c.currentModelId}</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.monthlySpend ? formatCNY(c.monthlySpend) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.expireAt ?? "—"}
                </TableCell>
                <TableCell>
                  <OpportunityTag stage={c.stage} />
                </TableCell>
                <TableCell>
                  {c.telecomProducts && c.telecomProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.telecomProducts.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className="gap-1 text-[10px]"
                        >
                          <Globe className="h-2.5 w-2.5" />
                          {p}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/workbench/briefing/${c.id}`}>
                      查看简报
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  没有匹配的客户
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
