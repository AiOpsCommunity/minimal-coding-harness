import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const defaultBaseUrl = "https://api.example.com/v1";
const defaultModel = "replace-with-model";
const baseUrl = (process.env.PI_RUNTIME_BASE_URL || defaultBaseUrl).replace(/\/+$/, "");
const model = process.env.PI_RUNTIME_MODEL || defaultModel;
const keyVariable = process.env.PI_RUNTIME_API_KEY_ENV || "MINIMAL_API_KEY";
const maxTokens = Number(process.env.PI_RUNTIME_MAX_TOKENS || 1200);

export default function (pi: ExtensionAPI) {
  pi.registerProvider("minimal", {
    name: "OpenAI-compatible API",
    baseUrl,
    api: "openai-completions",
    apiKey: `$${keyVariable}`,
    compat: {
      supportsDeveloperRole: false,
      maxTokensField: "max_tokens",
    },
    models: [{
      id: model,
      name: model,
      reasoning: false,
      input: ["text"],
      contextWindow: 131072,
      maxTokens,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    }],
  });
}
