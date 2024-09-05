import axios from "axios";
import { getApiKey } from "./apiKeyManager.js";

const OPENAI_API_BASE = "https://api.openai.com/v1";

const createOpenAIInstance = () => {
  const apiKey = getApiKey();
  return axios.create({
    baseURL: OPENAI_API_BASE,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "assistants=v2",
    },
  });
};

export default createOpenAIInstance;
