import {
  MessageSquare,
  Sparkles,
  ShieldAlert,
  BadgeDollarSign,
  RefreshCw,
} from "lucide-react";

import type { ScriptScene, TalkScript } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

const SCENE_META: Record<
  ScriptScene,
  { label: string; icon: React.ReactNode }
> = {
  opening: { label: "开场", icon: <MessageSquare className="h-4 w-4" /> },
  sellingPoint: { label: "卖点", icon: <Sparkles className="h-4 w-4" /> },
  objection: { label: "异议应对", icon: <ShieldAlert className="h-4 w-4" /> },
  pricing: { label: "议价", icon: <BadgeDollarSign className="h-4 w-4" /> },
  renewal: { label: "续费", icon: <RefreshCw className="h-4 w-4" /> },
};

/** 随身话术卡。 */
export function TalkScriptCard({ script }: { script: TalkScript }) {
  const meta = SCENE_META[script.scene];
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          {meta.icon}
          {meta.label}
          <span className="text-foreground">· {script.title}</span>
        </div>
        {script.objection && (
          <p className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
            客户可能异议:{script.objection}
          </p>
        )}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {script.content}
        </p>
      </CardContent>
    </Card>
  );
}
