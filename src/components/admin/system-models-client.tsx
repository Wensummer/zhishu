"use client";

import * as React from "react";
import {
  ChevronDown,
  Check,
  Save,
  Mic,
  Bot,
  Plus,
  CheckCircle2,
  MessageSquareText,
  RotateCcw,
} from "lucide-react";

import type { AsrModel, Model, SystemModelConfig } from "@/lib/types";
import {
  CAPABILITY_SLOTS,
  type CapabilitySlot,
} from "@/lib/demo/system-models";
import {
  saveSystemModels,
  getSystemPrompts,
  saveSystemPrompts,
  type SystemPrompts,
} from "@/lib/api";
import { cn } from "@/lib/utils";
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
  // 各能力位系统提示词:挂载时从后端拉取(键=能力位 key)。saved=已生效值的副本,用于"恢复默认"判断。
  const [prompts, setPrompts] = React.useState<SystemPrompts>({});
  const [savedPrompts, setSavedPrompts] = React.useState<SystemPrompts>({});
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const counter = React.useRef(0);

  React.useEffect(() => {
    getSystemPrompts()
      .then((p) => {
        setPrompts(p);
        setSavedPrompts(p);
      })
      .catch(() => {});
  }, []);

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

  function editPrompt(slotKey: string, text: string) {
    setPrompts((p) => ({ ...p, [slotKey]: text }));
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
    // 绑定走 saveSystemModels(mock 下仅前端);提示词走 BFF 真正落库并返回生效值
    const [, effective] = await Promise.all([
      saveSystemModels({ ...config, bindings }),
      saveSystemPrompts(prompts).catch(() => prompts),
    ]);
    setPrompts(effective);
    setSavedPrompts(effective);
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
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                </div>

                {/* 系统提示词:仅 LLM 位有(绑能力位,不绑模型) */}
                {slot.kind === "chat" && (
                  <PromptEditor
                    open={expanded === slot.key}
                    onToggle={() =>
                      setExpanded((k) => (k === slot.key ? null : slot.key))
                    }
                    value={prompts[slot.key] ?? ""}
                    dirty={(prompts[slot.key] ?? "") !== (savedPrompts[slot.key] ?? "")}
                    wired={slot.key === "chatbot"}
                    onChange={(t) => editPrompt(slot.key, t)}
                  />
                )}
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

function PromptEditor({
  open,
  onToggle,
  value,
  dirty,
  wired,
  onChange,
}: {
  open: boolean;
  onToggle: () => void;
  value: string;
  dirty: boolean;
  wired: boolean;
  onChange: (text: string) => void;
}) {
  return (
    <div className="rounded-md border bg-muted/30">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm"
      >
        <MessageSquareText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">系统提示词</span>
        <Badge
          variant={wired ? "success" : "secondary"}
          className="font-normal"
        >
          {wired ? "已生效" : "待接入"}
        </Badge>
        {dirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-warning" title="有未保存的改动" />
        )}
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="space-y-2 border-t p-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full resize-y rounded-md border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="该能力位的系统提示词…"
          />
          <p className="text-xs text-muted-foreground">
            {wired
              ? "提示词绑定「能力位」而非模型——换模型不丢提示词。保存后答疑 Chatbot 立即按新提示词作答。"
              : "默认值已就位,可编辑并落库;该能力位接入后即按此提示词生效。"}
            {" "}
            {value.length} 字
          </p>
        </div>
      )}
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
