import { NextResponse } from "next/server";

import { retrieveKnowledge } from "@/lib/dify/knowledge";

/** 随身话术专用知识库（区别于选型推荐知识库）。 */
const SCRIPT_DATASET_ID = "366894d1-b153-4816-a3c1-29e2bea5dd0d";

/** 话术场景 → 知识库检索关键词映射 */
const SCENE_QUERIES: Record<string, string> = {
  opening: "客户经理开场话术 续约切入 建立信任",
  sellingPoint: "产品卖点 合规锁价 备案直连 渠道纯度",
  objection: "客户异议处理 价格异议 比价应对 SOP",
  pricing: "议价策略 报价技巧 锁价方案",
  renewal: "续费话术 续约技巧 留存策略",
};

function buildQuery(script: {
  scene: string;
  title: string;
  content: string;
  objection?: string;
}): string {
  const sceneKeywords = SCENE_QUERIES[script.scene] ?? "话术 销售技巧";
  const objectionPart = script.objection
    ? ` 客户异议：${script.objection}`
    : "";
  const contentPart = script.content.slice(0, 120);
  return `话术场景：${script.title}。${sceneKeywords}。${contentPart}${objectionPart}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      scripts?: Array<{
        id: string;
        scene: string;
        title: string;
        content: string;
        objection?: string;
      }>;
    };

    const scripts = body.scripts ?? [];

    if (
      !scripts.length ||
      scripts.some(
        (s) =>
          !s.id ||
          !s.scene ||
          !s.title ||
          !s.content ||
          s.id.length > 80 ||
          s.title.length > 100
      )
    ) {
      return NextResponse.json(
        { message: "话术参数不完整或无效" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      scripts.map(async (script) => ({
        scriptId: script.id,
        ...(await retrieveKnowledge(buildQuery(script), SCRIPT_DATASET_ID)),
      }))
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error(
      "Script evidence retrieval failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { message: "知识库检索暂时不可用" },
      { status: 502 }
    );
  }
}
