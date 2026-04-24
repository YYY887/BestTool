const registry = [
  {
    id: "openai",
    label: "OpenAI",
    key: "OPENAI_API_KEY",
    baseUrlKey: "OPENAI_BASE_URL",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4.1-mini",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    key: "DEEPSEEK_API_KEY",
    baseUrlKey: "DEEPSEEK_BASE_URL",
    defaultBaseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    key: "OPENROUTER_API_KEY",
    baseUrlKey: "OPENROUTER_BASE_URL",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4.1-mini",
  },
];

export function getProviders(env) {
  return registry
    .filter((item) => env[item.key])
    .map((item) => ({
      id: item.id,
      label: item.label,
      defaultModel: item.defaultModel,
    }));
}

export function resolveProvider(env, providerId) {
  const provider = registry.find((item) => item.id === providerId);

  if (!provider) {
    throw new Error(`未知 provider: ${providerId}`);
  }

  const apiKey = env[provider.key];
  if (!apiKey) {
    throw new Error(`Provider ${provider.label} 未配置 API key`);
  }

  return {
    ...provider,
    apiKey,
    baseUrl: env[provider.baseUrlKey] || provider.defaultBaseUrl,
  };
}
