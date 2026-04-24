const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init.headers || {}),
    },
  });
}

export async function readJSON(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("请求体不是合法 JSON");
  }
}

export function badRequest(message, details) {
  return json(
    {
      ok: false,
      error: message,
      details,
    },
    { status: 400 }
  );
}

export function serverError(message, details) {
  return json(
    {
      ok: false,
      error: message,
      details,
    },
    { status: 500 }
  );
}

export function getString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}
