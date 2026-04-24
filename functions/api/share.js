export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response(JSON.stringify({ error: "请输入4位取件码" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const text = await context.env.TEXT_SHARE_KV.get(code);

  if (!text) {
    return new Response(JSON.stringify({ error: "取件码不存在或已过期" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ success: true, data: text }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestPost(context) {
  try {
    const { text } = await context.request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "内容不能为空" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // 生成4位唯一的随机码，重试机制
    let code;
    let maxLoop = 10;
    while(maxLoop--) {
      // 生成 1000 到 9999 的数字字符串
      code = Math.floor(1000 + Math.random() * 9000).toString();
      const existing = await context.env.TEXT_SHARE_KV.get(code);
      if (!existing) break;
    }
    
    if (maxLoop <= 0) {
      return new Response(JSON.stringify({ error: "服务器繁忙，生成取件码失败" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // 保存到 KV，有效时间为 24 小时 (86400秒)
    await context.env.TEXT_SHARE_KV.put(code, text, { expirationTtl: 86400 });
    
    return new Response(JSON.stringify({ success: true, code }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "解析请求失败" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
