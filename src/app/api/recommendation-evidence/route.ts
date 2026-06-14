import { NextResponse } from "next/server";

/**
 * 推荐选型支撑依据知识库检索 —— BFF 转发层。
 *
 * 前端 → 同源 BFF(端口 3000) → Python 后端(POST /recommendation/evidence)
 * 后端从 Dify 选型知识库检索理论依据,返回命中段落 + 元信息。
 */
const BACKEND = process.env.BACKEND_API_BASE?.replace(/\/+$/, "") || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidates, forceRefresh } = body;
    const res = await fetch(`${BACKEND}/recommendation/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates, force_refresh: forceRefresh ?? false }),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "后端连接失败", results: [] },
      { status: 502 }
    );
  }
}
