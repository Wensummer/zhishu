import { EyeOff, ShieldCheck, ScrollText, FileLock2, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CONTROLS = [
  { icon: <EyeOff className="h-5 w-5" />, title: "数据脱敏", status: "已启用", desc: "客户名、企业名、密钥全程脱敏存储与展示" },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "权限控制", status: "等保三级", desc: "按角色最小权限,敏感操作二次校验" },
  { icon: <ScrollText className="h-5 w-5" />, title: "日志审计", status: "已启用", desc: "全量操作留痕,可追溯、可导出" },
  { icon: <FileLock2 className="h-5 w-5" />, title: "数据不出境", status: "已启用", desc: "仅接备案模型,数据全程境内处理" },
];

const AUDIT = [
  { time: "2026-06-10 09:12", who: "客户经理 · 周敏", action: "查看简报", target: "云帆智造科技", level: "常规" },
  { time: "2026-06-10 08:40", who: "管理员 · 李航", action: "调价公告发布", target: "DeepSeek-V3", level: "敏感" },
  { time: "2026-06-09 17:25", who: "系统", action: "密钥轮换", target: "租户 T-1024", level: "敏感" },
  { time: "2026-06-09 15:03", who: "客户经理 · 周敏", action: "导出横评表", target: "模型池", level: "常规" },
];

/** P2-12 合规管理(脱敏/权限/审计/留痕)。 */
export default function AdminCompliancePage() {
  return (
    <>
      <PageHeader
        title="合规管理"
        description="数据脱敏、权限控制、日志审计、合规留痕 —— 作为护城河,而非免责声明。"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CONTROLS.map((c) => (
          <Card key={c.title}>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {c.icon}
                </span>
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {c.status}
                </Badge>
              </div>
              <div className="font-semibold">{c.title}</div>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">审计留痕(最近操作)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>操作人</TableHead>
                <TableHead>动作</TableHead>
                <TableHead>对象</TableHead>
                <TableHead>级别</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AUDIT.map((a, i) => (
                <TableRow key={i}>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {a.time}
                  </TableCell>
                  <TableCell>{a.who}</TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell className="text-muted-foreground">{a.target}</TableCell>
                  <TableCell>
                    <Badge variant={a.level === "敏感" ? "warning" : "secondary"}>
                      {a.level}
                    </Badge>
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
