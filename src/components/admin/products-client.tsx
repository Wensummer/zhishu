"use client";

import * as React from "react";
import { ChevronDown, Plus } from "lucide-react";

import type { Model } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShelfEntry {
  listed: boolean;
  tiers: string;
}

const DEFAULT_SHELF: Record<string, ShelfEntry> = {
  "qwen-max": { listed: true, tiers: "大客户 / 中小" },
  "qwen-plus": { listed: true, tiers: "全部" },
  "ernie-4": { listed: true, tiers: "大客户 / 金融" },
  "deepseek-v3": { listed: true, tiers: "全部" },
  "deepseek-r1": { listed: true, tiers: "大客户" },
  "glm-4": { listed: true, tiers: "中小 / toC" },
  "moonshot-128k": { listed: true, tiers: "大客户 / 中小" },
  "baichuan-4": { listed: false, tiers: "—" },
};

export function ProductsClient({ models }: { models: Model[] }) {
  const [shelf, setShelf] = React.useState<Record<string, ShelfEntry>>(() => {
    const init: Record<string, ShelfEntry> = {};
    for (const m of models) {
      init[m.id] = DEFAULT_SHELF[m.id] ?? { listed: true, tiers: "全部" };
    }
    return init;
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function toggle(id: string) {
    setShelf((s) => ({
      ...s,
      [id]: {
        listed: !s[id].listed,
        tiers: !s[id].listed && s[id].tiers === "—" ? "全部" : s[id].tiers,
      },
    }));
  }

  function listModel(id: string, tiers: string) {
    setShelf((s) => ({ ...s, [id]: { listed: true, tiers: tiers || "全部" } }));
    setDialogOpen(false);
  }

  const unlisted = models.filter((m) => !shelf[m.id]?.listed);

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          新增上架
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模型</TableHead>
                <TableHead>厂商</TableHead>
                <TableHead>能力档</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>面向分层</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((m) => {
                const s = shelf[m.id];
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.vendor}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.capabilityTier}</Badge>
                    </TableCell>
                    <TableCell>
                      {s.listed ? (
                        <Badge variant="success">已上架</Badge>
                      ) : (
                        <Badge variant="secondary">已下架</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.tiers}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggle(m.id)}>
                        {s.listed ? "下架" : "上架"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ListModelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unlisted={unlisted}
        onConfirm={listModel}
      />
    </>
  );
}

function ListModelDialog({
  open,
  onOpenChange,
  unlisted,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unlisted: Model[];
  onConfirm: (id: string, tiers: string) => void;
}) {
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [tiers, setTiers] = React.useState("全部");

  React.useEffect(() => {
    if (open) {
      setSelectedId(unlisted[0]?.id ?? "");
      setTiers("全部");
    }
  }, [open, unlisted]);

  const selected = unlisted.find((m) => m.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增上架</DialogTitle>
          <DialogDescription>
            选择一个未上架的模型并设置面向分层。演示阶段保存在本地;接后端后由 PUT/POST 落库。
          </DialogDescription>
        </DialogHeader>

        {unlisted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            所有模型均已上架。
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">选择模型</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selected ? `${selected.name} · ${selected.vendor}` : "请选择"}
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                  {unlisted.map((m) => (
                    <DropdownMenuItem key={m.id} onClick={() => setSelectedId(m.id)}>
                      {m.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {m.vendor}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">面向分层</label>
              <Input
                value={tiers}
                onChange={(e) => setTiers(e.target.value)}
                placeholder="如:大客户 / 中小 / 全部"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            disabled={!selectedId}
            onClick={() => onConfirm(selectedId, tiers)}
          >
            上架
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
