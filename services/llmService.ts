import { AppConfig } from '../types';

export const processChunkWithLLM = async (
  text: string,
  config: AppConfig,
  prePrompt: string
): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("API Key is missing");
  }

  // Construct System Message: Base System Prompt + Pre-Prompt (if any)
  const systemContent = prePrompt 
    ? `${config.systemPrompt}\n\n${prePrompt}` 
    : config.systemPrompt;

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: text }
  ];

  // Remove trailing slash from baseUrl if present
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  const endpoint = `${baseUrl}/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: config.temperature,
        messages: messages,
        stream: false, // Not handling streaming for simplicity in this version
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new Error("Invalid response format from provider");
    }

    return content;
  } catch (error: any) {
    console.error("LLM Request Failed", error);
    throw new Error(error.message || "Unknown error occurred");
  }
};