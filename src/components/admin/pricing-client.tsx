"use client";

import * as React from "react";
import { Megaphone, Plus } from "lucide-react";

import { formatCNY } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Plan {
  name: string;
  mode: "包年" | "按量";
  priceText: string;
  range: string;
  discount: string;
}

interface PriceAnnouncement {
  id: string;
  title: string;
  body: string;
  effectiveAt: string;
}

const INITIAL_PLANS: Plan[] = [
  { name: "通义千问-Max · 包年企业版", mode: "包年", priceText: formatCNY(200000), range: "180k ~ 210k", discount: "9.0 折" },
  { name: "通义千问-Plus · 按量标准版", mode: "按量", priceText: "¥0.02 / 千 token", range: "0.018 ~ 0.02", discount: "缓存 6 折" },
  { name: "DeepSeek-V3 · 按量标准版", mode: "按量", priceText: "¥0.008 / 千 token", range: "0.007 ~ 0.008", discount: "缓存 5 折" },
  { name: "文心一言-4.0 · 包年企业版", mode: "包年", priceText: formatCNY(240000), range: "220k ~ 260k", discount: "9.2 折" },
];

export function PricingClient() {
  const [plans, setPlans] = React.useState<Plan[]>(INITIAL_PLANS);
  const [announcements, setAnnouncements] = React.useState<PriceAnnouncement[]>([]);
  const [editIndex, setEditIndex] = React.useState<number | null>(null);
  const [announceOpen, setAnnounceOpen] = React.useState(false);
  const counter = React.useRef(0);

  function savePlan(index: number, patch: Partial<Plan>) {
    setPlans((ps) => ps.map((p, i) => (i === index ? { ...p, ...patch } : p)));
    setEditIndex(null);
  }

  function addAnnouncement(a: Omit<PriceAnnouncement, "id">) {
    counter.current += 1;
    setAnnouncements((list) => [{ id: `pa-${counter.current}`, ...a }, ...list]);
    setAnnounceOpen(false);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAnnounceOpen(true)}>
          <Plus className="h-4 w-4" />
          新建调价公告
        </Button>
      </div>

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

      {announcements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">近期调价公告</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{a.title}</span>
                  <Badge variant="warning">生效 {a.effectiveAt || "待定"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
              {plans.map((p, i) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant={p.mode === "包年" ? "default" : "secondary"}>
                      {p.mode}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{p.priceText}</TableCell>
                  <TableCell className="text-muted-foreground">{p.range}</TableCell>
                  <TableCell className="text-muted-foreground">{p.discount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditIndex(i)}>
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditPlanDialog
        plan={editIndex !== null ? plans[editIndex] : null}
        onClose={() => setEditIndex(null)}
        onSave={(patch) => editIndex !== null && savePlan(editIndex, patch)}
      />
      <AnnounceDialog
        open={announceOpen}
        onOpenChange={setAnnounceOpen}
        onAdd={addAnnouncement}
      />
    </>
  );
}

function EditPlanDialog({
  plan,
  onClose,
  onSave,
}: {
  plan: Plan | null;
  onClose: () => void;
  onSave: (patch: Partial<Plan>) => void;
}) {
  const [priceText, setPriceText] = React.useState("");
  const [range, setRange] = React.useState("");
  const [discount, setDiscount] = React.useState("");

  React.useEffect(() => {
    if (plan) {
      setPriceText(plan.priceText);
      setRange(plan.range);
      setDiscount(plan.discount);
    }
  }, [plan]);

  return (
    <Dialog open={plan !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑套餐定价</DialogTitle>
          <DialogDescription>
            {plan?.name} · 演示阶段保存在本地;接后端后由 PUT 落库并触发调价公示。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="标准价" value={priceText} onChange={setPriceText} />
          <Field label="议价区间" value={range} onChange={setRange} />
          <Field label="优惠" value={discount} onChange={setDiscount} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={() => onSave({ priceText, range, discount })}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnnounceDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (a: { title: string; body: string; effectiveAt: string }) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [effectiveAt, setEffectiveAt] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setEffectiveAt("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建调价公告</DialogTitle>
          <DialogDescription>
            提前公示,全程留痕。演示阶段保存在本地;接后端后写入公告表并同步状态页时间线。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="标题" value={title} onChange={setTitle} placeholder="如:DeepSeek-V3 输出价下调 12%" />
          <Field label="内容" value={body} onChange={setBody} placeholder="生效时间、影响范围、锁价说明…" />
          <Field label="生效日期" value={effectiveAt} onChange={setEffectiveAt} placeholder="如:2026-06-20" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button disabled={!title.trim()} onClick={() => onAdd({ title: title.trim(), body: body.trim(), effectiveAt })}>
            发布
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
