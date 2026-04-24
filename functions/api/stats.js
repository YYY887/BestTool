export async function onRequest(context) {
  const { request, env } = context;

  // 确保表创立
  try {
    await env.STATS_DB.prepare(`
      CREATE TABLE IF NOT EXISTS stats (
        key TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `).run();
  } catch(e) {
    console.error("DB Initialization error", e);
  }

  // POST: 记录一次访问或功能使用
  if (request.method === "POST") {
    try {
      const data = await request.json();
      const action = data.action; // 'visit', 'douyin', 'json', etc.
      if (!action) return new Response(JSON.stringify({ error: "missing action" }), { status: 400 });

      await env.STATS_DB.prepare(`
        INSERT INTO stats (key, count) VALUES (?1, 1)
        ON CONFLICT(key) DO UPDATE SET count = count + 1
      `).bind(action).run();

      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  // GET: 获取所有统计数据
  if (request.method === "GET") {
    try {
       const result = await env.STATS_DB.prepare("SELECT key, count FROM stats ORDER BY count DESC").all();
       return new Response(JSON.stringify({ success: true, data: result.results }), { headers: { "Content-Type": "application/json" } });
    } catch (e) {
       return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
