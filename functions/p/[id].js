export async function onRequestGet({ params, env }) {
  const id = params.id;
  try {
     const html = await env.HTML_HOSTING_KV.get(id);
     
     if (!html) {
       // Return a simple HTML error page that matches the branding
       const errorPage = `
         <!DOCTYPE html>
         <html lang="zh-CN">
         <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>页面不存在或已过期 - BestTool</title>
           <style>
             body { font-family: system-ui, sans-serif; background: #fafafa; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; color: #333; }
             .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
             h1 { font-size: 24px; color: #ef4444; margin-bottom: 10px; }
             p { color: #666; margin-bottom: 20px; }
             a { display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
           </style>
         </head>
         <body>
           <div class="container">
             <h1>链接已失效或不存在</h1>
             <p>该临时网页托管期限为2天，可能已经过期自毁了。</p>
             <a href="/">返回 BestTool</a>
           </div>
         </body>
         </html>
       `;
       return new Response(errorPage, { 
         status: 404,
         headers: { "Content-Type": "text/html; charset=utf-8" } 
       });
     }

     return new Response(html, {
       headers: {
         "Content-Type": "text/html; charset=utf-8"
       }
     });
  } catch (e) {
     return new Response("Internal Server Error: " + e.message, { status: 500 });
  }
}
