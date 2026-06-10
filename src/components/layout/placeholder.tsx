import { Construction } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlaceholderProps {
  priority: "P0" | "P1" | "P2";
  /** 该页将包含的功能点,用于占位说明。 */
  points?: string[];
}

/** Phase 3 待实现页面的占位卡。 */
export function Placeholder({ priority, points }: PlaceholderProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Construction className="h-6 w-6 text-muted-foreground" />
        </span>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">{priority}</Badge>
            <span className="text-sm font-medium">该页将在 Phase 3 实现</span>
          </div>
          <p className="text-sm text-muted-foreground">
            脚手架已就绪,路由可达。下面是规划的功能点:
          </p>
        </div>
        {points && points.length > 0 && (
          <ul className="mx-auto max-w-md space-y-1 text-left text-sm text-muted-foreground">
            {points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-primary">·</span>
                {p}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
