"use client";

import * as React from "react";
import { ChevronDown, Check, Save, Mic, Bot } from "lucide-react";

import type { AsrModel, Model, SystemModelConfig } from "@/lib/types";
import {
  CAPABILITY_SLOTS,
  type CapabilitySlot,
} from "@/lib/demo/system-models";
import { saveSystemModels } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Option {
  id: string;
  name: string;
  vendor: string;
  meta?: string;
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
  const [bindings, setBindings] = React.useState(config.bindings);
  const [saved, setSaved] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const chatOptions: Option[] = chatModels.map((m) => ({
    id: m.id,
    name: m.name,
    vendor: m.vendor,
    meta: `能力 ${m.capabilityScore} · TTFT ${m.ttftMs}ms`,
  }));
  const asrOptions: Option[] = asrModels.map((m) => ({
    id: m.id,
    name: m.name,
    vendor: m.vendor,
    meta: m.latencyMs ? `首字 ${m.latencyMs}ms` : undefined,
  }));

  function optionsFor(slot: CapabilitySlot): Option[] {
    return slot.kind === "asr" ? asrOptions : chatOptions;
  }
  function optionName(slot: CapabilitySlot, id: string) {
    return optionsFor(slot).find((o) => o.id === id)?.name ?? id;
  }

  function pick(slotKey: CapabilitySlot["key"], id: string) {
    setBindings((b) => ({ ...b, [slotKey]: id }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await saveSystemModels({ ...config, bindings });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="space-y-4">
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
        {saved ? (
          <span className="text-sm text-muted-foreground">配置已是最新</span>
        ) : (
          <span className="text-sm text-warning">有未保存的更改</span>
        )}
        <Button onClick={handleSave} disabled={saved || saving} className={cn(saving && "opacity-70")}>
          <Save className="h-4 w-4" />
          {saving ? "保存中…" : "保存配置"}
        </Button>
      </div>
    </div>
  );
}
