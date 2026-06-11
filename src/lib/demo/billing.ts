/**
 * 演示用计费明细数据。
 * 为 C 端用户和客户简报提供 mock billing records。
 */
import type { BillingRecord } from "@/lib/types";

const API_KEYS_C_END = ["默认 Key", "个人 Key-01", "个人 Key-02"];
const API_KEYS_ENTERPRISE: Record<string, string[]> = {
  "c-1024": ["生产环境 Key", "测试环境 Key", "质检 Agent Key"],
  "c-1031": ["主 Key", "内容生产 Key"],
  "c-1042": ["核心交易 Key", "合规审计 Key", "数据分析 Key", "风控 Key"],
  "c-1055": ["通用 Key"],
  "c-2003": [],
};

const MODELS = [
  "DeepSeek-V3",
  "DeepSeek-R1",
  "通义千问-Max",
  "通义千问-Plus",
  "通义千问-Turbo",
  "智谱 GLM-4",
  "智谱 GLM-4-Flash",
  "文心一言-4.0",
  "文心一言-3.5",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 为 C 端用户生成演示计费明细(近 30 天)。
 */
function generateCEndRecords(): BillingRecord[] {
  const records: BillingRecord[] = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const model = randomItem(MODELS);
    const input = randomInt(5000, 50000);
    const output = randomInt(2000, 30000);
    const tokens = input + output;
    const unitPrice = parseFloat((Math.random() * 0.08 + 0.01).toFixed(4));
    const amount = parseFloat(((tokens / 1000) * unitPrice).toFixed(2));

    records.push({
      id: `bill-c-${i}`,
      date: formatDate(d),
      model,
      modelId: model,
      apiKeyName: randomItem(API_KEYS_C_END),
      tokens,
      inputTokens: input,
      outputTokens: output,
      amount,
      unitPrice,
      billingMode: "payg",
    });
  }
  return records;
}

/**
 * 为企业客户(客户经理视角)生成演示计费明细(近 90 天)。
 */
function generateEnterpriseRecords(customerId: string): BillingRecord[] {
  const keys = API_KEYS_ENTERPRISE[customerId] ?? ["默认 Key"];
  if (keys.length === 0) return [];

  const records: BillingRecord[] = [];
  const now = new Date();
  const dayCount = customerId === "c-1042" ? 90 : 60;

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const model = randomItem(MODELS);
    const input = randomInt(20000, 200000);
    const output = randomInt(10000, 120000);
    const tokens = input + output;
    const unitPrice = parseFloat((Math.random() * 0.08 + 0.01).toFixed(4));
    const amount = parseFloat(((tokens / 1000) * unitPrice).toFixed(2));

    records.push({
      id: `bill-${customerId}-${i}`,
      date: formatDate(d),
      model,
      modelId: model,
      apiKeyName: randomItem(keys),
      tokens,
      inputTokens: input,
      outputTokens: output,
      amount,
      unitPrice,
      billingMode: "payg",
    });
  }
  return records;
}

// 缓存生成的 C 端数据(全局单例)
let _cachedCEndRecords: BillingRecord[] | null = null;

/** 获取 C 端用户计费明细。 */
export function getCEndBillingRecords(): BillingRecord[] {
  if (!_cachedCEndRecords) {
    _cachedCEndRecords = generateCEndRecords();
  }
  return _cachedCEndRecords;
}

/** 获取指定企业客户的计费明细。 */
export function getCustomerBillingRecords(customerId: string): BillingRecord[] {
  return generateEnterpriseRecords(customerId);
}
