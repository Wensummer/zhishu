import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getModels } from "@/lib/api";

// 演示:模型上下架与面向分层
const SHELF: Record<string, { listed: boolean; tiers: string }> = {
  "qwen-max": { listed: true, tiers: "大客户 / 中小" },
  "qwen-plus": { listed: true, tiers: "全部" },
  "ernie-4": { listed: true, tiers: "大客户 / 金融" },
  "deepseek-v3": { listed: true, tiers: "全部" },
  "deepseek-r1": { listed: true, tiers: "大客户" },
  "glm-4": { listed: true, tiers: "中小 / toC" },
  "moonshot-128k": { listed: true, tiers: "大客户 / 中小" },
  "baichuan-4": { listed: false, tiers: "—" },
};

/** P2-12 产品配置(模型/套餐上下架与分层)。 */
export default async function AdminProductsPage() {
  const models = await getModels();
  return (
    <>
      <PageHeader
        title="产品配置"
        description="模型 / 套餐的上下架管理,控制对外可售与面向的客户分层。"
        actions={<Button size="sm">新增上架</Button>}
      />
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
                const s = SHELF[m.id];
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
                      <Button variant="ghost" size="sm">
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
    </>
  );
}
