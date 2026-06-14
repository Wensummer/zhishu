import { NextResponse } from "next/server";

/** 某客户的通话小结历史(沟通时间线)的 BFF。 */
const BACKEND = process.env.BACKEND_API_BASE || "http://localhost:8000";

export async function GET(
  _req: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const res = await fetch(
      `${BACKEND}/copilot/summary/${encodeURIComponent(params.customerId)}`,
      { cache: "no-store" }
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    // 失败返回空历史,不阻塞页面
    return NextResponse.json([], { status: 200 });
  }
}
