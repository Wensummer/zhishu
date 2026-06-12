import { NextResponse } from "next/server";

/**
 * 实时通话意图分析的转发层(BFF)。
 *
 * 浏览器只调同源的 /api/copilot/analyze(端口 3000,已转发、无跨域),
 * 由这里(跑在与后端同一台机器上的 Next.js 服务端)转发给 Python 后端。
 * 好处:不用额外转发后端端口,也不踩 CORS。
 */
const BACKEND = process.env.BACKEND_API_BASE || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/copilot/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "后端连接失败" },
      { status: 502 }
    );
  }
}
