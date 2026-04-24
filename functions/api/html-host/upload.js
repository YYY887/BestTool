export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    if (!data || !data.html) {
      return new Response(JSON.stringify({ error: "Empty HTML content" }), { status: 400 });
    }
    
    // 生成随机 6 位字符串当作 ID
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; i < 6; i++) {
       id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 写入 KV 命名空间，并设置过期时间为 2 天 (172800 秒)
    await env.HTML_HOSTING_KV.put(id, data.html, { expirationTtl: 172800 });
    
    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
