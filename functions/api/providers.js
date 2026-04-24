import { json } from "../_lib/http.js";
import { getProviders } from "../_lib/providers.js";

export function onRequestGet(context) {
  return json({
    ok: true,
    providers: getProviders(context.env),
  });
}
