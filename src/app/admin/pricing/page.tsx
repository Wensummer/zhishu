import { Megaphone } from "lucide-react";

import { formatCNY } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PLANS = [
  { name: "通义千问-Max · 包年企业版", mode: "包年", list: 200000, range: "180k ~ 210k", discount: "9.0 折" },
  { name: "通义千问-Plus · 按量标准版", mode: "按量", list: 0.02, range: "0.018 ~ 0.02", discount: "缓存 6 折" },
  { name: "DeepSeek-V3 · 按量标准版", mode: "按量", list: 0.008, range: "0.007 ~ 0.008", discount: "缓存 5 折" },
  { name: "文心一言-4.0 · 包年企业版", mode: "包年", list: 240000, range: "220k ~ 260k", discount: "9.2 折" },
];

/** P2-12 价格与优惠配置(含调价公示)。 */
export default function AdminPricingPage() {
  return (
    <>
      <PageHeader
        title="价格与优惠配置"
        description="各模型/套餐的定价、折扣、议价区间;任何调价提前公示、全程留痕。"
        actions={<Button size="sm">新建调价公告</Button>}
      />

      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <span className="font-medium">调价公示制度</span>
            <p className="text-muted-foreground">
              所有调价、上下架须提前 ≥ 7 天公示并留痕。老客户合同锁价不受影响 —— 这是灰中转「倍率说变就变」给不了的预算确定性。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">套餐定价</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>套餐</TableHead>
                <TableHead>计费方式</TableHead>
                <TableHead>标准价</TableHead>
                <TableHead>议价区间</TableHead>
                <TableHead>优惠</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLANS.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant={p.mode === "包年" ? "default" : "secondary"}>
                      {p.mode}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {p.mode === "包年"
                      ? formatCNY(p.list as number)
                      : `¥${p.list} / 千 token`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.range}</TableCell>
                  <TableCell className="text-muted-foreground">{p.discount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
