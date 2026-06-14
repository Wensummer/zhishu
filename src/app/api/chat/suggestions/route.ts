import { NextResponse } from "next/server";

/**
 * 「猜你想问」快捷问句的转发层(BFF)。
 * 浏览器调同源 /api/chat/suggestions?page=…,这里转发给后端 /chat/suggestions。
 */
const BACKEND = process.env.BACKEND_API_BASE || "http://localhost:8000";

export async function GET(req: Request) {
  const page = new URL(req.url).searchParams.get("page") ?? "";
  try {
    const res = await fetch(
      `${BACKEND}/chat/suggestions?page=${encodeURIComponent(page)}`,
      { cache: "no-store" }
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    // 失败返回空数组,前端保留手写兜底
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
