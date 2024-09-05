let OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export function setApiKey(apiKey) {
  OPENAI_API_KEY = apiKey;
}

export function getApiKey() {
  return OPENAI_API_KEY;
}
