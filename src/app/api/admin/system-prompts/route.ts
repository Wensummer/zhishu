import { NextResponse } from "next/server";

/**
 * 各能力位系统提示词读写的转发层(BFF)。
 * 浏览器调同源 /api/admin/system-prompts,这里转发给 Python 后端 /admin/system-prompts。
 */
const BACKEND = process.env.BACKEND_API_BASE || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/admin/system-prompts`, {
      cache: "no-store",
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "后端连接失败" },
      { status: 502 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND}/admin/system-prompts`, {
      method: "PUT",
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
