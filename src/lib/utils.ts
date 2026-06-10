import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 className 的标准工具(shadcn 约定)。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 人民币格式化,默认不带小数。 */
export function formatCNY(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** 百分比格式化,入参为 0~1 的小数。 */
export function formatPercent(value: number, fractionDigits = 1): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

/** 大数字千分位。 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("zh-CN").format(value);
}

/** 报价区间展示,如 "¥1.2万 ~ ¥1.8万"。 */
export function formatRange(range: [number, number]): string {
  return `${formatCNY(range[0])} ~ ${formatCNY(range[1])}`;
}
