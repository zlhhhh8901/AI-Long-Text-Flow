import { GoogleGenAI } from "@google/genai";
import { AppConfig } from '../types';

export const processChunkWithLLM = async (
  text: string,
  config: AppConfig,
  prePrompt: string
): Promise<string> => {
  if (!config.apiKey) {
    throw new Error("API Key is missing");
  }

  // Construct System Message Content
  // Filter out empty parts to avoid leading newlines or sending empty system messages
  const systemParts = [config.systemPrompt, prePrompt].filter(p => p && p.trim().length > 0);
  const systemContent = systemParts.join('\n\n');

  // --- Gemini Provider ---
  if (config.provider === 'gemini') {
    try {
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      
      const requestConfig: any = {
        temperature: config.temperature,
      };

      // Only add systemInstruction if content exists
      if (systemContent) {
        requestConfig.systemInstruction = systemContent;
      }

      const response = await ai.models.generateContent({
        model: config.model,
        contents: text,
        config: requestConfig,
      });
      return response.text || "";
    } catch (error: any) {
      console.error("Gemini Request Failed", error);
      throw new Error(error.message || "Gemini API Error");
    }
  }

  // --- OpenAI Provider (Default) ---
  
  const messages = [];
  
  // Only add system role if there is content
  if (systemContent) {
    messages.push({ role: 'system', content: systemContent });
  }
  
  messages.push({ role: 'user', content: text });

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