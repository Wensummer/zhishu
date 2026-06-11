"use client";

import * as React from "react";
import { ChevronDown, Check, Save, Mic, Bot, Plus, CheckCircle2 } from "lucide-react";

import type { AsrModel, Model, SystemModelConfig } from "@/lib/types";
import {
  CAPABILITY_SLOTS,
  type CapabilitySlot,
} from "@/lib/demo/system-models";
import { saveSystemModels } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface Option {
  id: string;
  name: string;
  vendor: string;
  meta?: string;
}

function chatMeta(m: Model): string {
  const parts = [`能力 ${m.capabilityScore}`];
  if (m.ttftMs) parts.push(`TTFT ${m.ttftMs}ms`);
  return parts.join(" · ");
}

export function SystemModelsClient({
  config,
  chatModels,
  asrModels,
}: {
  config: SystemModelConfig;
  chatModels: Model[];
  asrModels: AsrModel[];
}) {
  // 候选列表放本地状态,支持「新增模型」(演示;真持久化由后端 POST 落库)
  const [chatList, setChatList] = React.useState<Model[]>(chatModels);
  const [asrList, setAsrList] = React.useState<AsrModel[]>(asrModels);
  const [bindings, setBindings] = React.useState(config.bindings);
  const [saved, setSaved] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const counter = React.useRef(0);

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const chatOptions: Option[] = chatList.map((m) => ({
    id: m.id,
    name: m.name,
    vendor: m.vendor,
    meta: chatMeta(m),
  }));
  const asrOptions: Option[] = asrList.map((m) => ({
    id: m.id,
    name: m.name,
    vendor: m.vendor,
    meta: m.latencyMs ? `首字 ${m.latencyMs}ms` : undefined,
  }));

  const optionsFor = (slot: CapabilitySlot) =>
    slot.kind === "asr" ? asrOptions : chatOptions;
  const optionName = (slot: CapabilitySlot, id: string) =>
    optionsFor(slot).find((o) => o.id === id)?.name ?? id;

  function pick(slotKey: CapabilitySlot["key"], id: string) {
    setBindings((b) => ({ ...b, [slotKey]: id }));
    setSaved(false);
  }

  function addModel(input: {
    kind: "asr" | "chat";
    name: string;
    vendor: string;
    perf: string;
  }) {
    counter.current += 1;
    const id = `custom-${input.kind}-${counter.current}`;
    if (input.kind === "asr") {
      setAsrList((l) => [
        ...l,
        {
          id,
          name: input.name,
          vendor: input.vendor,
          filed: true,
          realtime: true,
          latencyMs: Number(input.perf) || undefined,
        },
      ]);
    } else {
      setChatList((l) => [
        ...l,
        {
          id,
          name: input.name,
          vendor: input.vendor,
          capabilityTier: "A",
          capabilityScore: Number(input.perf) || 85,
          priceInputPer1k: 0,
          priceOutputPer1k: 0,
          cacheDiscount: 0,
          ttftMs: 0,
          tpotMs: 0,
          availability: 0.99,
          channelPurity: 1,
          useCases: [],
          filed: true,
        },
      ]);
    }
    setSaved(false);
    setDialogOpen(false);
  }

  async function handleSave() {
    setSaving(true);
    await saveSystemModels({ ...config, bindings });
    setSaving(false);
    setSaved(true);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          新增模型
        </Button>
      </div>

      <div className="space-y-3">
        {CAPABILITY_SLOTS.map((slot) => {
          const options = optionsFor(slot);
          const current = bindings[slot.key];
          return (
            <Card key={slot.key}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {slot.kind === "asr" ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{slot.label}</span>
                      <Badge variant="outline" className="font-normal">
                        {slot.kind === "asr" ? "语音模型" : "对话模型"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{slot.desc}</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[14rem] justify-between">
                      {optionName(slot, current)}
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    {options.map((o) => (
                      <DropdownMenuItem
                        key={o.id}
                        onClick={() => pick(slot.key, o.id)}
                        className="flex-col items-start gap-0.5"
                      >
                        <span className="flex w-full items-center justify-between">
                          <span className="font-medium">{o.name}</span>
                          {o.id === current && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {o.vendor}
                          {o.meta ? ` · ${o.meta}` : ""}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3">
        {flash ? (
          <span className="flex items-center gap-1 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            已保存
          </span>
        ) : saved ? (
          <span className="text-sm text-muted-foreground">配置已是最新</span>
        ) : (
          <span className="text-sm text-warning">有未保存的更改</span>
        )}
        <Button onClick={handleSave} disabled={saved || saving}>
          <Save className="h-4 w-4" />
          {saving ? "保存中…" : "保存配置"}
        </Button>
      </div>

      <AddModelDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addModel} />
    </div>
  );
}

function AddModelDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (input: { kind: "asr" | "chat"; name: string; vendor: string; perf: string }) => void;
}) {
  const [kind, setKind] = React.useState<"asr" | "chat">("asr");
  const [name, setName] = React.useState("");
  const [vendor, setVendor] = React.useState("");
  const [perf, setPerf] = React.useState("");

  // 打开时重置
  React.useEffect(() => {
    if (open) {
      setKind("asr");
      setName("");
      setVendor("");
      setPerf("");
    }
  }, [open]);

  const valid = name.trim() && vendor.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增模型</DialogTitle>
          <DialogDescription>
            加入候选后即可在各能力位选用。演示阶段保存在本地;接后端后由 POST 落库到模型注册表。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">类型</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={kind === "asr" ? "default" : "outline"}
                size="sm"
                onClick={() => setKind("asr")}
                className="flex-1"
              >
                <Mic className="h-4 w-4" />
                语音模型
              </Button>
              <Button
                type="button"
                variant={kind === "chat" ? "default" : "outline"}
                size="sm"
                onClick={() => setKind("chat")}
                className="flex-1"
              >
                <Bot className="h-4 w-4" />
                对话模型
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">模型名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={kind === "asr" ? "如:天翼云方言转写" : "如:通义千问-Turbo"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">厂商</label>
            <Input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="如:天翼云 / 阿里云"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {kind === "asr" ? "参考首字延迟(ms,可选)" : "能力分(0-100,可选)"}
            </label>
            <Input
              type="number"
              value={perf}
              onChange={(e) => setPerf(e.target.value)}
              placeholder={kind === "asr" ? "如:300" : "如:88"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            disabled={!valid}
            onClick={() => onAdd({ kind, name: name.trim(), vendor: vendor.trim(), perf })}
          >
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
