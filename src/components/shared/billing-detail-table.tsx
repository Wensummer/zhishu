"use client";

import { useCallback, useMemo, useState } from "react";
import { Filter } from "lucide-react";

import type { BillingRecord } from "@/lib/types";
import { formatCNY, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  records: BillingRecord[];
}

export function BillingDetailTable({ records }: Props) {
  const [modelFilter, setModelFilter] = useState("all");
  const [apiKeyFilter, setApiKeyFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // 提取可用选项
  const modelOptions = useMemo(() => {
    const set = new Set(records.map((r) => r.model));
    return Array.from(set).sort();
  }, [records]);

  const apiKeyOptions = useMemo(() => {
    const set = new Set(records.map((r) => r.apiKeyName));
    return Array.from(set).sort();
  }, [records]);

  // 过滤逻辑
  const filtered = useMemo(() => {
    let list = [...records];

    if (modelFilter !== "all") {
      list = list.filter((r) => r.model === modelFilter);
    }
    if (apiKeyFilter !== "all") {
      list = list.filter((r) => r.apiKeyName === apiKeyFilter);
    }
    if (dateRange !== "all") {
      const now = new Date();
      let cutoff: Date;
      switch (dateRange) {
        case "7d":
          cutoff = new Date(now.setDate(now.getDate() - 7));
          break;
        case "30d":
          cutoff = new Date(now.setDate(now.getDate() - 30));
          break;
        case "90d":
          cutoff = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          cutoff = new Date(0);
      }
      list = list.filter((r) => new Date(r.date) >= cutoff);
    }

    // 按日期倒序
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [records, modelFilter, apiKeyFilter, dateRange]);

  // 汇总
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        tokens: acc.tokens + r.tokens,
        amount: acc.amount + r.amount,
      }),
      { tokens: 0, amount: 0 }
    );
  }, [filtered]);

  const resetFilters = useCallback(() => {
    setModelFilter("all");
    setApiKeyFilter("all");
    setDateRange("all");
  }, []);

  const hasActiveFilters = modelFilter !== "all" || apiKeyFilter !== "all" || dateRange !== "all";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">计费明细</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1 text-muted-foreground"
          >
            <Filter className="h-4 w-4" />
            筛选
            {hasActiveFilters && (
              <span className="flex h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">筛选条件:</div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="7d">近 7 天</SelectItem>
                <SelectItem value="30d">近 30 天</SelectItem>
                <SelectItem value="90d">近 90 天</SelectItem>
              </SelectContent>
            </Select>

            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部模型</SelectItem>
                {modelOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={apiKeyFilter} onValueChange={setApiKeyFilter}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="API Key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部 Key</SelectItem>
                {apiKeyOptions.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetFilters}>
                重置
              </Button>
            )}

            <div className="ml-auto text-xs text-muted-foreground">
              共 {filtered.length} 条记录
            </div>
          </div>
        )}

        <div className="mb-3 flex gap-4 text-sm">
          <span>
            总消费: <strong className="tabular-nums">{formatCNY(totals.amount, 2)}</strong>
          </span>
          <span className="text-muted-foreground">|</span>
          <span>
            总 Token: <strong className="tabular-nums">{formatNumber(totals.tokens)}</strong>
          </span>
        </div>

        <div className="max-h-[480px] overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead className="text-right">输入 Token</TableHead>
                <TableHead className="text-right">输出 Token</TableHead>
                <TableHead className="text-right">总 Token</TableHead>
                <TableHead className="text-right">单价(元/千)</TableHead>
                <TableHead className="text-right">金额(元)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    暂无计费记录
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-muted-foreground">{b.date}</TableCell>
                    <TableCell>{b.model}</TableCell>
                    <TableCell className="text-muted-foreground">{b.apiKeyName}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(b.inputTokens)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(b.outputTokens)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(b.tokens)}</TableCell>
                    <TableCell className="text-right tabular-nums">{b.unitPrice.toFixed(4)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCNY(b.amount, 2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
