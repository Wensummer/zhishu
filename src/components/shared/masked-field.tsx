"use client";

import * as React from "react";
import { Copy, Eye, EyeOff, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MaskedFieldProps {
  /** 脱敏展示值(前缀 + 尾段),例如 sk-zs-demo-…a1b2 */
  masked: string;
  /** 点击「显示」时展示的演示值(仍为假数据,绝非真实 Key) */
  revealDemo?: string;
}

/**
 * 密钥脱敏字段:默认脱敏,可临时显示演示值、可复制。
 * 红线:前端不存任何真实 API Key,此处全为脱敏假数据。
 */
export function MaskedField({ masked, revealDemo }: MaskedFieldProps) {
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const shown = revealed && revealDemo ? revealDemo : masked;

  function copy() {
    navigator.clipboard?.writeText(masked);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-md border bg-muted px-3 py-2 font-mono text-sm">
        {shown}
      </code>
      {revealDemo && (
        <Button
          variant="outline"
          size="icon"
          aria-label={revealed ? "隐藏" : "显示"}
          onClick={() => setRevealed((v) => !v)}
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      )}
      <Button variant="outline" size="icon" aria-label="复制" onClick={copy}>
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
