/**
 * 配置答疑 chatbot 的转发层(BFF)。
 *
 * 浏览器只调同源 /api/chat,由这里(与后端同机的 Next 服务端)转发给 Python 后端 /chat,
 * 并把后端的流式纯文本响应原样透传回浏览器(边收边显示),不踩跨端口/CORS。
 */
const BACKEND = process.env.BACKEND_API_BASE || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    // 直接透传后端的可读流(text/plain),保持逐字流式
    return new Response(res.body, {
      status: res.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "后端连接失败", {
      status: 502,
    });
  }
}
