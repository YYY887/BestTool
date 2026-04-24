import {
  badRequest,
  getString,
  json,
  readJSON,
  serverError,
} from "../../_lib/http.js";
import { resolveProvider } from "../../_lib/providers.js";

const prompts = {
  polish: "请将用户文本润色为更自然、更准确、更有层次的中文表达，保留原意。",
  summary: "请将用户文本压缩为简洁摘要，优先保留关键信息。",
  title: "请根据用户文本提炼 5 个简洁高级的中文标题，每行一个。",
};

function buildHeaders(provider, env) {
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${provider.apiKey}`,
  };

  if (provider.id === "openrouter") {
    headers["http-referer"] = env.APP_URL || "https://many-tools.pages.dev";
    headers["x-title"] = env.APP_NAME || "ManyTools";
  }

  return headers;
}

export async function onRequestPost(context) {
  try {
    const payload = await readJSON(context.request);
    const providerId = getString(payload.provider);
    const model = getString(payload.model);
    const mode = getString(payload.mode, "polish");
    const text = getString(payload.text);

    if (!providerId || !model || !text) {
      return badRequest("provider、model、text 为必填项");
    }

    const system = prompts[mode] || prompts.polish;
    const provider = resolveProvider(context.env, providerId);

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(provider, context.env),
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return serverError("文本处理失败", data);
    }

    return json({
      ok: true,
      mode,
      output: data.choices?.[0]?.message?.content || "",
      raw: data,
    });
  } catch (error) {
    return serverError(error.message);
  }
}
