const state = {
  providers: [],
};

const $ = (selector) => document.querySelector(selector);

const navItems = [...document.querySelectorAll(".nav-item")];
const panels = [...document.querySelectorAll(".tool-panel")];

const chatForm = $("#chat-form");
const rewriteForm = $("#rewrite-form");
const fetchForm = $("#fetch-form");

const chatOutput = $("#chat-output");
const rewriteOutput = $("#rewrite-output");
const fetchOutput = $("#fetch-output");

function showPanel(name) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.panel === name);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${name}`);
  });
}

function renderProviders(providers) {
  const selects = [$("#chat-provider"), $("#rewrite-provider")];
  const tags = $("#provider-tags");
  const count = $("#provider-count");

  count.textContent = String(providers.length);
  tags.innerHTML = "";

  if (!providers.length) {
    selects.forEach((select) => {
      select.innerHTML = '<option value="">未配置</option>';
    });
    tags.innerHTML = '<span class="tag">请先配置环境变量</span>';
    return;
  }

  const options = providers
    .map((provider) => `<option value="${provider.id}">${provider.label}</option>`)
    .join("");

  selects.forEach((select) => {
    select.innerHTML = options;
  });

  providers.forEach((provider) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = provider.label;
    tags.append(tag);
  });
}

function bindModelPreset(select, input) {
  select.addEventListener("change", () => {
    const provider = state.providers.find((item) => item.id === select.value);
    if (provider?.defaultModel) {
      input.value = provider.defaultModel;
    }
  });
}

function print(target, payload) {
  target.textContent =
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
}

async function postJSON(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({
    ok: false,
    error: "返回内容不是合法 JSON",
  }));

  if (!response.ok) {
    throw new Error(result.error || "请求失败");
  }

  return result;
}

async function boot() {
  try {
    const [health, providers] = await Promise.all([
      fetch("/api/health").then((res) => res.json()),
      fetch("/api/providers").then((res) => res.json()),
    ]);

    $("#health-text").textContent = health.ok ? "在线" : "异常";
    state.providers = providers.providers || [];
    renderProviders(state.providers);

    const firstProvider = state.providers[0];
    if (firstProvider?.defaultModel) {
      $("#chat-model").value = firstProvider.defaultModel;
      $("#rewrite-model").value = firstProvider.defaultModel;
    }
  } catch (error) {
    $("#health-text").textContent = "未连接";
    print(chatOutput, `初始化失败：${error.message}`);
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showPanel(item.dataset.panel));
});

bindModelPreset($("#chat-provider"), $("#chat-model"));
bindModelPreset($("#rewrite-provider"), $("#rewrite-model"));

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  print(chatOutput, "请求中...");

  const form = new FormData(chatForm);

  try {
    const result = await postJSON("/api/ai/chat", {
      provider: form.get("provider"),
      model: form.get("model"),
      system: form.get("system"),
      prompt: form.get("prompt"),
    });

    print(chatOutput, result);
  } catch (error) {
    print(chatOutput, `请求失败：${error.message}`);
  }
});

rewriteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  print(rewriteOutput, "请求中...");

  const form = new FormData(rewriteForm);

  try {
    const result = await postJSON("/api/ai/rewrite", {
      provider: form.get("provider"),
      model: form.get("model"),
      mode: form.get("mode"),
      text: form.get("text"),
    });

    print(rewriteOutput, result);
  } catch (error) {
    print(rewriteOutput, `请求失败：${error.message}`);
  }
});

fetchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  print(fetchOutput, "请求中...");

  const form = new FormData(fetchForm);
  const rawBody = String(form.get("body") || "").trim();

  try {
    const result = await postJSON("/api/http/json", {
      method: form.get("method"),
      url: form.get("url"),
      body: rawBody ? JSON.parse(rawBody) : undefined,
    });

    print(fetchOutput, result);
  } catch (error) {
    print(fetchOutput, `请求失败：${error.message}`);
  }
});

boot();
