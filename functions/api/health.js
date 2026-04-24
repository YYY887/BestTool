import { json } from "../_lib/http.js";

export function onRequestGet() {
  return json({
    ok: true,
    service: "ManyTools",
    runtime: "cloudflare-pages-functions",
    now: new Date().toISOString(),
  });
}
