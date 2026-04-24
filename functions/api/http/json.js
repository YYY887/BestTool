import {
  badRequest,
  getString,
  json,
  readJSON,
  serverError,
} from "../../_lib/http.js";

function getAllowedOrigins(env) {
  return String(env.ALLOWED_API_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAllowed(url, allowedOrigins) {
  return allowedOrigins.some((origin) => url.origin === origin);
}

export async function onRequestPost(context) {
  try {
    const payload = await readJSON(context.request);
    const method = getString(payload.method, "GET").toUpperCase();
    const urlText = getString(payload.url);
    const body = payload.body;

    if (!urlText) {
      return badRequest("url 为必填项");
    }

    if (!["GET", "POST"].includes(method)) {
      return badRequest("当前仅允许 GET 与 POST");
    }

    const url = new URL(urlText);
    const allowedOrigins = getAllowedOrigins(context.env);

    if (!allowedOrigins.length) {
      return badRequest("未配置 ALLOWED_API_ORIGINS 白名单");
    }

    if (!isAllowed(url, allowedOrigins)) {
      return badRequest("目标域名不在白名单内", {
        target: url.origin,
        allowedOrigins,
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        accept: "application/json",
        ...(method === "POST" ? { "content-type": "application/json" } : {}),
      },
      body: method === "POST" && body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let data = text;

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    });
  } catch (error) {
    return serverError(error.message);
  }
}
