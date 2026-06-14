import { cn } from "@/lib/utils";

/**
 * 近 7 天「稳定度」色块条(status page 通用表达,小白看颜色即懂)。
 * 每天一个色块,按当天可用率分档:绿=正常 / 黄=波动 / 红=异常;右侧附 7 天均值。
 * 悬浮单块看「第几天 · 可用率」。
 */
const DAY_LABELS = ["6 天前", "5 天前", "4 天前", "3 天前", "前天", "昨天", "今天"];

const BAR_COLOR: Record<"ok" | "warn" | "down", string> = {
  ok: "hsl(var(--success))",
  warn: "hsl(var(--warning))",
  down: "hsl(var(--destructive))",
};

function levelOf(pct: number): "ok" | "warn" | "down" {
  if (pct >= 99.5) return "ok";
  if (pct >= 99.0) return "warn";
  return "down";
}

/** data:近 7 天每天的可用率(百分比数值,如 99.7)。 */
export function UptimeBar({ data }: { data: number[] }) {
  const avg =
    Math.round((data.reduce((s, x) => s + x, 0) / data.length) * 10) / 10;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-[3px]">
        {data.map((v, i) => (
          <span
            key={i}
            title={`${DAY_LABELS[i] ?? `第 ${i + 1} 天`} · ${v}%`}
            className={cn(
              "h-6 w-1.5 rounded-sm transition-transform hover:scale-y-110"
            )}
            style={{ background: BAR_COLOR[levelOf(v)] }}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{avg}%</span>
    </div>
  );
}
