import { NextResponse } from "next/server";

/**
 * 给销售的话术 —— 异步生成的转发层(BFF)。
 * 前端拿到推荐后调本路由,后端检索话术库 + LLM 生成话术(慢,不阻塞推荐弹屏)。
 */
const BACKEND = process.env.BACKEND_API_BASE || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/copilot/script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "话术生成失败" },
      { status: 502 }
    );
  }
}
