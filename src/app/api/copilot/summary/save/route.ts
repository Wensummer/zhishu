import { NextResponse } from "next/server";

/** 通话小结保存(持久化 + 回流)的 BFF。 */
const BACKEND = process.env.BACKEND_API_BASE || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND}/copilot/summary/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "后端连接失败" },
      { status: 502 }
    );
  }
}
