export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const targetAddress = url.searchParams.get("address");

  if (!targetAddress) {
    return new Response(JSON.stringify({ error: "Missing address" }), { status: 400 });
  }

  try {
    // 1. 获取 Token
    // 根据 Skymail 文档，请求 genToken
    const tokenPayload = {
      address: "admin@ctmd.xyz",
      email: "admin@ctmd.xyz",     // 适配不同的请求参名
      username: "admin@ctmd.xyz",
      password: "ymy100861"
    };

    const tokenRes = await fetch("https://email.ctmd.xyz/api/public/genToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tokenPayload)
    });

    const tokenData = await tokenRes.json();
    if (tokenData.code !== 200 || !tokenData.data?.token) {
      return new Response(JSON.stringify({ error: "Failed to authenticate with mail server", details: tokenData }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = tokenData.data.token;

    // 2. 获取邮件列表
    // skymail 的 emailList 接口
    const mailListResponse = await fetch("https://email.ctmd.xyz/api/public/emailList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        // 支持的过滤参数
        toEmail: targetAddress, // 只获取发给目标地址的
      })
    });

    const mailData = await mailListResponse.json();

    // 返回数据给前端，剔除敏感信息
    return new Response(JSON.stringify({
      success: true,
      data: mailData.data || []
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server request failed: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
