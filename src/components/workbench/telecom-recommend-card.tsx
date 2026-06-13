import {
  Globe,
  Shield,
  Monitor,
  Database,
  Cloud,
  Wifi,
  Headphones,
  type LucideIcon,
} from "lucide-react";

import type { TelecomProduct } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORY_META: Record<
  string,
  { label: string; icon: LucideIcon; color: string }
> = {
  "云专线": { label: "云专线", icon: Globe, color: "text-blue-500" },
  "云安全": { label: "云安全", icon: Shield, color: "text-red-500" },
  "云会议": { label: "云会议", icon: Monitor, color: "text-green-500" },
  "云网络": { label: "云网络", icon: Globe, color: "text-sky-500" },
  "云存储": { label: "云存储", icon: Database, color: "text-amber-500" },
  "云容灾": { label: "云容灾", icon: Cloud, color: "text-purple-500" },
  "云数据库": { label: "云数据库", icon: Database, color: "text-indigo-500" },
  "云主机": { label: "云主机", icon: Cloud, color: "text-cyan-500" },
  "企业应用": { label: "企业应用", icon: Monitor, color: "text-teal-500" },
  "企业网络": { label: "企业网络", icon: Wifi, color: "text-slate-500" },
  "企业通信": { label: "企业通信", icon: Headphones, color: "text-orange-500" },
};

/** 其他电信业务推荐卡片。 */
export function TelecomRecommendCard({
  product,
}: {
  product: TelecomProduct;
}) {
  const meta = CATEGORY_META[product.category] ?? {
    label: product.category,
    icon: Cloud,
    color: "text-muted-foreground",
  };
  const Icon = meta.icon;

  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${meta.color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{product.name}</span>
            <Badge variant="outline" className="text-[10px]">
              {product.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {product.description}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">
              推荐理由：{product.reason}
            </span>
            <span className="font-medium tabular-nums text-primary">
              {product.estimatedPrice}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
