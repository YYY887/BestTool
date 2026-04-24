import {
  badRequest,
  getString,
  json,
  readJSON,
  serverError,
} from "../../_lib/http.js";
import { resolveProvider } from "../../_lib/providers.js";

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
    const prompt = getString(payload.prompt);
    const system = getString(payload.system);

    if (!providerId || !model || !prompt) {
      return badRequest("provider、model、prompt 为必填项");
    }

    const provider = resolveProvider(context.env, providerId);
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(provider, context.env),
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return serverError("上游 AI 接口调用失败", data);
    }

    return json({
      ok: true,
      provider: provider.label,
      model: data.model || model,
      text: data.choices?.[0]?.message?.content || "",
      raw: data,
    });
  } catch (error) {
    return serverError(error.message);
  }
}
