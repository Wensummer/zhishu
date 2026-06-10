import {
  AlertTriangle,
  BadgePercent,
  Wrench,
  PackageMinus,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Announcement, AnnouncementKind } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const KIND_META: Record<
  AnnouncementKind,
  {
    label: string;
    icon: React.ReactNode;
    variant: React.ComponentProps<typeof Badge>["variant"];
    dot: string;
  }
> = {
  priceChange: {
    label: "调价公告",
    icon: <BadgePercent className="h-4 w-4" />,
    variant: "warning",
    dot: "hsl(var(--warning))",
  },
  incident: {
    label: "故障",
    icon: <AlertTriangle className="h-4 w-4" />,
    variant: "destructive",
    dot: "hsl(var(--destructive))",
  },
  maintenance: {
    label: "维护",
    icon: <Wrench className="h-4 w-4" />,
    variant: "secondary",
    dot: "hsl(var(--muted-foreground))",
  },
  shelf: {
    label: "上下架",
    icon: <PackageMinus className="h-4 w-4" />,
    variant: "outline",
    dot: "hsl(var(--primary))",
  },
};

/** 调价 / 故障 / 维护公告时间线。 */
export function AnnouncementTimeline({ items }: { items: Announcement[] }) {
  return (
    <ol className="relative space-y-5 pl-6">
      {/* 竖线 */}
      <span className="absolute left-[7px] top-1 h-[calc(100%-0.5rem)] w-px bg-border" />
      {items.map((a) => {
        const meta = KIND_META[a.kind];
        return (
          <li key={a.id} className="relative">
            <span
              className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background"
              style={{ background: meta.dot }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={meta.variant} className="gap-1">
                {meta.icon}
                {meta.label}
              </Badge>
              <span className="font-medium">{a.title}</span>
              {a.resolvedAt && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  已恢复
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            <div className={cn("mt-1 text-xs text-muted-foreground")}>
              发布 {a.publishedAt}
              {a.resolvedAt && ` · 恢复 ${a.resolvedAt}`}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
